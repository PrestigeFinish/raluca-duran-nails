import OneSignalInit from "../components/OneSignalInit";
import "./globals.css";

export const metadata = {
  title: "Raluca Duran Nails | Nail Studio Ploiești",
  description: "...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>
        <OneSignalInit />
        {children}
      </body>
    </html>
  );
}
