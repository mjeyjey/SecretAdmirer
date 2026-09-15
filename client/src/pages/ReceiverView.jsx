import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { supabase } from "../lib/supabase";

function ReceiverView() {
  const { id } = useParams();

  const [message, setMessage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("public_id", id)
          .single();

        if (error) {
          throw error;
        }

        if ((data.type === "drawing" || data.type === "both") && data.image_url) {
          let filePath = data.image_url;

          if (filePath.startsWith("http")) {
            const publicPath = "/storage/v1/object/public/secret-drawings/";
            filePath = decodeURIComponent(
              filePath.split(publicPath)[1] || ""
            );
          }

          if (filePath) {
            const { data: signedUrlData, error: signedUrlError } =
              await supabase.storage
                .from("secret-drawings")
                .createSignedUrl(filePath, 60 * 60);

            if (!signedUrlError && signedUrlData?.signedUrl) {
              setImageUrl(signedUrlData.signedUrl);
            } else if (data.image_url.startsWith("http")) {
              setImageUrl(data.image_url);
            }
          }
        }

        setMessage(data);

      } catch (error) {
        console.error(error);

        setError(
          "This secret message does not exist or is no longer available."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  if (loading) {
    return (
      <div className="receiver-page">
        <div className="receiver-card">
          <div className="loading">
            Opening your secret...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receiver-page">
        <div className="receiver-card">

          <div className="heart">
            ♥
          </div>

          <h1>Secret Not Found</h1>

          <p>{error}</p>

        </div>
      </div>
    );
  }

  return (
    <div className="receiver-page">

      <div className="receiver-card">

        <div className="heart">
          ♥
        </div>

        <p className="eyebrow">
          A SECRET MESSAGE FOR YOU
        </p>

        <h1>
          From Someone Special
        </h1>

        {message.sender_name && (
          <p className="sender-label">
            From {message.sender_name}
          </p>
        )}

        {(message.type === "text" || message.type === "both") && (
          <div className="received-letter">
            {message.content}
          </div>
        )}

        {(message.type === "drawing" || message.type === "both") && (
          <div className="received-drawing">
            <img
              src={imageUrl}
              alt="Secret drawing"
            />
          </div>
        )}

        <p className="receiver-footer">
          You may never know who sent it. ♥
        </p>

      </div>

    </div>
  );
}

export default ReceiverView;