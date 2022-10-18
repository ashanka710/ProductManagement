const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const { validateObjectId } = require('../validators/validator')


const createCart = async(req, res) => {
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

            if(quantity){
              quantity = JSON.parse(quantity)
              if(typeof quantity !=  "number") return res.status(400).send({status: false, message: "quantity should be in number only"})
              quantity = Math.ceil(quantity)
            }

            let cart = await cartModel.findOne({ _id: cartId })
            if (!cart) {
                const user = await cartModel.findOne({ userId: userId })
                if (user) return res.status(400).send({ status: false, message: `cart has already been created from this ${userId}, please provide cartId also` })
                cart = new cartModel({
                    userId: userId,
                    items: [{
                        productId: productId,
                        quantity: (quantity || 1)
                    }],
                    totalPrice: (quantity || 1) * product.price,
                    totalItems: 1,
                })
                await cart.save()
                return res.status(201).send({ status: true, message: "Cart created successfully", data: cart })
            } else {
                for (let i = 0; i < cart.items.length; i++) {
                    if (cart.items[i].productId == productId) {
                        cart.items[i].quantity += (quantity || 1)
                        cart.totalPrice += (quantity || 1) * product.price
                        await cart.save()
                        return res.status(200).send({ status: true, message: "product added in cart", data: cart })
                    }
                }
                const pushedCart = await cartModel.findOneAndUpdate({ _id: cartId }, {
                    $push: { "items": { productId: productId, quantity: (quantity || 1) } },
                    $inc: { totalItems: 1, "totalPrice": (quantity || 1) * product.price }
                }, { new: true })
                return res.status(201).send({ status: true, message: "product pushed in cart", data: pushedCart })
            }
        } catch (error) {
            return res.status(500).send({ status: false, message: error.message })
        }
    }
 
    //=====================================================Update Api===================================================================>
const updateCart = async function(req, res) {
    try {
        userId = req.params.userId;

        // validation for userId
        if (!isValidObjectId(userId))
            return res
                .status(400)
                .send({ status: false, message: `${userId} is invalid` });

        // seaarching the user Id
        const searchUser = await UserModel.findOne({ _id: userId });
        if (!searchUser)
            return res
                .status(404)
                .send({ status: false, message: "User does not exist" });

        //Authorization
        if (req.decodedToken != userId)
            return res
                .status(403)
                .send({ status: false, message: "Error, authorization failed" });

        const data = req.body;
        let { cartId, productId, removeProduct } = data;

        // checking body for empty or not
        if (!isValidRequest(data))
            return res
                .status(400)
                .send({ status: false, message: "Request body cannot remain empty" });

        // validation for productId
        if (!isValid(productId))
            return res
                .status(400)
                .send({ status: false, message: "Please provide productId" });
        if (!isValidObjectId(productId))
            return res.status(400).send({
                status: false,
                message: `The given productId: ${productId} is not in proper format`,
            });

        const searchProduct = await ProductModel.findOne({
            _id: productId,
            isDeleted: false,
        });
        if (!searchProduct)
            return res.status(404).send({
                status: false,
                message: `Product details are not found with this productId: ${productId}, it must be deleted or not exists`,
            });

        // validation for cartId
        if (!isValid(cartId))
            return res
                .status(400)
                .send({ status: false, message: "Please provide cartId" });
        if (!isValidObjectId(cartId))
            return res.status(400).send({
                status: false,
                message: `The given cartId: ${cartId} is not in proper format`,
            });

        //checking cart details available or not
        const searchCart = await CartModel.findOne({ _id: cartId });
        if (!searchCart)
            return res.status(404).send({
                status: false,
                message: `Cart does not exists with this provided cartId: ${cartId}`,
            });

        //check for the empty items i.e., cart is now empty
        if (searchCart.items.length == 0)
            return res.status(400).send({
                status: false,
                message: "You have not added any products in your cart",
            });

        // validatiion for removeProduct
        if (!isValid(removeProduct))
            return res
                .status(400)
                .send({ status: false, message: "removeProduct is required" });
        if (!isValidremoveProduct(removeProduct))
            return res.status(400).send({
                status: false,
                message: "Enter valid removeproduct it can be only be '0' & '1'",
            });

        let cart = searchCart.items;
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].productId == productId) {
                const priceChange = cart[i].quantity * searchProduct.price;

                // directly remove a product from the cart ireespective of its quantity
                if (removeProduct == 0) {
                    const productRemove = await CartModel.findOneAndUpdate({ _id: cartId }, {
                        $pull: { items: { productId: productId } },
                        totalPrice: searchCart.totalPrice - priceChange,
                        totalItems: searchCart.totalItems - 1,
                    }, { new: true });
                    return res
                        .status(200)
                        .send({ status: true, message: "Success", data: productRemove });
                }

                // remove the product when its quantity is 1
                if (removeProduct == 1) {
                    if (cart[i].quantity == 1 && removeProduct == 1) {
                        const priceUpdate = await CartModel.findOneAndUpdate({ _id: cartId }, {
                            $pull: { items: { productId } },
                            totalPrice: searchCart.totalPrice - priceChange,
                            totalItems: searchCart.totalItems - 1,
                        }, { new: true });
                        return res
                            .status(200)
                            .send({ status: true, message: "Success", data: priceUpdate });
                    }

                    // decrease the products quantity by 1
                    cart[i].quantity = cart[i].quantity - 1;
                    const updatedCart = await CartModel.findByIdAndUpdate({ _id: cartId }, {
                        items: cart,
                        totalPrice: searchCart.totalPrice - searchProduct.price,
                    }, { new: true });
                    return res
                        .status(200)
                        .send({ status: true, message: "Success", data: updatedCart });
                }
            }
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
//==================================================================================================================================>

const getCart = async(req, res) => {
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

const deleteCart = async(req, res) => {
    try {
        const userId = req.params.userId

        const cart = {
            items: [],
            totalItems: 0,
            totalPrice: 0,
        };

        const updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, cart);
        if (!updatedCart) {
            return res.status(404).send({ status: false, message: "No cart Found" });
        }
        return res.status(201).send({ status: true, message: "cart is deleted" });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}



module.exports = { createCart, getCart, deleteCart, }