import "./globals.css";
import { ReactNode } from "react";
import { ObservabilityProvider } from "./providers/ObservabilityProvider";

export const metadata = {
  title: "Neuro-Engine",
  description: "Neurodivergent creativity playground built for websim.ai"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 font-sans">
        <ObservabilityProvider>
          <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
            {children}
          </main>
        </ObservabilityProvider>
      </body>
    </html>
  );
}
