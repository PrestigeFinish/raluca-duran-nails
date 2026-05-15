export const metadata = {
  title: "Raluca Duran Nails | Nail Studio Ploiești",
  description:
    "Raluca Duran Nails - nail studio premium în Ploiești. Semi cu apex, gel, construcție, slim nails, întreținere și nail art.",
  keywords: [
    "unghii Ploiești",
    "manichiură Ploiești",
    "nail studio Ploiești",
    "gel Ploiești",
    "semi permanentă Ploiești",
    "Raluca Duran Nails",
  ],
};

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
