const productModel = require('../models/productModel')
const { validateObjectId } = require('../validators/validator')



const productsListing = async (req, res) => {
    try {
        const product = req.data

        const products = await productModel.create(product)
        return res.status(201).send({ status: false, message: "Product created successfully", data: products })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}
// =========================================================get api=========================>
const getProductDetails = async function (req, res) {
  try {
    let data = req.query;
    let filter = { isDeleted: false };

    // validation for the empty body
    if (isValidRequest(data)) {
      let { size, name, priceGreaterThan, priceLessThan, priceSort } = data;

      // validation for size
      if (size) {
        size = size.toUpperCase();
        if (!isValidSizes(size)) {
          let givenSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
          return res.status(400).send({
            status: false,
            message: `size should be one these only ${givenSizes}`,
          });
        } else {
          size = size.split(",");
          filter.availableSizes = { $in: size };
        }
      }
      // validation for name
      if (name) {
        if (!isValid(name))
          return res
            .status(400)
            .send({ status: false, message: "Product title is required" });
        if (!alphaNumericValid(name))
          return res
            .status(400)
            .send({ status: false, message: "Product title should be valid" });

        filter.title = { $regex: name }; // check the substring
      }

      // validation for price
      if (priceGreaterThan || priceLessThan) {
        filter.price = {};

        if (priceGreaterThan) {
          if (isNaN(priceGreaterThan))
            return res.status(400).send({
              status: false,
              message: "priceGreaterThan is required and should be valid",
            });

          priceGreaterThan = Number(priceGreaterThan);
          filter.price.$gte = priceGreaterThan;
        }
        if (priceLessThan) {
          if (isNaN(priceLessThan))
            return res.status(400).send({
              status: false,
              message: "priceLessThan  is required and should be valid",
            });

          priceLessThan = Number(priceLessThan);
          filter.price.$lte = priceLessThan;
        }
      }

      if (priceGreaterThan && priceLessThan && priceGreaterThan > priceLessThan)
        return res
          .status(400)
          .send({ status: false, message: "Invalid price range" });

      // validation for price sorting
      if (priceSort) {
        if (!(priceSort == 1 || priceSort == -1)) {
          return res.status(400).send({
            status: false,
            message: "In price sort it contains only 1 & -1",
          });
        }

        const products = await ProductModel.find(filter).sort({
          price: priceSort,
        });

        if (!products)
          return res
            .status(404)
            .send({ status: false, message: "No products found" });
        return res
          .status(200)
          .send({ status: true, message: "Success", data: products });
      }
    }

    // find collection without filters
    const findData = await ProductModel.find(filter).sort({ price: 1 });
    if (findData.length == 0)
      return res
        .status(404)
        .send({ status: false, message: "No products found" });

    return res
      .status(200)
      .send({ status: true, message: "Success", data: findData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
// =========================================================get api=========================>

const getproductById = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!productId) return res.status(400).send({ status: false, message: "productId is required" })
        if (!validateObjectId(productId)) return res.status(400).send({ status: false, message: "productId must be valid" })

        const product = await productModel.findById(productId)
        if (!product || product.isDeleted == true) return res.status(404).send({ status: false, message: "product not found" })

        return res.status(200).send({ status: true, message: 'Success', data: product })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const updateProduct = async function (req, res) {
    try {
        const productId = req.params.productId
        const product = req.data

        const products = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, {
            $set: {
                title: product.title,
                description: product.description,
                price: product.price,
                isFreeShipping: product.isFreeShipping,
                productImage: product.productImage,
                style: product.style,
                installments: product.installments,
            },
            "$addToSet": { availableSizes: product.availableSizes },
        }, { new: true })

        return res.status(201).send({ status: false, message: "Product updated successfully", data: products })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId

        if (!validateObjectId(productId)) return res.status(400).send({ status: false, message: "productId must be present and valid" })

        const product = await productModel.findById(productId)
        if (!product) return res.status(404).send({ status: false, message: "No product found" })
        if (product.isDeleted === true) return res.status(400).send({ status: false, message: "product is already deleted" })

        product.isDeleted = true
        await product.save()
        return res.status(200).send({ status: true, message: "Product is successfully deleted" })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}


module.exports = { productsListing, getproductById, updateProduct, deleteProduct, getProductDetails}
