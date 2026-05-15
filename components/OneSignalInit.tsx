"use client";

import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalInit() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      await OneSignal.init({
        appId: "82336a62-54d3-4c3b-951f-f619653fbf94",
        allowLocalhostAsSecureOrigin: true,
      });

      setReady(true);
    }

    init();
  }, []);

  async function activateNotifications() {
    await OneSignal.Notifications.requestPermission();
  }

  if (!ready) return null;

  return (
    <button
      onClick={activateNotifications}
      style={{
        position: "fixed",
        right: "18px",
        bottom: "18px",
        zIndex: 9999,
        border: "0",
        borderRadius: "999px",
        padding: "14px 18px",
        background: "#b7836e",
        color: "white",
        fontWeight: 800,
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        cursor: "pointer",
      }}
    >
      Activează notificările
    </button>
  );
}
