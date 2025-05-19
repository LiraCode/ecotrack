import React from 'react';
import { Box, Typography, Grid, Button, Paper } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

// Dados de exemplo para tipos de resíduos
const wasteTypes = [
  { id: 1, name: 'Eletrônicos', icon: '🖥️', color: '#e57373' },
  { id: 2, name: 'Plástico', icon: '🥤', color: '#64b5f6' },
  { id: 3, name: 'Papel', icon: '📄', color: '#81c784' },
  { id: 4, name: 'Vidro', icon: '🍶', color: '#4db6ac' }
];

const WasteTypePreview = ({ handleOpenDialog, onViewAllWasteTypes }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e8b57' }}>
          Tipos de Resíduos
        </Typography>
        <Button 
          endIcon={<ArrowForwardIcon />}
          onClick={onViewAllWasteTypes}
          sx={{ color: '#2e8b57' }}
        >
          Ver Todos
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        {wasteTypes.map((type) => (
          <Grid item xs={6} sm={3} key={type.id}>
            <Paper
              onClick={() => handleOpenDialog(type)}
              sx={{
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: type.color + '20', // Adiciona transparência à cor
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Typography variant="h4" sx={{ mb: 1 }}>
                {type.icon}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {type.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WasteTypePreview;