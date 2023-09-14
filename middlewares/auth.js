const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async(req,res,next) => {
  const token = req.header("x-api-key");
  
  if(!token){
    return res.status(401).json({err:"You need send token to this endpoint or url "})
  }
  try{
    const decodeToken = jwt.verify(token,process.env.TOKEN_SECRET);
    req.tokenData = decodeToken;
    next()
  }
  catch(err){
    console.log(err);
    res.status(502).json({err:"Token invalid or expired "})
  }
}