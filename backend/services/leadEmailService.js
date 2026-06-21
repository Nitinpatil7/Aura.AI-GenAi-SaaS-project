const nodemailer = require("nodemailer");

const SAFE_FOOTER = "If this is not relevant, please ignore this message.";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are required to send lead emails.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function buildEmailBody(message) {
  const trimmed = String(message || "").trim();
  return `${trimmed}\n\n${SAFE_FOOTER}`;
}

async function sendLeadEmail({ lead, message }) {
  if (!isValidEmail(lead.email)) {
    const error = new Error("Lead email is invalid.");
    error.statusCode = 400;
    throw error;
  }

  const transporter = getTransporter();
  const from = process.env.LEAD_EMAIL_FROM || process.env.SMTP_USER;
  const subject =
    lead.type === "internship"
      ? `MERN stack internship inquiry - ${lead.companyName}`
      : `Website/app development inquiry - ${lead.companyName}`;

  return transporter.sendMail({
    from,
    to: lead.email,
    subject,
    text: buildEmailBody(message || lead.message),
  });
}

module.exports = { SAFE_FOOTER, isValidEmail, sendLeadEmail };
