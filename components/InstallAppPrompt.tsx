"use client";

import { useEffect, useState } from "react";

export default function InstallAppPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsIOS(ios);
    setIsStandalone(standalone);

    const dismissed = localStorage.getItem("install_prompt_dismissed");

    if (!dismissed && !standalone) {
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }

    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  async function installApp() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;

      if (result.outcome === "accepted") {
        localStorage.setItem("install_prompt_dismissed", "yes");
        setShow(false);
      }

      setDeferredPrompt(null);
      return;
    }

    if (isIOS) {
      setShow(true);
    }
  }

  function close() {
    localStorage.setItem("install_prompt_dismissed", "yes");
    setShow(false);
  }

  if (isStandalone || !show) return null;

  return (
    <div className="install-overlay">
      <div className="install-card">
        <h2>Intră direct în aplicație</h2>

        <p>
          Adaugă <strong>Raluca Duran Beauty</strong> pe ecranul principal ca să
          intri rapid la programări, servicii, nails și make-up.
        </p>

        {isIOS ? (
          <div className="install-steps">
            <p><strong>Pe iPhone:</strong></p>
            <p>1. Apasă butonul <strong>Share</strong> din Safari.</p>
            <p>2. Alege <strong>Add to Home Screen</strong>.</p>
            <p>3. Deschide site-ul ca aplicație.</p>
          </div>
        ) : (
          <p className="install-note">
            Pe Android, apasă butonul de mai jos pentru instalare.
          </p>
        )}

        <button onClick={installApp} className="install-main-btn">
          {isIOS ? "Arată pașii pentru iPhone" : "Instalează aplicația"}
        </button>

        <button onClick={close} className="install-secondary-btn">
          Nu acum
        </button>
      </div>
    </div>
  );
}
