
import type {Metadata} from 'next';
import type { Viewport } from 'next'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { EscalationProvider } from '@/context/escalation-context';
import { EmployeeProvider } from '@/context/employee-context';
import { SettingsProvider } from '@/context/settings-context';

export const metadata: Metadata = {
  title: 'Escalation Tracker',
  description: 'Track and manage customer escalations efficiently for Silvergroup.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <SettingsProvider>
          <EmployeeProvider>
            <EscalationProvider>
              {children}
            </EscalationProvider>
          </EmployeeProvider>
        </SettingsProvider>
        <Toaster />
      </body>
    </html>
  );
}
