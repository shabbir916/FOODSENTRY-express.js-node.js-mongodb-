const oauth2Client = require("../config/googleAuth");
const { google } = require("googleapis");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require("jwt-decode");

function googleAuthURL(req, res) {
  const scopes = ["profile", "email", "openid"];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  return res.redirect(url);
}

async function googleCallback(req, res) {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log("TOKENS:", tokens);

    // Decode ID Token
    const decoded = jwtDecode(tokens.id_token);

    const googleId = decoded.sub;
    const email = decoded.email;
    const name = decoded.name;
    const picture = decoded.picture;

    let user = await userModel.findOne({ email });

    if (!user) {
      // CREATE NEW USER
      user = await userModel.create({
        username: name,
        email,
        googleId: googleId,
        avatar: picture,
        password: null,
      });
    } else {
      // UPDATE EXISTING USER
      user.googleId = googleId;
      user.avatar = picture;
      await user.save();
    }

    console.log("DECODED:", decoded);
    console.log("SUB:", decoded.sub);
    console.log("GOOGLE ID TO SAVE:", googleId);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.log("GOOGLE CALLBACK ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
}


module.exports = {
  googleAuthURL,
  googleCallback,
};
