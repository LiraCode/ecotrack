'use client';
import Header from "@/components/Header/page";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from '@mui/icons-material';
import '@/app/styles/globals.css';
import { useTheme } from '@/context/ThemeContext';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        maxHeight: '100vh', 
        overflow: 'hidden',
        backgroundColor: 'background.default'
      }}
    >
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <Box sx={{ 
        position: 'fixed',
        top: 30,
        right: 350, 
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center'
      }}>
        <IconButton 
  onClick={toggleTheme} 
  color="inherit"
  sx={{
    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
    '&:hover': {
      backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)'
    },
    '& svg': { // Esta parte controla a cor do ícone
      color: '#ffffff !important' // Força a cor branca
    }
  }}
>
  {theme === 'light' ? <Brightness7 /> : <Brightness4 />}
</IconButton>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1, 
        overflow: 'hidden', 
        position: 'relative',
        backgroundColor: 'background.default'
      }}>
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 1, sm: 2 }, 
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            transition: 'margin-left 0.3s ease-in-out',
            marginLeft: sidebarOpen ? '112px' : '0',
            backgroundColor: 'background.default',
            '& > *': {
              maxWidth: '100%',
              overflow: 'auto'
            }
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}