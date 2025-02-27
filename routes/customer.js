const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const { uploadProductImage } = require("../middleware/multer");

const {
  getCustomers,
  getCustomer,
  register,
  login,
  uploadImage,
  deleteCustomer,  // Include the deleteCustomer function here
} = require("../controllers/customer");

// Image Upload Route
router.post("/uploadImage", uploadProductImage, uploadImage);

// User Authentication Routes
router.post("/register", register);
router.post("/login", login);

// Customer Data Routes
router.get("/getCustomer", protect, getCustomer);
router.get("/getAllCustomers", getCustomers);

// Delete Customer Route
router.delete("/deleteCustomer/:id", protect, deleteCustomer);  // Added route for delete

module.exports = router;
