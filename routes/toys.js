const express = require("express");
const { auth } = require("../middlewares/auth");
const { ToysModel, validateToys } = require("../models/toysModel");
const router = express.Router();

// GET - בקשה כללית לצעצועים במערכת
// את הצעצועים PAGE של QUERY ישלוף לפי
// (10 הוא LIMIT כאשר ה)
router.get("/", async (req, res) => {
  try {
    //?limit=X&page=X&sort=X&reveres=yes
    const limit = 10;
    const page = req.query.page - 1 || 0;
    const data = await ToysModel.find({})
      .limit(limit)
      .skip(page * limit);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

//שלו INFO בקשה לחיפוש מוצר לפי השם או ה
router.get("/search/:name", async (req, res) => {
  try {
    //?limit=X&page=X&sort=X&reveres=yes
    const limit = 10;
    const page = req.query.page - 1 || 0;

    let filteFind = {};
    // בודק אם הגיע קווארי לחיפוש ?s=
    if (req.params.name) {
      // "i" - דואג שלא תיהיה בעיית קייססינסטיב
      const searchExp = new RegExp(req.params.name, "i");
      // יחפש במאפיין הטייטל או האינפו ברשומה
      filteFind = { $or: [{ name: searchExp }, { info: searchExp }] };
    }

    const data = await ToysModel.find(filteFind)
      .limit(limit)
      .skip(page * limit);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// בקשת צעצוע לפי קטגוריה
router.get("/category/:catname", async (req, res) => {
  try {
    //?limit=X&page=X&sort=X&reveres=yes
    const limit = 10;
    const page = req.query.page - 1 || 0;

    let filteFind = {};
    // בודק אם הגיע קווארי לחיפוש ?s=
    console.log(req);
    if (req.params.catname) {
      // "i" - דואג שלא תיהיה בעיית קייססינסטיב
      const searchExp = new RegExp(req.params.catname, "i");
      // יחפש במאפיין הטייטל או האינפו ברשומה
      filteFind = { category: searchExp };
    }
    const data = await ToysModel.find(filteFind)
      .limit(limit)
      .skip(page * limit);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// Get all the toys within the specified price range
router.get("/prices", async(req, res) => {
  try {
    const min = req.query.min;
    const max = req.query.max;
    const limit = req.query.limit || 10;
    const page = req.query.page - 1 || 0;

    if (!min || !max) return res.json({err: "You must provide a min and max query strings to access this endpoint."});
    
    const data = await ToysModel
    .find({ price:{$gte:min, $lte:max} })
    .limit(limit)
    .skip(page * limit)
    res.json(data);
  }
  catch(err) {
    console.log(err);
    res.status(502).json({err})
  }
})

// ישלוף רק רשומה אחת לפי איי די
router.get("/single/:id", async(req,res) => {
  try{
    const id = req.params.id
    let data = await ToysModel.findOne({_id:id});
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

//יחזיר את מספר הרשומות שיש בקולקשן
router.get("/count", async(req,res) => {
  try{
    const limit = req.query.limit || 10;
    const count = await ToysModel.countDocuments({})
    // pages: - יציג למתכנת צד לקוח כמה עמודים הוא צריך להציג סהכ
    res.json({count,pages:Math.ceil(count/limit)})
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

// הוספת צעצוע
router.post("/", auth, async (req, res) => {
  const validBody = validateToys(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const toys = new ToysModel(req.body);
    // להוסיף מאפיין של יוזר איי די לרשומה
    toys.userId = req.tokenData._id;
    await toys.save();
    res.status(201).json(toys);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// עריכת צעצוע
router.put("/:id", auth, async (req, res) => {
  const validBody = validateToys(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const id = req.params.id;
    // ,user_id:req.tokenData._id - דואג שרק בעל הרשומה יוכל
    // לשנות את הרשומה לפי הטוקן
    const data = await ToysModel.updateOne(
      { _id: id, userId: req.tokenData._id },
      req.body
    );
    // "modifiedCount": 1, אומר שהצליח כשקיבלנו
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// מחיקת צעצוע
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    // ,user_id:req.tokenData._id - דואג שרק בעל הרשומה יוכל
    // למחוק את הרשומה לפי הטוקן
    const data = await ToysModel.deleteOne({
      _id: id,
      userId: req.tokenData._id,
    });
    // "modifiedCount": 1, אומר שהצליח כשקיבלנו
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

module.exports = router;
