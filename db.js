const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: process.env.CONNECTION_LIMIT,
  password: process.env.DB_PASS,
  user: process.env.DB_USER,
  database: process.env.MYSQL_DB,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

let db = {};

db.allUser = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM karyawan ", (error, users) => {
      if (error) {
        return reject(error);
      }
      return resolve(users);
    });
  });
};

db.getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM admin WHERE username = ?",
      [username],
      (error, users) => {
        if (error) {
          return reject(error);
        }
        return resolve(users[0]);
      }
    );
  });
};

db.insertUser = (userName, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO admin (username, password) VALUES (?,  ?)",
      [userName, password],
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result.insertId);
      }
    );
  });
};

module.exports = db;
