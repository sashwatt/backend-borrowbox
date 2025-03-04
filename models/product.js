const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Available', 'Low Stock', 'Out of Stock'] },
    image: { type: String, required: false } // Store the image path
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);