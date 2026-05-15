"use client";

import { useEffect } from "react";

export default function OneSignalInit() {
  useEffect(() => {
    async function initOneSignal() {
      if (typeof window === "undefined") return;

      const OneSignal = (await import("react-onesignal")).default;

      await OneSignal.init({
        appId: "82336a62-54d3-4c3b-951f-f619653fbf94",
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true,
        },
      });
    }

    initOneSignal();
  }, []);

  return null;
}
