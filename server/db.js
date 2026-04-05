// db.js
const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection(process.env.MYSQL_PUBLIC_URL);

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully (railway)");
  }
});

module.exports = db;