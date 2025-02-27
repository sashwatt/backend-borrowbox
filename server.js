const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize"); // for SQL injection prevention
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const app = express();
const product = require("./routes/product"); // Import product routes
const dashboard = require("./routes/dashboardRoutes")

app.use(cors());
app.options("*", cors());
app.use(express.json()); // Only use express.json(), not bodyParser.json()

// Load env file
dotenv.config({
  path: "./config/config.env",
});

// Connect to database
connectDB();

// Route files
const auth = require("./routes/customer");
app.use("/api/v1/auth", auth); // Mount the authentication routes
app.use("/api/admin", dashboard);
// For serving image uploads
// Ensure that images are being served from the correct 'uploads' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Body parser
app.use(cookieParser()); // Keep cookie parser

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Set static folder for general static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "public"))); // Static files folder

// Mount product routes (updated to handle all product-related actions)
app.use("/api/products", product); // Handle all routes for products (GET, POST, PUT, DELETE)

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});


