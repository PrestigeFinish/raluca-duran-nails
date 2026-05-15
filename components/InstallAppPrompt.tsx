"use client";

import { useEffect, useState } from "react";

export default function InstallAppPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();

    const ios =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsIOS(ios);
    setIsStandalone(standalone);

    const dismissed = localStorage.getItem("raluca_install_dismissed");

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (!dismissed && !standalone) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 3500);

      return () => {
        clearTimeout(timer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  async function handleInstall() {
    // Android / Chrome install prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const result = await deferredPrompt.userChoice;

      if (result.outcome === "accepted") {
        localStorage.setItem("raluca_install_dismissed", "yes");
        setShow(false);
      }

      setDeferredPrompt(null);
      return;
    }

    // iPhone guide
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // fallback
    setShowIOSGuide(true);
  }

  function close() {
    localStorage.setItem("raluca_install_dismissed", "yes");
    setShow(false);
  }

  if (isStandalone || !show) return null;

  return (
    <div className="install-overlay">
      <div className="install-card">
        <img
          src="/logo.png"
          alt="Raluca Duran Beauty"
          className="install-logo"
        />

        <h2>Instalează aplicația</h2>

        <p>
          Adaugă <strong>RalucaDuranStudio</strong> pe ecranul principal pentru
          programări rapide, oferte exclusive și notificări instant.
        </p>

        {isIOS && showIOSGuide && (
          <div className="install-steps">
            <p>
              <strong>Pe iPhone:</strong>
            </p>
            <p>1. Apasă cele <strong>3 puncte</strong> din browser.</p>
            <p>2. Alege <strong>Partajare</strong>.</p>
            <p>3. Apasă <strong>Mai multe</strong> dacă nu vezi opțiunea.</p>
            <p>4. Alege <strong>Adaugă pe ecranul principal</strong>.</p>
            <p>5. Apasă <strong>Adaugă</strong>.</p>
          </div>
        )}

        {!isIOS && (
          <p className="install-note">
            Pe Android, butonul de mai jos instalează aplicația automat.
          </p>
        )}

        <button onClick={handleInstall} className="install-main-btn">
          {isIOS ? "Vezi pașii pentru iPhone" : "Instalează aplicația"}
        </button>

        <button onClick={close} className="install-secondary-btn">
          Nu acum
        </button>
      </div>
    </div>
  );
}
