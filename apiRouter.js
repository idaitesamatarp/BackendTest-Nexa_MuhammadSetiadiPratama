const express = require("express");
const apiRouter = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const db = require("./db");
const cookieParser = require("cookie-parser");
const Crypto = require("crypto");

const userRouter = require("./user");

apiRouter.use(cookieParser());

const secret_key = "nexatest";
const secret_iv = "smthg";
const encryptionMethod = "AES-256-CBC";
const key = Crypto.createHash("sha512")
  .update(secret_key, "utf-8")
  .digest("hex")
  .substring(0, 32);
const iv = Crypto.createHash("sha512")
  .update(secret_iv, "utf-8")
  .digest("hex")
  .substring(0, 16);

function encrypt_string(plain_text, encryptionMethod, secret, iv) {
  var encryptor = Crypto.createCipheriv(encryptionMethod, secret, iv);
  var aes_encrypted =
    encryptor.update(plain_text, "utf-8", "binary") + encryptor.final("binary");
  return Buffer.from(aes_encrypted).toString("binary");
}

function decrypt_string(encryptedMessage, encryptionMethod, secret, iv) {
  const buff = Buffer.from(encryptedMessage, "binary");
  encryptedMessage = buff.toString("utf-8");

  var decryptor = Crypto.createDecipheriv(encryptionMethod, secret, iv);
  console.log("encryptedMessage", encryptedMessage.length);
  console.log("secret", secret);
  console.log("iv", iv);

  return (
    decryptor.update(encryptedMessage, "binary", "utf-8") +
    decryptor.final("utf-8")
  );
}

apiRouter.post("/register", async (req, res, next) => {
  try {
    const userName = req.body.userName;
    let password = req.body.password;

    if (!userName || !password) {
      return res.sendStatus(400);
    }

    password = encrypt_string(password, encryptionMethod, key, iv);

    const user = await db.insertUser(userName, password);

    const jsontoken = jsonwebtoken.sign(
      { user: user },
      process.env.SECRET_KEY,
      { expiresIn: "30m" }
    );
    res.cookie("token", jsontoken, {
      httpOnly: true,
      secure: true,
      SameSite: "strict",
      expires: new Date(Number(new Date()) + 30 * 60 * 1000),
    }); //we add secure: true, when using https.

    res.json({ token: jsontoken });

    //return res.redirect('/mainpage');
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
});

apiRouter.post("/login", async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    user = await db.getUserByUsername(username);

    if (!user) {
      return res.json({
        message: "User not found !",
      });
    }

    convertCryptKey(user.password);

    const isValidPassword = decrypt_string(
      user.password,
      encryptionMethod,
      key,
      iv
    );

    if (isValidPassword == password) {
      user.password = undefined;
      const jsontoken = jsonwebtoken.sign(
        { user: user },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.cookie("token", jsontoken, {
        httpOnly: true,
        secure: true,
        SameSite: "strict",
        expires: new Date(Number(new Date()) + 30 * 60 * 1000),
      }); //we add secure: true, when using https.

      res.json({ token: jsontoken });
      //return res.redirect('/mainpage') ;
    } else {
      return res.json({
        message: "Invalid username or password !",
      });
    }
  } catch (e) {
    console.log(e);
  }
});

//  Verify Token
async function verifyToken(req, res, next) {
  const token = req.cookies.token;
  console.log(token);

  if (token === undefined) {
    return res.json({
      message: "Access Denied! Unauthorized User",
    });
  } else {
    jsonwebtoken.verify(token, process.env.SECRET_KEY, (err, authData) => {
      if (err) {
        res.json({
          message: "Invalid Token...",
        });
      } else {
        next();
      }
    });
  }
}

apiRouter.use("/user", verifyToken, userRouter);

module.exports = apiRouter;
