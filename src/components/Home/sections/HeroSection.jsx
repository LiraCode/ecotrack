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
          backgroundColor: 'rgba(0,0,0,0.6)'
        }}
      />
      <Container maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              mb: 2,
              fontWeight: 'bold',
              fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }
            }}
          >
            EcoTrack
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            sx={{ 
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            Conectando você aos pontos de reciclagem mais próximos e ajudando a construir um futuro mais sustentável.
          </Typography>
          <Link href="/signup" passHref>
            <Box
              component="button"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 4,
                py: 2,
                bgcolor: 'primary.main',
                color: 'white',
                border: 'none',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Comece Agora
              <ArrowForwardIcon />
            </Box>
          </Link>
        </Box>
      </Container>
    </Paper>
  );
}
