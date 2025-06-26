
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";
import { EditorStateProvider } from "./context/editor-context";
import { GlobalSettingsProvider } from "./context/settings-context";
import "./globals.css";

const geistSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: "300",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Email Tool",
  description: "",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <GlobalSettingsProvider>
          <MantineProvider>
            <EditorStateProvider >
              {children}
            </EditorStateProvider>
          </MantineProvider>
        </GlobalSettingsProvider>
      </body>
    </html>
  );
}
