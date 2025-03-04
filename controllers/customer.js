const asyncHandler = require("../middleware/async");
const Customer = require("../models/customer");
const path = require("path");
const fs = require("fs");
const Customers = require("../models/customer");
const nodemailer = require('nodemailer');

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private
exports.getCustomers = asyncHandler(async (req, res, next) => {
  const customers = await Customers.find({});
  res.status(200).json({
    success: true,
    count: customers.length,
    data: customers,
  });
});

// @desc    Get single customer
// @route   GET /api/v1/customers/:id
// @access  Private
exports.getCustomer = asyncHandler(async (req, res, next) => {
  const customer = req.customer ?? await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({
      message: `Customer not found with id of ${req.params.id}`,
    });
  } else {
    res.status(200).json({
      success: true,
      data: customer,
    });
  }
});

// @desc    Create new customer
// @route   POST /api/v1/customers
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { fName, email, password } = req.body;

  // Check if the customer already exists
  const customer = await Customer.findOne({ email });
  if (customer) {
    return res.status(400).send({ message: "Customer already exists" });
  }

  // Create a new customer object
  const newCustomer = new Customer({
    fName,
    email,
    password,
  });

  // Save the customer to the database
  await newCustomer.save();


  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "supersashwat@gmail.com",
      pass: "sxoe avkj rzse lqsn" // Replace with your App Password
    }
  });

  // Email Content
  const mailOptions = {
    from: '"Borrowbox" <supersashwat@gmail.com@gmail.com>',
    to: newCustomer.email,
    subject: "Account Created Successfully",
    html: `
      <h1>Welcome to Borrowbox</h1>
      <p>Your account has been created successfully.</p>
      <p><strong>User ID:</strong> ${newCustomer._id}</p>
    `
  };

  // Send email
  await transporter.sendMail(mailOptions);



  // Return success response after saving the customer
  res.status(201).json({
    success: true,
    message: "Customer created successfully",
  });
});

// @desc   Login customer
// @route  POST /api/v1/customers/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide an email and password" });
  }

  // Check if customer exists
  const customer = await Customer.findOne({ email }).select("+password");

  if (!customer || !(await customer.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  sendTokenResponse(customer, 200, res);
});

// @desc    Delete a customer
// @route   DELETE /api/v1/customers/:id
// @access  Private
exports.deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found with that id" });
  }

  // Delete the customer
  await customer.remove();

  res.status(200).json({
    success: true,
    message: "Customer deleted successfully",
  });
});

//=========================== Searching ===========================

// @desc    Search customer by any criterion
// @route   GET /api/v1/customers/search/:query
// @access  Private
exports.searchCustomer = asyncHandler(async (req, res, next) => {
  const query = req.params.query;
  const customers = await Customer.find({
    $or: [
      { fName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ]
  });

  if (customers.length === 0) {
    return res.status(404).json({ message: "No customers found" });
  }

  res.status(200).json({
    success: true,
    count: customers.length,
    data: customers,
  });
});

// @desc    Upload Single Image
// @route   POST /api/v1/auth/upload
// @access  Private
exports.uploadImage = asyncHandler(async (req, res, next) => {
  // If you want to limit file size, you can uncomment the following lines
  // if (req.file.size > process.env.MAX_FILE_UPLOAD) {
  //   return res.status(400).send({
  //     message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
  //   });
  // }

  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

// Get token from model, create cookie, and send response
const sendTokenResponse = (Customer, statusCode, res) => {
  const token = Customer.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Cookie security is false. Use only in development environment.
  if (process.env.NODE_ENV === "prod") {
    options.secure = true; // Only for https
  }
  res
    .status(statusCode)
    .cookie("token", token, options) // Send cookie with the token
    .json({
      success: true,
      token,
    });
};