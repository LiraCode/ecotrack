'use client';
import { Box, Typography, Grid, Card, CardActionArea, CardContent, Paper, Chip } from "@mui/material";
import { Recycling as RecyclingIcon } from '@mui/icons-material';
import wasteData from "@/data/wasteData";
import Link from 'next/link';

export default function WasteClassification({ handleOpenDialog, onViewAllClick }) {
  return (
    <Paper elevation={1} sx={{ p: 3, mt: 4, borderRadius: 2, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#2e8b57', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RecyclingIcon sx={{ mr: 1 }} /> Classificação de Resíduos
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {Object.keys(wasteData).slice(0, 3).map((item) => (
          <Grid item xs={12} sm={4} key={item}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => handleOpenDialog(item)}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
                    {item}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    {wasteData[item].description.substring(0, 80)}...
                  </Typography>
                  <Chip 
                    label={`Decomposição: ${wasteData[item].decomposition}`} 
                    size="small" 
                    sx={{ backgroundColor: '#e8f5e9', color: '#2e8b57' }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Box
          component="a"
          onClick={onViewAllClick}
          sx={{ 
            color: '#2e8b57', 
            borderColor: '#2e8b57',
            border: '1px solid',
            borderRadius: '4px',
            padding: '5px 15px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            '&:hover': { borderColor: '#1f6b47', backgroundColor: '#e8f5e9' }
          }}
        >
          Ver todos os tipos de resíduos
        </Box>
      </Box>
    </Paper>
  );
}