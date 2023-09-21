const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
  name: String,
  info: String,
  category: String,
  img_url: String,
  price: Number,
  userId: String,
  date_created: {
    type: Date,
    default: Date.now,
  },
});
exports.ToysModel = mongoose.model("toys", schema);

exports.validateToys = (_reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    info: Joi.string().min(2).max(150).required(),
    category: Joi.string().min(2).max(150).required(),
    img_url: Joi.allow(null,""),
    price: Joi.number().min(1).max(99999).required(),
    userId: Joi.string().min(2).max(150).required(),
  });
  return joiSchema.validate(_reqBody);
};
