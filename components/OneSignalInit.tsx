"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalInit() {
  useEffect(() => {
    OneSignal.init({
      appId: "82336a62-54d3-4c3b-951f-f619653fbf94",
      allowLocalhostAsSecureOrigin: true,
    });
  }, []);

  return null;
}
