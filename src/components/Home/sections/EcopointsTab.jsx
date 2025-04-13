'use client';
import { Box, Typography, Grid, Card, CardContent, Chip, Divider } from "@mui/material";
import { LocationOn as LocationOnIcon, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { ecoPointsData } from "@/data/ecoPointsData";
import Link from 'next/link';

export default function EcopointsTab() {
  return (
    <Box sx={{ py: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LocationOnIcon sx={{ mr: 1 }} /> Ecopontos Disponíveis
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {ecoPointsData.map((point, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {point.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'center' }}>
                  <LocationOnIcon sx={{ color: '#2e8b57', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" align="center">
                    {point.address}
                  </Typography>
                </Box>
                <Chip 
                  label={point.region} 
                  size="small" 
                  sx={{ 
                    backgroundColor: '#e8f5e9', 
                    color: '#2e8b57',
                    mt: 1
                  }}
                />
              </CardContent>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                
                  <Box 
                    component="a"
                    href="/agendamento"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: '#2e8b57',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    <CalendarTodayIcon sx={{ mr: 0.5, fontSize: 18 }} />
                    Agendar
                  </Box>
            
                
                  <Box
                    component="a"
                    sx={{
                      backgroundColor: '#2e8b57',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      padding: '6px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#1f6b47' }
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
