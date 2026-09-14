import { useEffect, useRef, useState } from "react";

function DrawingCanvas({ onDrawingChange }) {
  const canvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = 700;
    canvas.height = 450;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    let clientX;
    let clientY;

    if (event.touches) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPosition(event);

    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
  };

  const draw = (event) => {
    event.preventDefault();

    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPosition(event);

    ctx.strokeStyle = color;

    if (tool === "pen") {
      ctx.lineWidth = 3;
    } else {
      ctx.lineWidth = 12;
    }

    ctx.lineTo(x, y);
    ctx.stroke();

    onDrawingChange(canvas.toDataURL("image/png"));
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    onDrawingChange(canvas.toDataURL("image/png"));
  };

  return (
    <div className="drawing-wrapper">

      <div className="toolbar">

        <div className="tool-group">
          <button
            className={tool === "pen" ? "active" : ""}
            onClick={() => setTool("pen")}
          >
            Pen
          </button>

          <button
            className={tool === "brush" ? "active" : ""}
            onClick={() => setTool("brush")}
          >
            Brush
          </button>
        </div>

        <div className="color-group">
          <button
            className="color red"
            onClick={() => setColor("#ff0000")}
          />

          <button
            className="color blue"
            onClick={() => setColor("#0000ff")}
          />

          <button
            className="color yellow"
            onClick={() => setColor("#ffd600")}
          />

          <button
            className="color black"
            onClick={() => setColor("#000000")}
          />
        </div>

        <button
          className="clear-button"
          onClick={clearCanvas}
        >
          Clear
        </button>

      </div>

      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

    </div>
  );
}

export default DrawingCanvas;