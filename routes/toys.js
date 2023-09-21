const express = require("express");
const { auth } = require("../middlewares/auth");
const { ToysModel, validateToys } = require("../models/toysModel");
const router = express.Router();

// General request for toys in the GET system
// will retrieve the toys according to PAGE's QUERY
// (when the LIMIT is 10)
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

//Request to search for a product by its name or INFO
router.get("/search/:name", async (req, res) => {
  try {
    //?limit=X&page=X&sort=X&reveres=yes
    const limit = 10;
    const page = req.query.page - 1 || 0;

    let filteFind = {};
    if (req.params.name) {
      // "i" - Make sure there is no caseinstinctive problem
      const searchExp = new RegExp(req.params.name, "i");
      // will search in the title or info property of the record
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

// Toy request by category
router.get("/category/:catname", async (req, res) => {
  try {
    //?limit=X&page=X&sort=X&reveres=yes
    const limit = 10;
    const page = req.query.page - 1 || 0;

    let filteFind = {};
    console.log(req);
    if (req.params.catname) {
      // "i" - Make sure there is no caseinstinctive problem
      const searchExp = new RegExp(req.params.catname, "i");
      // will search the title or info property in the record
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
    const min = req.query.min || 0;
    const max = req.query.max || Infinity;
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

// will only retrieve one record according to the ID of the toy
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

// will return the number of records in the collection
router.get("/count", async(req,res) => {
  try{
    const limit = req.query.limit || 10;
    const count = await ToysModel.countDocuments({})
    // pages: - Will show the client side programmer how many pages he needs to show in total
    res.json({count,pages:Math.ceil(count/limit)})
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

// Add a toy
router.post("/", auth, async (req, res) => {
  const validBody = validateToys(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const toys = new ToysModel(req.body);
    // Add a User ID attribute to the record
    toys.userId = req.tokenData._id;
    await toys.save();
    res.status(201).json(toys);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// Toy editing
router.put("/:id", auth, async (req, res) => {
  const validBody = validateToys(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const id = req.params.id;
    // ,user_id:req.tokenData._id - Ensures that only the owner 
    // of the record can change the record according to the token
    const data = await ToysModel.updateOne(
      { _id: id, userId: req.tokenData._id },
      req.body
    );
    // "modifiedCount": 1, - Says it was successful when we got at least 
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// Deleting a toy
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    // ,user_id:req.tokenData._id - Ensures that only the owner of the 
    // record can delete the record according to the token
    const data = await ToysModel.deleteOne({
      _id: id,
      userId: req.tokenData._id,
    });
    // "modifiedCount": 1, - Says it was successful when we got at least 
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

module.exports = router;
