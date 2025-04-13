'use client';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, Typography, Paper, Chip, Button } from "@mui/material";
import { Recycling as RecyclingIcon } from '@mui/icons-material';
import wasteData from "@/data/wasteData";
import Link from 'next/link';

export default function WasteDetailDialog({ open, onClose, selectedWaste }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        color: '#2e8b57', 
        borderBottom: '1px solid #e0e0e0',
        pb: 2,
        textAlign: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RecyclingIcon sx={{ mr: 1 }} />
          Informações sobre: {selectedWaste}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {selectedWaste && (
          <>
            <DialogContentText sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333', mb: 1, textAlign: 'center' }}>
                Descrição:
              </Typography>
              <Typography variant="body1" sx={{ color: '#555', textAlign: 'center' }}>
                {wasteData[selectedWaste].description}
              </Typography>
            </DialogContentText>
            
            <DialogContentText sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333', mb: 1, textAlign: 'center' }}>
                Tempo de decomposição:
              </Typography>
              <Chip 
                label={wasteData[selectedWaste].decomposition}
                sx={{ 
                  backgroundColor: '#e8f5e9', 
                  color: '#2e8b57',
                  fontWeight: 'bold'
                }}
              />
            </DialogContentText>
            
            <DialogContentText sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333', mb: 1, textAlign: 'center' }}>
                Dica de reciclagem:
              </Typography>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ color: '#555', textAlign: 'center' }}>
                  {wasteData[selectedWaste].recyclingTip}
                </Typography>
              </Paper>
            </DialogContentText>
            
            <Box sx={{ mt: 4, p: 2, backgroundColor: '#e8f5e9', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e8b57', mb: 1, textAlign: 'center' }}>
                Onde descartar:
              </Typography>
              <Typography variant="body2" align="center">
                Você pode descartar este tipo de resíduo em qualquer Ecoponto da cidade.
                Clique abaixo para agendar uma coleta ou encontrar o Ecoponto mais próximo.
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'center' }}>
        <Button 
          variant="outlined"
          onClick={onClose}
          sx={{ 
            color: '#2e8b57',
            borderColor: '#2e8b57',
            '&:hover': { borderColor: '#1f6b47', backgroundColor: '#e8f5e9' }
          }}
        >
          Fechar
        </Button>
        <Link href="/agendamento" passHref style={{ textDecoration: 'none' }}>
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
            onClick={onClose} // Close the dialog when clicking the link
          >
            Agendar Coleta
          </Box>
        </Link>
      </DialogActions>
    </Dialog>
  );
}
