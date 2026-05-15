export const metadata = {
  title: "Raluca Duran Nails",
  description: "Nail studio by Raluca Duran in Ploiești",
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