'use client';
import { Box, Typography, Paper, Container } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        position: 'relative',
        height: '400px',
        mb: 6,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundImage: 'url(/images/main1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Box>
        <Typography variant="h2" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
          EcoTrack
        </Typography>
        </Box>
        <Box>
        <Typography variant="h5" sx={{ color: 'white', mb: 4, mx: 'auto' }}>
          Conectando você aos pontos de coleta para um descarte consciente e sustentável
        </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        
            <Box
              component="a"
              href="/locais"
              sx={{
                  backgroundColor: '#2e8b57',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 500,
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { backgroundColor: '#1f6b47' }
                  
              }}
            >
              Encontrar Ecopontos
              <ArrowForwardIcon sx={{ ml: 1 }} />
          
            </Box>
        </Box>
      </Container>
    </Paper>
  );
}
