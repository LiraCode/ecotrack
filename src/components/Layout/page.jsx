'use client';
import Header from "@/components/Header/page";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Box } from "@mui/material";
import '@/app/styles/globals.css';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header at the top */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content area with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Sidebar on the left */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content area */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 0, 
            overflow: 'auto',
            transition: 'margin-left 0.3s',
            marginLeft: sidebarOpen ? {lg:'240px', sm:'90px', xs:'90px'} : '0'
          }}
        >
          {/* Page content */}
          {children}
        </Box>
      </Box>
    </Box>
  );
}