const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

//TRUST PROXY
app.set("trust proxy", 1);

//BODY PARSER
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
  })
);

// SESSION
app.use(
  session({
    name: "interworld.sid",
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",  // true on Render (HTTPS)
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",  // "none" needed for cross-origin on Render
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

//MAKE USER AVAILABLE GLOBALLY
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

//MONGODB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB error:", err));

//STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

//ROUTES
app.get("/", (req, res) => {
  res.send("InternWorld API running");
});

//DEBUG ROUTE 
app.get("/test-session", (req, res) => {
  res.json(req.session);
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/employer", require("./routes/employer"));
app.use("/api/user", require("./routes/user"));
app.use("/api/ai", require("./routes/ai"));


//SERVER START
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});