import React, { useEffect, useRef, useState } from "react";

export default function DepthFeed() {
  const canvasRef = useRef(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const rgbWs = new WebSocket(`wss://websockets.cerealis.cloud/ws/depth_feed`);
    rgbWs.binaryType = "arraybuffer";

    rgbWs.onopen = () => {
      console.log("Connected to RGB feed");
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
        URL.revokeObjectURL(img.src); 
      };

      img.src = URL.createObjectURL(blob);
    };

    rgbWs.onclose = () => console.log("RGB feed disconnected");
    rgbWs.onerror = (err) => console.error("RGB feed error:", err);

    setWs(rgbWs);

    return () => {
      rgbWs.close();
    };
  }, []);

  return (
    <div className="w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full"/>
    </div>
  );
}
