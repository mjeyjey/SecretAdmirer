// SendModal.jsx

import { useState } from "react";

import {
  EnvelopeSimple,
  LinkSimple,
  X,
  ArrowLeft,
  Copy,
  PaperPlaneTilt,
} from "@phosphor-icons/react";

const API_URL = import.meta.env.VITE_API_URL;

function SendModal({ messageId, onClose }) {
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const messageLink =
    `${window.location.origin}/message/${messageId}`;

  // ========================================
  // COPY LINK
  // ========================================

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(messageLink);

      setStatus("Link copied!");

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error("Copy link error:", error);

      setStatus(
        "Could not copy the link."
      );
    }
  };

  // ========================================
  // SEND EMAIL
  // ========================================

  const sendEmail = async () => {
    if (!email.trim()) {
      setStatus(
        "Please enter an email address."
      );

      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const response = await fetch(
        `${API_URL}/send-email`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            messageId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to send email."
        );
      }

      setStatus(
        "Message sent successfully!"
      );

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (error) {
      console.error("Send email error:", error);

      setStatus(
        error.message ||
          "Failed to send email."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">

      <div className="modal">

        {/* ==================================
            CLOSE BUTTON
        ================================== */}

        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X
            size={20}
            weight="regular"
          />
        </button>

        <h2>
          Send Secret Message
        </h2>

        {/* ==================================
            SEND OPTIONS
        ================================== */}

        {!mode && (
          <div className="send-options">

            <button
              className="send-option"
              onClick={() => setMode("email")}
            >
              <EnvelopeSimple
                size={21}
                weight="regular"
              />

              <span>
                Send via Email
              </span>
            </button>

            <button
              className="send-option"
              onClick={() => setMode("link")}
            >
              <LinkSimple
                size={21}
                weight="regular"
              />

              <span>
                Copy Link
              </span>
            </button>

          </div>
        )}

        {/* ==================================
            EMAIL MODE
        ================================== */}

        {mode === "email" && (
          <div className="email-form">

            <input
              type="email"
              placeholder="recipient@email.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={loading}
            />

            <button
              className="primary-button"
              onClick={sendEmail}
              disabled={loading}
            >
              <PaperPlaneTilt
                size={18}
                weight="regular"
              />

              <span>
                {loading
                  ? "Sending..."
                  : "Send Email"}
              </span>
            </button>

            <button
              className="secondary-button"
              onClick={() => {
                setStatus("");
                setMode(null);
              }}
              disabled={loading}
            >
              <ArrowLeft
                size={18}
                weight="regular"
              />

              <span>
                Back
              </span>
            </button>

          </div>
        )}

        {/* ==================================
            LINK MODE
        ================================== */}

        {mode === "link" && (
          <div className="link-form">

            <input
              value={messageLink}
              readOnly
            />

            <button
              className="primary-button"
              onClick={copyLink}
            >
              <Copy
                size={18}
                weight="regular"
              />

              <span>
                Copy Link
              </span>
            </button>

            <button
              className="secondary-button"
              onClick={() => {
                setStatus("");
                setMode(null);
              }}
            >
              <ArrowLeft
                size={18}
                weight="regular"
              />

              <span>
                Back
              </span>
            </button>

          </div>
        )}

        {/* ==================================
            STATUS
        ================================== */}

        {status && (
          <p className="status-message">
            {status}
          </p>
        )}

      </div>

    </div>
  );
}

export default SendModal;