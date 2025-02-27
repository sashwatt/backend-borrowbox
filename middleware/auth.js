const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const Customer = require("../models/customer");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the authorization header contains the Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }

  // Ensure token exists
  if (!token) {
    return res.status(401).json({ message: "Not authorized to access this route" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the customer by ID from the token
    req.customer = await Customer.findById(decoded.id);

    // If no customer is found, respond with an error
    if (!req.customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: "Not authorized to access this route" });
  }
});

// Grant access to specific roles (e.g., publisher, admin)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the customer's role matches any of the authorized roles
    if (!roles.includes(req.customer.role)) {
      return res.status(403).json({
        message: `Customer role ${req.customer.role} is not authorized to access this route`,
      });
    }
    next(); // Proceed if the role is authorized
  };
};
