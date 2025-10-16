import type { Metadata } from "next";
import "@/src/index.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "TeamStatus",
  description: "Team management CRUD",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


