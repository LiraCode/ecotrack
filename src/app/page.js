import Navbar from "@/components/header/page";
import { AppBar, Toolbar } from "@mui/material";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <AppBar position="relative">
        <Toolbar>
          <Navbar />
        </Toolbar>
      </AppBar>
    <Image src="/images/eco-track.png" alt="Eco Track" width={500} height={500} />
    <h1>Home</h1>
    <p>Welcome to Eco Track</p>
  </div>
    
  );
}
