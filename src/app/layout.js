import { Geist, Geist_Mono, Roboto, Cabin_Sketch, Crimson_Pro  } from "next/font/google";
import {AppRouterCacheProvider} from  '@mui/material-nextjs/v15-appRouter'; 
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import "@/app/styles/globals.css";
import "@/app/styles/awesome/all.css";
import "@/app/styles/awesome/sharp-solid.css";

const cabinSketch = Cabin_Sketch({
  variable: "--font-cabin",
  weight: "400",
  subsets: ['latin'],
  preload: false,
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  weight: ["400", "700"],
  subsets: ['latin'],
  preload: false,
});

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


export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body  
        className={`${geistSans.variable} ${geistMono.variable} ${cabinSketch.variable} ${crimsonPro.variable} ${roboto.variable} antialiased`}
      ><AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
        {children}
        </ThemeProvider>
      </AppRouterCacheProvider>
      </body>
    </html>
  );
}
