const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

// Set up storage engine for Multer to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads' folder exists before uploading files
    cb(null, "uploads/"); // Store images in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
  },
});

// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true); // Accept the file
  } else {
    cb(new Error("Only image files are allowed!"), false); // Reject the file
  }
};

// Initialize multer with storage and file filter settings
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

const router = express.Router();

// Serve images from the 'uploads' folder
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Route to add a product (with image upload)
router.post("/add", upload.single("image"), addProduct);

// Route to get all products
router.get("/", getProducts);

// Route to get a specific product by its ID (for editing)
router.get("/:id", getProductById);

// Route to update a product (with image upload)
router.put("/update/:id", upload.single("image"), updateProduct);

// Route to delete a product by its ID
router.delete("/:id", deleteProduct);  // Corrected route to match controller

// Global error handling middleware for file upload errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message }); // Multer error
  } else if (err) {
    return res.status(400).json({ message: err.message }); // Custom error (file validation)
  }
  next(); // Pass on to the next middleware if no errors
});

module.exports = router;