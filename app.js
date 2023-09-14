// ספריית אקספרס עם כל היכולות
const express = require("express");
// מבצע מינפולציות על כתובות אינטרנט
const path = require("path");
// ספרייה שיודעת להפעיל שרת
const http = require("http");

const { routesInit } = require("./routes/configRoutes");
require("./db/mongoConnect");

const app = express();

// מאפשר לקבל באדי בבקשות פוסט
app.use(express.json());
// מגדיר שתקיית פאבליק וכל הקבצים בה יהיו ציבוריים
app.use(express.static(path.join(__dirname, "public")));
// פונקציה שאחראית להגדיר את כל הרואטים שנייצר באפלקציית שרת
routesInit(app);

const server = http.createServer(app);
// בודק באיזה פורט להריץ את השרת  , אם בשרת אמיתי אוסף
// את המשתנה פורט מהסביבת עבודה שלו ואם לא 3001
const port = process.env.PORT || 3001;
server.listen(port);
