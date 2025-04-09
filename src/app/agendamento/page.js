'use client';
import Header from "@/components/Header/page";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Box } from "@mui/material";
import Agendamento from "@/components/Schedule/Index";

export default function AgendamentoPage() {
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
            p: 3, 
            overflow: 'auto',
            transition: 'margin-left 0.3s',
            marginLeft: sidebarOpen ? '240px' : '0'
          }}
        >
          {/*Componente de agendamento*/}
          <Agendamento />
        </Box>
      </Box>
    </Box>
  );
}