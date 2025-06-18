'use client';
import { useState } from 'react';
import { Box, Button, useTheme, useMediaQuery } from '@mui/material';
import PostsContent from './PostsContent';
import TrilhaContent from './TrilhaContent';

export default function Page() {
  const [activeTab, setActiveTab] = useState('posts');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '95vh',
      width: isMobile ? '95vw' : '90vw',
      mt: isMobile ? 4 : { lg: 0, xs: 4 },
      ml: { xs: '100px', sm: 0 }
    }}>
      <Box sx={{ 
        width: '100%',
        borderBottom: 1,
        borderColor: 'divider',
        mb: 3
      }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: 2
        }}>
          <Button
            variant={activeTab === 'posts' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('posts')}
            sx={{
              color: activeTab === 'posts' 
                ? 'white' 
                : theme.palette.mode === 'dark' 
                  ? 'primary.light' 
                  : 'primary.main',
              bgcolor: activeTab === 'posts' 
                ? 'primary.main' 
                : 'transparent',
              '&:hover': {
                bgcolor: activeTab === 'posts' 
                  ? 'primary.dark' 
                  : theme.palette.mode === 'dark' 
                    ? 'rgba(76, 175, 80, 0.1)' 
                    : 'rgba(46, 125, 50, 0.1)'
              }
            }}
          >
            Posts
          </Button>
          <Button
            variant={activeTab === 'trilha' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('trilha')}
            sx={{
              color: activeTab === 'trilha' 
                ? 'white' 
                : theme.palette.mode === 'dark' 
                  ? 'primary.light' 
                  : 'primary.main',
              bgcolor: activeTab === 'trilha' 
                ? 'primary.main' 
                : 'transparent',
              '&:hover': {
                bgcolor: activeTab === 'trilha' 
                  ? 'primary.dark' 
                  : theme.palette.mode === 'dark' 
                    ? 'rgba(76, 175, 80, 0.1)' 
                    : 'rgba(46, 125, 50, 0.1)'
              }
            }}
          >
            Trilha Ambiental
          </Button>
        </Box>
      </Box>

      {activeTab === 'posts' ? <PostsContent /> : <TrilhaContent />}
    </Box>
  );
}