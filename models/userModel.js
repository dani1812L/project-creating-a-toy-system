const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role:{
    type:String, default:"user"
  }
},{timestamps:true});
 

exports.UserModel = mongoose.model("users", userSchema);

exports.createToken = (userId) => {
  const token = jwt.sign({ _id: userId }, process.env.TOKEN_SECRET, {
    expiresIn: "60mins",
  });
  return token;
};

exports.validateUser = (_reqBody) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(3).max(16).required(),
    role: Joi.string().min(3).max(150).required(),
  });
  return joiSchema.validate(_reqBody);
};

// Waldzation to connect
exports.validateLogin = (_reqBody) => {
  const joiSchema = Joi.object({
    email: Joi.string().min(2).max(150).email().required(),
    password: Joi.string().min(3).max(16).required(),
  });
  return joiSchema.validate(_reqBody);
};
