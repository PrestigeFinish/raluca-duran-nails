"use client";

export default function NotificationButton() {
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined") {
          // @ts-ignore
          window.requestRalucaNotifications?.();
        }
      }}
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
