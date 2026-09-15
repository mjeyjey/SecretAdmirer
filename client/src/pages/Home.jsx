import { useState } from "react";
import {
  Heart,
  EnvelopeSimple,
  Palette,
  ArrowLeft,
  PaperPlaneTilt,
} from "@phosphor-icons/react";

import { supabase } from "../lib/supabase";

import WriteLetter from "../components/WriteLetter";
import DrawingCanvas from "../components/DrawingCanvas";
import SendModal from "../components/SendModal";

function Home() {
  const [mode, setMode] = useState("home");

  const [letter, setLetter] = useState("");
  const [drawing, setDrawing] = useState(null);

  const [messageType, setMessageType] = useState(null);
  const [messageId, setMessageId] = useState(null);

  const [showSendModal, setShowSendModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const startWriting = () => {
    setMessageType("text");
    setMode("write");
  };

  const startDrawing = () => {
    setMessageType("drawing");
    setMode("draw");
  };

  const saveMessage = async () => {
    if (messageType === "text" && !letter.trim()) {
      alert("Please write your message first.");
      return;
    }

    if (messageType === "drawing" && !drawing) {
      alert("Please draw something first.");
      return;
    }

    try {
      setSaving(true);

      const publicId = crypto.randomUUID();

      let content = null;
      let imageUrl = null;

      // ========================================
      // TEXT MESSAGE
      // ========================================

      if (messageType === "text") {
        content = letter.trim();
      }

      // ========================================
      // DRAWING
      // ========================================

      if (messageType === "drawing") {
        const response = await fetch(drawing);

        if (!response.ok) {
          throw new Error("Failed to process drawing.");
        }

        const blob = await response.blob();

        const filePath = `${publicId}.png`;

        const { error: uploadError } = await supabase.storage
          .from("secret-drawings")
          .upload(filePath, blob, {
            contentType: "image/png",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the actual public URL
        const { data: publicUrlData } = supabase.storage
          .from("secret-drawings")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // ========================================
      // SAVE MESSAGE TO SUPABASE
      // ========================================

      const { error: databaseError } = await supabase
        .from("messages")
        .insert({
          public_id: publicId,
          type: messageType,
          content,
          image_url: imageUrl,
        });

      if (databaseError) {
        throw databaseError;
      }

      setMessageId(publicId);
      setShowSendModal(true);

    } catch (error) {
      console.error("Save message error:", error);

      alert(
        error?.message ||
          "Failed to save your secret message."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app">

      {/* ======================================
          HOME
      ====================================== */}

      {mode === "home" && (
        <main className="landing">

          <div className="heart">
            <Heart
              size={42}
              weight="light"
            />
          </div>

          <p className="eyebrow">
            SOMETHING UNSPOKEN
          </p>

          <h1>
            Secret
            <br />
            Admirer
          </h1>

          <p className="subtitle">
            Leave a little secret for someone special.
          </p>

          <div className="home-buttons">

            <button
              className="main-action"
              onClick={startWriting}
            >
              <EnvelopeSimple
                size={19}
                weight="regular"
              />

              <span>
                Write Letter
              </span>
            </button>

            <button
              className="main-action outline"
              onClick={startDrawing}
            >
              <Palette
                size={19}
                weight="regular"
              />

              <span>
                Draw
              </span>
            </button>

          </div>

        </main>
      )}

      {/* ======================================
          WRITE MODE
      ====================================== */}

      {mode === "write" && (
        <main className="editor-page">

          <div className="editor-header">

            <button
              className="back-button"
              onClick={() => setMode("home")}
            >
              <ArrowLeft
                size={18}
                weight="regular"
              />

              <span>
                Back
              </span>
            </button>

            <h1>
              Write a Secret Letter
            </h1>

            <p>
              Say what you cannot say out loud.
            </p>

          </div>

          <WriteLetter
            value={letter}
            setValue={setLetter}
          />

          <div className="switch-mode">

            <button onClick={startDrawing}>
              <Palette
                size={17}
                weight="regular"
              />

              <span>
                Switch to Draw
              </span>
            </button>

          </div>

          <button
            className="send-button"
            onClick={saveMessage}
            disabled={saving}
          >
            <PaperPlaneTilt
              size={19}
              weight="regular"
            />

            <span>
              {saving
                ? "Saving..."
                : "Send Secret"}
            </span>
          </button>

        </main>
      )}

      {/* ======================================
          DRAW MODE
      ====================================== */}

      {mode === "draw" && (
        <main className="editor-page">

          <div className="editor-header">

            <button
              className="back-button"
              onClick={() => setMode("home")}
            >
              <ArrowLeft
                size={18}
                weight="regular"
              />

              <span>
                Back
              </span>
            </button>

            <h1>
              Draw Your Secret
            </h1>

            <p>
              Sometimes a picture says more than words.
            </p>

          </div>

          <DrawingCanvas
            onDrawingChange={setDrawing}
          />

          <div className="switch-mode">

            <button onClick={startWriting}>
              <EnvelopeSimple
                size={17}
                weight="regular"
              />

              <span>
                Switch to Letter
              </span>
            </button>

          </div>

          <button
            className="send-button"
            onClick={saveMessage}
            disabled={saving}
          >
            <PaperPlaneTilt
              size={19}
              weight="regular"
            />

            <span>
              {saving
                ? "Saving..."
                : "Send Secret"}
            </span>
          </button>

        </main>
      )}

      {/* ======================================
          SEND MODAL
      ====================================== */}

      {showSendModal && (
        <SendModal
          messageId={messageId}
          onClose={() => setShowSendModal(false)}
        />
      )}

    </div>
  );
}

export default Home;