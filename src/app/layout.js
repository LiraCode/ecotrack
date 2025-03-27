import { Geist, Geist_Mono, Roboto } from "next/font/google";
import {appRouterCacheProvider} from  '@mui/material-nextjs/v15-appRouter'; 
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eco Track",
  description: "Conectando gente com a natureza",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><appRouterCacheProvider>
        <ThemeProvider theme={theme}>
        {children}
        </ThemeProvider>
      </appRouterCacheProvider>
      </body>
    </html>
  );
}
