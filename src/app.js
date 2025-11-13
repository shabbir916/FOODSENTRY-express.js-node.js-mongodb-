const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("../src/routes/auth.routes");
const pantryRoutes = require("../src/routes/pantry.routes");
const recipeRoutes = require("../src/routes/recipe.routes");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/recipe", recipeRoutes);

module.exports = app;
