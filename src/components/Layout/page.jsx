'use client';
import Header from "@/components/Header/page";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Box } from "@mui/material";
import '@/app/styles/globals.css';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxHeight: '100vh', overflow: 'hidden' }}>
      {/* Header at the top */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content area with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Sidebar on the left */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content area */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 1, sm: 2 }, 
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            transition: 'margin-left 0.3s',
            marginLeft: sidebarOpen ? '112px' : '0',
            '& > *': {
              maxWidth: '100%',
              overflow: 'auto'
            }
          }}
        >
          {/* Page content */}
          {children}
        </Box>
      </Box>
    </Box>
  );
}