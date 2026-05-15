import OneSignalInit from "../components/OneSignalInit";
import "./globals.css";

export const metadata = {
  title: "Raluca Duran Nails | Nail Studio Ploiești",
  description:
    "Raluca Duran Nails - nail studio premium în Ploiești. Semi cu apex, gel, construcție, slim nails, întreținere, nail art și make-up.",
  keywords: [
    "unghii Ploiești",
    "manichiură Ploiești",
    "nail studio Ploiești",
    "make-up Ploiești",
    "Raluca Duran Nails",
  ],
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
