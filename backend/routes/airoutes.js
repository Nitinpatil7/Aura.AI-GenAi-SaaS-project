const express = require("express");
const router = express.Router();
const upload = require("../middlewere/resumeuploadmiddlewere");
const {
  generateimage,
  generatewebsite,
  generatecode,
  analyzeresume,
  youtubesummary,
  chatbot,
  startMockInterview,
  submitMockAnswer,
  endMockInterview,
  getgallery
} = require("../controller/aicontroller");
const checkplan = require("../middlewere/subscriptioncheck");
const auth = require("../middlewere/authmiddlewere");
const validate = require("../middlewere/validate");
const schemas = require("../utils/schemas");

router.get("/gallery", auth, getgallery);
router.post("/image", auth, validate(schemas.ai.generateImage), checkplan("image"), generateimage);
router.post("/website", auth, validate(schemas.ai.generateWebsite), checkplan("website"), generatewebsite);
router.post("/code", auth, validate(schemas.ai.generateCode), checkplan("code"), generatecode);
router.post(
  "/resume",
  auth,
  checkplan("resume"),
  (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Please upload a valid resume file only.",
        });
      }

      return next();
    });
  },
  validate(schemas.ai.analyzeResume),
  analyzeresume,
);
router.post("/youtube", auth, validate(schemas.ai.youtubeSummary), checkplan("youtube"), youtubesummary);
router.post("/chat", auth, validate(schemas.ai.chatbot), checkplan("chat"), chatbot);
router.post("/start", auth, validate(schemas.ai.startInterview), checkplan("interview"), startMockInterview);
router.post("/submit", auth, validate(schemas.ai.submitAnswer), submitMockAnswer);
router.post("/end", auth, validate(schemas.ai.endInterview), endMockInterview);

module.exports = router;
