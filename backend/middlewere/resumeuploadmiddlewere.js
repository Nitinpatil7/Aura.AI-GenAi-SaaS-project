const multer = require("multer");
const storage = multer.memoryStorage();
const VALID_RESUME_TYPES = new Set(["application/pdf"]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isPdf =
      VALID_RESUME_TYPES.has(file.mimetype) ||
      String(file.originalname || "").toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return cb(new Error("Please upload a valid resume file only."));
    }

    return cb(null, true);
  },
});

module.exports = upload;
