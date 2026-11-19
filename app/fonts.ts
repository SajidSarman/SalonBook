import localFont from "next/font/local"

export const switzer = localFont({
  src: [
    {
      path: "./fonts/Switzer-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/Switzer-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-switzer",
  fallback: ["system-ui", "sans-serif"],
})

export const zodiak = localFont({
  src: [
    {
      path: "./fonts/Zodiak-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/Zodiak-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-zodiak",
  fallback: ["system-ui", "sans-serif"],
})
