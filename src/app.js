const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("../src/routes/auth.routes");
const googleRoutes = require("../src/routes/google.routes");
const pantryRoutes = require("../src/routes/pantry.routes");
const recipeRoutes = require("../src/routes/recipe.routes");
const dashBoardRoutes = require("../src/routes/dashboard.routes");
const testRoutes = require("../src/routes/test.Routes");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/auth", googleRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/recipe", recipeRoutes);
app.use("/api/dashboard", dashBoardRoutes);
app.use("/api",testRoutes);

module.exports = app;
