import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import dynamic from "next/dynamic"
import { BibleVersionProvider } from "./context/BibleVersionContext"

const Header = dynamic(() => import("@/app/components/Header"), { ssr: false })
const AnimationProvider = dynamic(() => import("@/app/context/AnimationContext"), { ssr: false })

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "The Lumen Bible",
  description: "Interactive Minimal Design Bible Project",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico'
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The Lumen Bible'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BibleVersionProvider>
          <Header />
          <AnimationProvider>
            {children}
          </AnimationProvider>
        </BibleVersionProvider>
      </body>
    </html>
  )
}