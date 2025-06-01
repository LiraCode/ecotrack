'use client';
import Header from "@/components/Header/page";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Agendamento from "@/components/Schedule/Index";

export default function AgendamentoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header at the top */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content area with sidebar and content */}
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1, 
        overflow: 'hidden',
        width: '100%',
      }}>
        {/* Sidebar on the left */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content area */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            width: '100%',
            p: isMobile ? 0 : 3, 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/*Componente de agendamento*/}
          <Agendamento sidebarOpen={sidebarOpen} />
        </Box>
      </Box>
    </Box>
  );
}