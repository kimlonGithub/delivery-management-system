import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ToastContainer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ApiDebugger from "@/components/ApiDebugger";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Delivery Management System",
  description: "A comprehensive delivery management system for admins and drivers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              {children}
              {process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_API === 'true' && <ApiDebugger />}
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
