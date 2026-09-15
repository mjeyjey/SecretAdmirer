const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

const sendWithResend = async ({ email, messageLink, html }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "You have a secret message 💌",
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    const error = new Error(`Resend rejected the email: ${details}`);
    error.code = `RESEND_${response.status}`;
    error.providerDetails = details;
    throw error;
  }
};

const sendWithBrevo = async ({ email, html }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Secret Admirer",
        email: process.env.EMAIL_FROM,
      },
      to: [{ email }],
      subject: "You have a secret message 💌",
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    const error = new Error(`Brevo rejected the email: ${details}`);
    error.code = `BREVO_${response.status}`;
    error.providerDetails = details;
    throw error;
  }
};

router.post("/send-email", async (req, res) => {
  try {
    const { email, messageId } = req.body;

    const usingBrevo = Boolean(
      process.env.BREVO_API_KEY && process.env.EMAIL_FROM
    );
    const usingResend = Boolean(
      !usingBrevo && process.env.RESEND_API_KEY && process.env.EMAIL_FROM
    );

    const usingGmail = Boolean(
      process.env.EMAIL_USER && process.env.EMAIL_PASS
    );

    if (!usingBrevo && !usingResend && !usingGmail) {
      const missingVariables = [];

      if (!usingBrevo && !process.env.BREVO_API_KEY) {
        missingVariables.push("BREVO_API_KEY");
      }

      if (!process.env.EMAIL_FROM) {
        missingVariables.push("EMAIL_FROM");
      }

      return res.status(500).json({
        message: `Email service is not configured on the server. Missing: ${missingVariables.join(", ") || "EMAIL_USER or EMAIL_PASS"}.`,
      });
    }

    if (!email || !messageId) {
      return res.status(400).json({
        message: "Email and message ID are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address.",
      });
    }

    const messageLink =
      `${process.env.CLIENT_URL}/message/${messageId}`;

    const html = `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 40px;
          text-align: center;
          background: #fff6f8;
          border-radius: 20px;
        ">

          <h1>
            💌 Secret Admirer
          </h1>

          <p style="
            font-size: 18px;
            color: #555;
          ">
            You have received a message from
            a Secret Admirer!
          </p>

          <a
            href="${messageLink}"
            style="
              display:inline-block;
              padding:15px 25px;
              background:#d93656;
              color:white;
              text-decoration:none;
              border-radius:10px;
              font-weight:bold;
            "
          >
            View Your Secret
          </a>

          <p style="
            color:#999;
            margin-top:25px;
          ">
            Someone left you a little secret. ♥
          </p>

        </div>
      `;

    if (usingBrevo) {
      await sendWithBrevo({ email, html });
    } else if (usingResend) {
      await sendWithResend({ email, messageLink, html });
    } else {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Secret Admirer" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "You have a secret message 💌",
        html,
      });
    }

    res.json({
      message: "Email sent successfully.",
    });

  } catch (error) {

    console.error("Email error:", {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
      message: error.message,
    });

    const authenticationFailed =
      error.code === "EAUTH" || error.responseCode === 535;
    const connectionTimedOut = error.code === "ETIMEDOUT";
    const resendFailed = error.code?.startsWith("RESEND_");
    const brevoFailed = error.code?.startsWith("BREVO_");

    res.status(500).json({
      message: authenticationFailed
        ? "Email authentication failed. Check the Gmail app password on the server."
        : connectionTimedOut
          ? "The email provider could not be reached from the hosting server."
        : resendFailed
          ? `Resend rejected the message: ${error.providerDetails || "Check the sender address and API key."}`
        : brevoFailed
          ? `Brevo rejected the message: ${error.providerDetails || "Check the sender address and API key."}`
        : `Email provider could not send the message (${error.code || "unknown error"}).`,
    });

  }
});

module.exports = router;