const express = require("express");
const auth = require("../middlewere/authmiddlewere");
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  generateMessage,
  sendEmail,
  getFollowups,
  getLeadStats,
} = require("../controller/leadcontroller");

const router = express.Router();

router.use(auth);

router.post("/", createLead);
router.get("/", getLeads);
router.get("/followups", getFollowups);
router.get("/stats", getLeadStats);
router.get("/:id", getLeadById);
router.patch("/:id", updateLead);
router.delete("/:id", deleteLead);
router.post("/:id/generate-message", generateMessage);
router.post("/:id/send-email", sendEmail);

module.exports = router;
