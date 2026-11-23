import { Geist_Mono } from "next/font/google"

import "./globals.css"
import { switzer, zodiak } from "./fonts"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { cn } from "@/lib/utils";

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          "antialiased font-sans",
          switzer.variable,
          zodiak.variable,
          fontMono.variable,
        )}
      >
        <head>
          <link rel="icon" href="/favicon.svg" sizes="any" />
          <link rel="apple-touch-icon" href="/favicon.svg" />
        </head>
        <body>
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
