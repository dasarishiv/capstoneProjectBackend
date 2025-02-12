const express = require("express");

const reviewRouter = express.Router();
const reviewModel = require("../models/reviewModel");
const { protectRoute } = require("../controllers/authController");
const productModel = require("../models/productModel");
const { checkInput } = require("../utils/crudFactory");

reviewRouter.post("/:productId", protectRoute, checkInput, async (req, res) => {
  /**
   * get the product id from params
   * get the user id from req.userId
   * get the review from req.body
   * update the average rating of the product
   * create a review
   * produt mpodel update the review
   */
  try {
    const userId = req.userId;
    const productId = req.params.productId;
    let { review, rating } = req.body; // rating: 3
    rating = parseInt(rating);

    const reviewObj = await reviewModel.create({
      review,
      rating,
      user: userId,
      product: productId
    });
    /** update the product reviews */
    const productObj = await productModel.findById(productId);
    const averageRating = productObj.averageRating; // 5
    if (averageRating) {
      /** update the rating by considering the new rating */
      const sum = averageRating * productObj.reviews.length; // 5 * 1
      const finalRating = (sum + rating) / (productObj.reviews.length + 1); // (5 + 3) / 2
      productObj.averageRating = finalRating; // 4
    } else {
      productObj.averageRating = Math.round(rating, 0);
    }
    productObj.reviews.push(reviewObj._id);

    await productObj.save();
    res.status(200).json({
      message: "review created successfully",
      reviewObj
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

reviewRouter.get("/:productId", async (req, res) => {});

module.exports = reviewRouter;
