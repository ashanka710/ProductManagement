const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const { validateObjectId } = require('../validators/validator')


const createCart = async (req, res) => {
  try {
    const userId = req.params.userId
    const data = req.body

    let { cartId, productId, quantity } = data


    if (!productId || !validateObjectId(productId)) return res.status(404).send({ status: false, message: "productId must be present and valid" })

    if (cartId || (!cartId && cartId != undefined)) {
      if (!cartId || !validateObjectId(cartId)) return res.status(404).send({ status: false, message: "cartId must be valid and non empty" })
    }


    const product = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
    if (!product) return res.status(404).send({ status: false, message: `No product found with this id: ${productId}` })

    if (quantity) {
      quantity = JSON.parse(quantity)
      if (typeof quantity != "number") return res.status(400).send({ status: false, message: "quantity should be in number only" })
      quantity = Math.ceil(quantity)
    }

    let cart = await cartModel.findOne({ _id: cartId })
    if (!cart) {
      const user = await cartModel.findOne({ userId: userId })
      if (user) return res.status(400).send({ status: false, message: `cart has already been created from this userId: ${userId}, please provide cartId also` })
      cart = new cartModel({
        userId: userId,
        items: [{
          productId: productId,
          quantity: (quantity || 1)
        }],
        totalPrice: (quantity || 1) * product.price,
        totalItems: 1,
      })
      const createdCart = await cart.save()
      const resData = await createdCart.populate({
        path: "items.productId",
        select: {
          _id: 1,
          title: 1,
          description: 1,
          price: 1,
          productImage: 1,
          style: 1,
        },
      })
      return res.status(201).send({ status: true, message: "Success", data: resData })
    } else {
      for (let i = 0; i < cart.items.length; i++) {
        if (cart.items[i].productId == productId) {
          cart.items[i].quantity += (quantity || 1)
          cart.totalPrice += (quantity || 1) * product.price
          const createdCart = await cart.save()
          const resData = await createdCart.populate({
            path: "items.productId",
            select: {
              _id: 1,
              title: 1,
              description: 1,
              price: 1,
              productImage: 1,
              style: 1,
            },
          })
          return res.status(201).send({ status: true, message: "Success", data: resData })
        }
      }
      const pushedCart = await cartModel.findOneAndUpdate({ _id: cartId }, {
        $push: { "items": { productId: productId, quantity: (quantity || 1) } },
        $inc: { totalItems: 1, "totalPrice": (quantity || 1) * product.price }
      }, { new: true }).populate({
        path: "items.productId",
        select: {
          _id: 1,
          title: 1,
          description: 1,
          price: 1,
          productImage: 1,
          style: 1,
        },
      })
      return res.status(201).send({ status: true, message: "Success", data: pushedCart })
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


const updateCart = async function (req, res) {
  try {
    const userId = req.params.userId;
    const data = req.body;
    let { cartId, productId, removeProduct } = data

    // checking body for empty or not
    if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Request body cannot remain empty" });

    // validation for productId
    if (!productId || !validateObjectId(productId)) return res.status(404).send({ status: false, message: "productId must be present and valid" })

    const searchProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!searchProduct) return res.status(404).send({ status: false, message: `Product details are not found with this productId: ${productId}, it must be deleted or not exists` });

    // validation for cartId
    if (!cartId || !validateObjectId(cartId)) return res.status(404).send({ status: false, message: "cartId must be present and valid" })

    //checking cart details available or not
    const searchCart = await cartModel.findOne({ _id: cartId, userId: userId });
    if (!searchCart) return res.status(404).send({ status: false, message: `Your's cartId: ${cartId} does not match with this userId: ${userId}, please provide correct cartId` });

    if (removeProduct != 0 && !removeProduct) return res.status(404).send({ status: false, message: "removeProduct must be present" });

    //check for the empty items i.e., cart is now empty
    if (searchCart.items.length == 0) return res.status(400).send({ status: false, message: "You have not added any products in your cart" });

    let cart = searchCart.items;
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].productId == productId) {
        const priceChange = cart[i].quantity * searchProduct.price;

        // directly remove a product from the cart irrespective of its quantity
        if (removeProduct == 0) {
          const productRemove = await cartModel.findOneAndUpdate({ _id: cartId }, {
            $pull: { items: { productId: productId } },
            totalPrice: searchCart.totalPrice - priceChange,
            totalItems: searchCart.totalItems - 1,
          }, { new: true }).populate({
            path: "items.productId",
            select: {
              _id: 1,
              title: 1,
              description: 1,
              price: 1,
              productImage: 1,
              style: 1,
            },
          })
          return res.status(200).send({ status: true, message: "Success", data: productRemove });
          // remove the product when its quantity is 1
        } else if (removeProduct == 1) {
          if (cart[i].quantity == 1 && removeProduct == 1) {
            const priceUpdate = await cartModel.findOneAndUpdate({ _id: cartId }, {
              $pull: { items: { productId } },
              totalPrice: searchCart.totalPrice - priceChange,
              totalItems: searchCart.totalItems - 1,
            }, { new: true }).populate({
              path: "items.productId",
              select: {
                _id: 1,
                title: 1,
                description: 1,
                price: 1,
                productImage: 1,
                style: 1,
              },
            })
            return res.status(200).send({ status: true, message: "Success", data: priceUpdate });
          }

          // decrease the products quantity by 1
          cart[i].quantity = cart[i].quantity - 1;
          const updatedCart = await cartModel.findByIdAndUpdate({ _id: cartId }, {
            items: cart,
            totalPrice: searchCart.totalPrice - searchProduct.price,
          }, { new: true }).populate({
            path: "items.productId",
            select: {
              _id: 1,
              title: 1,
              description: 1,
              price: 1,
              productImage: 1,
              style: 1,
            },
          })
          return res.status(200).send({ status: true, message: "Success", data: updatedCart });
        } else {
          return res.status(400).send({ status: false, message: "removeproduct must be present and valid it can be only 0 & 1" });
        }
      }
    }
    return res.status(400).send({ status: false, message: "product is not availabe to remove it" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}



const getCart = async (req, res) => {
  try {
    const userId = req.params.userId;

    const userCart = await cartModel.findOne({ userId: userId }).populate({
      path: "items.productId",
      select: {
        _id: 1,
        title: 1,
        description: 1,
        price: 1,
        productImage: 1,
        style: 1,
      },
    });
    if (!userCart) {
      return res.status(404).send({ status: false, message: "no cart Found" });
    }

    res.status(200).send({ status: true, message: "Success", data: userCart });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId = req.params.userId

    const cart = {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };

    const updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, cart)
    if (!updatedCart) {
      return res.status(404).send({ status: false, message: "No cart Found" });
    }
    return res.status(204).send({ status: true, message: "cart is deleted" });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
}



module.exports = { createCart, updateCart, getCart, deleteCart, }