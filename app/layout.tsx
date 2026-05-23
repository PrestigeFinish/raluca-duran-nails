import Script from "next/script";
import NotificationButton from "../components/NotificationButton";
import InstallAppPrompt from "../components/InstallAppPrompt";
import BottomNav from "../components/BottomNav";
import "./globals.css";

export const metadata = {
  title: "Raluca Duran Beauty | Nail Studio & Make-up Ploiești",
  description:
    "Raluca Duran Beauty - nail studio premium și make-up profesional în Ploiești. Programări online rapide.",

  verification: {
    google: "GORpqnqmTdtj5fRKrEY0KS3QiKvCk6PgX0m_RvBroGc",
  },

  manifest: "/manifest.webmanifest",
  themeColor: "#b7836e",
  appleWebApp: {
  capable: true,
  statusBarStyle: "default",
  title: "Raluca Beauty",
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
      <head>
  <Script
    async
    src="https://www.googletagmanager.com/gtag/js?id=G-62WLEF66XW"
  />

  <Script id="google-analytics">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-62WLEF66XW');
    `}
  </Script>
</head>
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
