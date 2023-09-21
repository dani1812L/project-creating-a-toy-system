const express = require("express");
const bcrypt = require("bcrypt");
const {
  UserModel,
  validateUser,
  validateLogin,
  createToken,
} = require("../models/userModel");
const router = express.Router();

router.post("/singup", async (req, res) => {
  const validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    user.password="*****";
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.post("/login", async (req, res) => {
  const validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ err: "Email not found!" });
    }
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return res.status(401).json({ err: "Password not match" });
    }

    const token = createToken(user.id);
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(token);
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
