import React, { useEffect, useRef, useState } from "react";

export default function DepthFeed() {
  const canvasRef = useRef(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Connect to the RGB WebSocket feed
    const rgbWs = new WebSocket(`ws://127.0.0.1:8000/ws/depth_stream`);
    rgbWs.binaryType = "arraybuffer";

    rgbWs.onopen = () => {
      console.log("✅ Connected to RGB feed");
    };

    rgbWs.onmessage = (event) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const blob = new Blob([event.data], { type: "image/jpeg" });
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(img.src); // Clean up memory
      };

      img.src = URL.createObjectURL(blob);
    };

    rgbWs.onclose = () => console.log("RGB feed disconnected");
    rgbWs.onerror = (err) => console.error("RGB feed error:", err);

    setWs(rgbWs);

    // Cleanup on unmount
    return () => {
      rgbWs.close();
    };
  }, []); // <-- Empty dependency array to run effect only once

  return (
    <div className="w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full"/>
    </div>
  );
}
