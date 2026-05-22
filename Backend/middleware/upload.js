const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - PDF only for job applications
const fileFilter = (req, file, cb) => {
  const isPdf = path.extname(file.originalname).toLowerCase() === ".pdf";
  const isPdfMime = file.mimetype === "application/pdf";

  if (isPdf && isPdfMime) {
    return cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for resume upload."));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
