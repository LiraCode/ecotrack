'use client';
import { Box, Typography, Grid, Card, CardContent, Chip, Divider, useTheme, useMediaQuery } from "@mui/material";
import { LocationOn as LocationOnIcon, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';

export default function EcopointsTab() {
  const [ecoPoints, setEcoPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchEcoPoints = async () => {
      try {
        const response = await fetch('/api/collection-points/ecopoints');
        if (!response.ok) {
          throw new Error('Falha ao buscar ecopontos');
        }
        const data = await response.json();
        const ecopointsArray = data.ecopoints || [];
        
        // Formatar os dados para o formato esperado pelo componente
        const formattedEcoPoints = ecopointsArray.map(point => ({
          name: point.name,
          address: point.address?.street 
            ? `${point.address.street}, ${point.address.number}` 
            : 'Endereço não disponível',
          region: point.address?.neighborhood || 'Região não especificada'
        }));
        
        setEcoPoints(formattedEcoPoints);
      } catch (err) {
        console.error('Erro ao buscar ecopontos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEcoPoints();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Typography>Carregando ecopontos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Typography color="error">Erro ao carregar ecopontos: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      py: isMobile ? 2 : 4, 
      px: isMobile ? 1 : 2,
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <Typography 
        variant={isMobile ? "h6" : "h5"} 
        sx={{ 
          mb: isMobile ? 2 : 3, 
          color: '#2e8b57', 
          fontWeight: 'bold', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: isMobile ? '1.2rem' : undefined
        }}
      >
        <LocationOnIcon sx={{ mr: 1, fontSize: isMobile ? '1.5rem' : undefined }} /> 
        Ecopontos Disponíveis
      </Typography>
      <Grid container spacing={isMobile ? 2 : 3} justifyContent="center">
        {ecoPoints.map((point, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              mx: isMobile ? 1 : 0
            }}>
              <CardContent sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                p: isMobile ? 2 : 3
              }}>
                <Typography 
                  gutterBottom 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    fontSize: isMobile ? '1rem' : undefined
                  }}
                >
                  {point.name}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1, 
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  textAlign: 'center'
                }}>
                  <LocationOnIcon sx={{ 
                    color: '#2e8b57', 
                    mr: 1, 
                    fontSize: isMobile ? 16 : 20 
                  }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center"
                    sx={{
                      fontSize: isMobile ? '0.875rem' : undefined,
                      wordBreak: 'break-word'
                    }}
                  >
                    {point.address}
                  </Typography>
                </Box>
                <Chip 
                  label={point.region} 
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    backgroundColor: '#e8f5e9', 
                    color: '#2e8b57',
                    mt: 1,
                    fontSize: isMobile ? '0.75rem' : undefined
                  }}
                />
              </CardContent>
              <Divider />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                p: isMobile ? 1.5 : 2,
                gap: isMobile ? 1 : 2
              }}>
                <Box 
                  component="a"
                  href="/cliente/agendamento"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: '#2e8b57',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  <CalendarTodayIcon sx={{ mr: 0.5, fontSize: isMobile ? 16 : 18 }} />
                  Agendar
                </Box>
                <Box
                  component="a"
                  href="/locais"
                  sx={{
                    backgroundColor: '#2e8b57',
                    color: 'white',
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    fontWeight: 500,
                    padding: isMobile ? '4px 12px' : '6px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#1f6b47' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Ver no Mapa
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
