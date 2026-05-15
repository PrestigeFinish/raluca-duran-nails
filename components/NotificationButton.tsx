"use client";

import { useEffect, useState } from "react";

export default function NotificationButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("raluca_notifications_choice");

    if (!accepted) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  async function activateNotifications() {
    // @ts-ignore
    if (window.requestRalucaNotifications) {
      // @ts-ignore
      await window.requestRalucaNotifications();
      localStorage.setItem("raluca_notifications_choice", "accepted");
      setShow(false);
    }
  }

  function closePopup() {
    localStorage.setItem("raluca_notifications_choice", "later");
    setShow(false);
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "430px",
          width: "100%",
          background: "#fff7f2",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
          border: "1px solid rgba(183,131,110,0.25)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            marginBottom: "12px",
            color: "#2b1f1b",
          }}
        >
          Primește ofertele Raluca Duran Beauty
        </h2>

        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#5f4a42",
            marginBottom: "22px",
          }}
        >
          Apasă <strong>Activează notificările</strong> și apoi <strong>Allow / Permite</strong>,
          ca să primești promoții, locuri libere, oferte speciale și noutăți direct pe telefon sau calculator.
        </p>

        <button
          onClick={activateNotifications}
          style={{
            width: "100%",
            border: "0",
            borderRadius: "999px",
            padding: "15px 20px",
            background: "#b7836e",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
            marginBottom: "12px",
          }}
        >
          Activează notificările
        </button>

        <button
          onClick={closePopup}
          style={{
            border: "0",
            background: "transparent",
            color: "#7b6258",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Nu acum
        </button>
      </div>
    </div>
  );
}
