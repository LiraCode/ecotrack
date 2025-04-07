'use client';
import Posts from "@/components/Post/page";
import Header from "@/components/Header/page";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <main>
       <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Posts />
    </main>
  );
}
