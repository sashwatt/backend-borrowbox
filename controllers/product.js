const Product = require("../models/product");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);  // Ensure the uploads directory exists
    }
    cb(null, uploadDir);  // Directory to store images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  }
});

const upload = multer({ storage: storage });  // Initialize multer with storage config

// Add a new product
const addProduct = async (req, res) => {
  const { name, description, price, quantity, status } = req.body;
  let imageUrl = "";  // Default to no image if not provided

  // Handle image upload and set the image path
  if (req.file) {
    imageUrl = `uploads/${req.file.filename}`;  // Save the image in the 'uploads' folder
  }

  try {
    // Create a new product with the provided details
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      status,
      image: imageUrl, // Attach the image path if an image is uploaded
    });

    await newProduct.save();  // Save the new product to the database

    // Send success response with the new product data
    res.status(201).json({
      message: "Product added successfully!",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Error adding product",
      error: error.message,
    });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();  // Fetch all products from the database

    // Include the full URL for the image in the response
    const productsWithImageUrls = products.map((product) => ({
      ...product.toObject(),
      imageUrl: `http://localhost:5000/${product.image}`,  // Correct URL path for image
    }));

    res.status(200).json(productsWithImageUrls);  // Return the products with image URLs
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Get a single product by its ID
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);  // Fetch the product by ID from the database

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send the product data with image URL
    res.status(200).json({
      ...product.toObject(),
      imageUrl: `http://localhost:5000/${product.image}`,  // Include full image URL
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity, status } = req.body;
  const updatedData = { name, description, price, quantity, status };

  try {
    // Get the existing product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.file) {
      // If there is a new image, delete the old one
      const oldImagePath = path.join(__dirname, "../uploads", product.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);  // Delete the old image
      }

      // Set the new image path
      updatedData.image = `uploads/${req.file.filename}`;
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send success response with updated product
    res.status(200).json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the product from the database
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the product image from the server
    if (product.image) {
      const imagePath = path.join(__dirname, "../uploads", product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);  // Delete the image
      }
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  upload,  // Don't forget to export multer upload middleware for routes
};