import "./globals.css";

export const metadata = {
  title: "AI Software Engineer",
  description: "AI-powered software engineering agent"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}