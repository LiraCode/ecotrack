'use client';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import recyclingGuide from '@/data/recyclingGuide';

export default function TrilhaContent() {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: theme.palette.primary.main, mb: 2 }}>
        Trilha Ambiental
      </Typography>
      <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
        Aprenda sobre reciclagem e sustentabilidade de forma interativa.
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3 
      }}>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <Typography variant="h5" sx={{ color: theme.palette.primary.main, mb: 2 }}>
            Guia de Reciclagem
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
            Aprenda a separar corretamente os resíduos e contribua para um meio ambiente mais limpo.
          </Typography>
        </Paper>

        <Paper
          elevation={1}
          sx={{
            p: 3,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}
        >
          <Typography variant="h5" sx={{ color: theme.palette.primary.main, mb: 2 }}>
            Dicas Sustentáveis
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
            Descubra práticas sustentáveis para o seu dia a dia e reduza seu impacto ambiental.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
