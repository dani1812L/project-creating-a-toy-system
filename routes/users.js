const express = require("express");
// ספרייה להצפנה חד כיוונית במיוחד של סיסמאות
const bcrypt = require("bcrypt");
const {
  UserModel,
  validateUser,
  validateLogin,createToken
} = require("../models/userModel");
const router = express.Router();

// הרשמה
router.post("/singup", async (req, res) => {
  // בודק שהבאדי שנשלח מצד הלקוח תקין לפי הסכימה
  const validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const user = new UserModel(req.body);
    // נצפין את הסיסמא של המשתמש
    // 10 - רמת הצפנה
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    // 201 -> שיש הצלחה ונוספה רשומה
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// התחברות + אוטנטיקציה
router.post("/login", async (req, res) => {
  const validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    // נבדוק אם המייל של המשתמש בכלל קיים במערכת
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ err: "Email not found!" });
    }
    // נבדוק אם הסיסמא שמהבאדי תואמת לסיסמא המוצפנת ברשומה שמצאנו עם המייל
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return res.status(401).json({ err: "Password not match" });
    }

    // נשלח טוקן
    const token = createToken(user.id);
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// התנתקות
router.post("/logout", (req, res) => {
  res.clearCookie(token);
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
