'use client'
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import EcoPointForm from './EcoPointForm';

export default function EditEcoPointDialog({
  open,
  onClose,
  ecoPointId,
  isMobile,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [ecoPointData, setEcoPointData] = useState(null);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Buscar dados do ecoponto e tipos de resíduos quando o diálogo é aberto
  useEffect(() => {
    if (open && ecoPointId) {
      fetchEcoPointData();
      fetchWasteTypes();
    }
  }, [open, ecoPointId]);

  const fetchEcoPointData = async () => {
    if (!ecoPointId) return;

    try {
      setFetchLoading(true);
      const response = await fetch(`/api/collection-points/${ecoPointId}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEcoPointData(data.collectionPoint);
      } else {
        console.error('Failed to fetch eco point data:', await response.text());
        setErrorMessage('Erro ao carregar dados do ecoponto');
      }
    } catch (error) {
      console.error('Error fetching eco point data:', error);
      setErrorMessage('Erro ao carregar dados do ecoponto');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchWasteTypes = async () => {
    try {
      const response = await fetch('/api/waste', {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWasteTypes(data.wasteTypes);
      } else {
        console.error('Failed to fetch waste types:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching waste types:', error);
    }
  };

  const handleClose = () => {
    setSuccessMessage('');
    setErrorMessage('');
    onClose();
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setErrorMessage('');

      const method = ecoPointId ? 'PUT' : 'POST';
      const url = ecoPointId 
        ? `/api/collection-points/${ecoPointId}` 
        : '/api/collection-points';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(ecoPointId 
          ? 'Ecoponto atualizado com sucesso!' 
          : 'Ecoponto criado com sucesso!');
          
        // Fechar o diálogo após um breve delay para mostrar a mensagem de sucesso
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Erro ao salvar ecoponto');
      }
    } catch (error) {
      console.error('Error saving eco point:', error);
      setErrorMessage('Erro ao salvar ecoponto. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogTitle sx={{
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            {ecoPointId ? 'Editar Ecoponto' : 'Novo Ecoponto'}
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 0.5 }}
          disabled={loading}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, mt: 1 }}>
        {fetchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            {/* Mensagens de sucesso e erro */}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}

            <EcoPointForm
              initialData={ecoPointData}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              loading={loading}
              wasteTypes={wasteTypes}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}