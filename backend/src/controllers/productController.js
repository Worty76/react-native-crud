const Product = require("../models/product");
const User = require("../models/user");
const { formidable } = require("formidable");
const path = require("path");
const fs = require("fs");

const read = async (req, res) => {
  const products = await Product.find({});

  res
    .status(200)
    .json({ message: "Successfully get products", data: products });
};

const create = async (req, res) => {
  try {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ message: "Error in file parsing" });
      }

      if (!fields.name[0] || !fields.price[0]) {
        return res.status(400).json({ message: "Name or price is required" });
      }

      const user = await User.findOne({ _id: req.user._id });
      if (!user) {
        return res.status(400).json({ message: "User does not exist" });
      }

      let imagePath = null;

      if (files.image && files.image.filepath) {
        const oldPath = files.image.filepath;
        const newFileName = `${Date.now()}_${files.image.originalFilename}`;
        const uploadDir = path.join(__dirname, "uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir);
        }

        const newPath = path.join(uploadDir, newFileName);

        fs.copyFileSync(oldPath, newPath);
        fs.unlinkSync(oldPath);
        imagePath = `/uploads/${newFileName}`;
      }

      const newProduct = new Product({
        name: fields.name[0],
        price: fields.price[0],
        image: imagePath,
        author: req.user._id,
      });

      await newProduct.save();
      res.json({ message: "Successfully created a product" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const update = async (req, res) => {
  const { name, price } = req.body;
  const { productId } = req.params;

  const user = User.findOne({ _id: req.user._id });

  if (!user) return res.status(400).json({ message: "User is not exist" });

  const newProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: { name: name, price: price } },
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Sucessfully updated a product", data: newProduct });
};

const deletePost = async (req, res) => {
  const { productId } = req.params;

  const newProduct = await Product.findByIdAndDelete(productId);
  res.status(200).json({ message: "Sucessfully deteled a product" });
};

const productController = { read, create, update, deletePost };

module.exports = productController;
