const multer = require("multer");
const path = require("path");
const fs = require("fs");  // For directory check and creation

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads");

    // Ensure the 'uploads' directory exists, if not create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
    }

    cb(null, uploadDir); // Directory to store images
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, `PRODUCT-${Date.now()}${ext}`); // Unique filename with timestamp
  },
});

const imageFileFilter = (req, file, cb) => {
  // Allow only specific image types
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("File format not supported. Only .jpg, .jpeg, .png, and .gif are allowed."), false);
  }
  cb(null, true);
};

// Correctly define the upload middleware
const uploadProductImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max size
}).single("image"); // Use "image" to match the frontend field name

module.exports = { uploadProductImage }; // Export as an object
