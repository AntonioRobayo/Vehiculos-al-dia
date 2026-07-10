"use client";
import { useEffect, useState } from "react";

const SPLASH_KEY = "vad_splash_shown";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(SPLASH_KEY)) {
      setVisible(true);
    }
  }, []);

  function handleEnd() {
    sessionStorage.setItem(SPLASH_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0F172A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleEnd}
        onError={handleEnd}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
