const oauth2Client = require("../config/googleAuth");
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

    const decoded = jwtDecode(tokens.id_token);

    const googleId = decoded.sub;
    const email = decoded.email;
    const name = decoded.name;
    const picture = decoded.picture;

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        username: name,
        email,
        googleId,
        avatar: picture,
        password: null,
      });
    } else {
      user.googleId = googleId;
      user.avatar = picture;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GOOGLE CALLBACK ERROR:", error);
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
