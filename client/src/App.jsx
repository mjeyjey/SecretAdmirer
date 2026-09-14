import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ReceiverView from "./pages/ReceiverView";

function App() {
  const [showCreatorNote, setShowCreatorNote] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="creator-mark" aria-label="Created by MJR">
          MJR
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/message/:id" element={<ReceiverView />} />
        </Routes>

        {showCreatorNote && (
          <div className="creator-note" role="status">
            <button
              className="creator-note-close"
              aria-label="Close creator message"
              onClick={() => setShowCreatorNote(false)}
            >
              
            </button>
            <p>
              This was created with a little courage by MJR, the creator of
              Secret Admirer.
            </p>
          </div>
        )}

        <button
          className="creator-help"
          aria-label="Show message from the creator"
          aria-expanded={showCreatorNote}
          onClick={() => setShowCreatorNote((isVisible) => !isVisible)}
        >
          ?
        </button>
      </div>
    </BrowserRouter>
  );
}

export default App;