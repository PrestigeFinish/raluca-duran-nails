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

    if (!dismissed && !standalone) {
      const timer = setTimeout(() => setShow(true), 3500);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
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

  if (isIOS) {
    setShowIOSGuide(true);
    return;
  }

  setShowIOSGuide(true);
}

      return;
    }

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
        <img src="/logo.png" alt="Raluca Duran Beauty" className="install-logo" />

        <h2>Intră direct în aplicație</h2>

        <p>
          Adaugă <strong>Raluca Duran Beauty</strong> pe ecranul principal pentru
          programări rapide, oferte speciale și notificări.
        </p>

        {isIOS && showIOSGuide && (
  <div className="install-steps">
    <p><strong>Pe iPhone:</strong></p>
    <p>1. Apasă cele <strong>3 puncte</strong> din bara browserului.</p>
    <p>2. Alege <strong>Partajare</strong>.</p>
    <p>3. Derulează sau apasă <strong>Mai multe</strong>.</p>
    <p>4. Alege <strong>Adaugă pe ecranul principal</strong>.</p>
    <p>5. Apasă <strong>Adaugă</strong>.</p>
  </div>
)}

        {!isIOS && (
          <p className="install-note">
            Pe Android, butonul de mai jos deschide instalarea aplicației.
          </p>
        )}

        <button onClick={handleInstall} className="install-main-btn">
         {isIOS ? "Vezi cum instalezi pe iPhone" : "Instalează aplicația"}
        </button>

        <button onClick={close} className="install-secondary-btn">
          Nu acum
        </button>
      </div>
    </div>
  );
}
