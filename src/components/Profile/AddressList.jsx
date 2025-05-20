import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import { Edit, Delete, Home, LocationOn } from '@mui/icons-material';

export default function AddressList({ addresses, onEdit, onDelete, loading }) {
  // Função específica para editar endereço que não depende de eventos
  const editAddress = (address) => {
    console.log("AddressList - Editando endereço:", address);

    // Chamar diretamente a função onEdit com o endereço
    if (typeof onEdit === 'function') {
      // Chamar com um timeout para garantir que qualquer outro evento seja processado primeiro
      setTimeout(() => {
        onEdit(address);
      }, 0);
    } else {
      console.error("A função onEdit não foi fornecida ou não é uma função");
    }
  };

  if (!addresses || addresses.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <LocationOn sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Você ainda não possui endereços cadastrados.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {addresses.map((address, index) => (
        <Paper
          key={address._id || index}
          elevation={1}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            position: 'relative'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={9}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Home sx={{ color: '#2e7d32', mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {address.neighborhood} - {address.city}/{address.state}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CEP: {address.zipCode}
                  </Typography>
                </Box>
              </Box>

              {address.isDefault && (
                <Chip
                  label="Endereço Principal"
                  size="small"
                  sx={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    mt: 1
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box>
                {/* Botão de edição com função simplificada */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Botão de edição clicado para endereço:", address);
                    onEdit(address);
                  }}
                  disabled={loading}
                  sx={{ color: '#2196f3' }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => onDelete(address._id)}
                  disabled={loading}
                  sx={{ color: '#f44336' }}
                >
                  {loading ? <CircularProgress size={24} /> : <Delete />}
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))
      }
    </Box >
  );
}