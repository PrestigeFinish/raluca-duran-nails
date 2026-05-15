import Script from "next/script";
import NotificationButton from "../components/NotificationButton";
import InstallAppPrompt from "../components/InstallAppPrompt";
import BottomNav from "../components/BottomNav";
import "./globals.css";

export const metadata = {
  title: "Raluca Duran Nails | Nail Studio Ploiești",
  description:
    "Raluca Duran Nails - nail studio premium în Ploiești. Semi cu apex, gel, construcție, slim nails, întreținere, nail art și make-up.",
  manifest: "/manifest.webmanifest",
  themeColor: "#b7836e",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Raluca Duran Beauty",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>
        {children}
        <NotificationButton />
        <InstallAppPrompt />
        <BottomNav />

        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />

        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "82336a62-54d3-4c3b-951f-f619653fbf94"
              });

              window.requestRalucaNotifications = async function() {
                await OneSignal.Notifications.requestPermission();
              };
            });
          `}
        </Script>
      </body>
    </html>
  );
}
