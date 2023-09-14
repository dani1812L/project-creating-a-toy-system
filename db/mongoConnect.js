const mongoose = require("mongoose");
// דואג שנוכל לקרוא משתנים מה ENV
require("dotenv").config();

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_CONNECT);
  console.log("mongo connect market");
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
