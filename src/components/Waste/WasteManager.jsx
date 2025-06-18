'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import { getAllWasteTypes, createWasteType, updateWasteType, deleteWasteType } from '@/services/wasteService';

export default function WasteManager() {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentWaste, setCurrentWaste] = useState({ type: '', description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState({ type: '' });

  // Fetch waste types on component mount
  useEffect(() => {
    fetchWasteTypes();
  }, []);

  // Fetch all waste types from API
  const fetchWasteTypes = async () => {
    setLoading(true);
    try {
      const result = await getAllWasteTypes();
      if (result.success) {
        setWasteTypes(result.wasteTypes);
      } else {
        showSnackbar('Erro ao carregar tipos de resíduos', 'error');
      }
    } catch (error) {
      console.error('Error fetching waste types:', error);
      showSnackbar('Erro ao carregar tipos de resíduos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for adding a new waste type
  const handleAddClick = () => {
    setCurrentWaste({ type: '', description: '' });
    setFormErrors({ type: '' });
    setDialogMode('add');
    setOpenDialog(true);
  };

  // Open dialog for editing an existing waste type
  const handleEditClick = (waste) => {
    setCurrentWaste({ ...waste });
    setFormErrors({ type: '' });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentWaste(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (name === 'type' && formErrors.type) {
      setFormErrors(prev => ({ ...prev, type: '' }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = { type: '' };
    let isValid = true;

    if (!currentWaste.type.trim()) {
      errors.type = 'O tipo de resíduo é obrigatório';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let result;
      
      if (dialogMode === 'add') {
        result = await createWasteType(currentWaste);
        if (result.success) {
          showSnackbar('Tipo de resíduo adicionado com sucesso', 'success');
          fetchWasteTypes();
        } else {
          showSnackbar(result.error || 'Erro ao adicionar tipo de resíduo', 'error');
        }
      } else {
        result = await updateWasteType(currentWaste._id, currentWaste);
        if (result.success) {
          showSnackbar('Tipo de resíduo atualizado com sucesso', 'success');
          fetchWasteTypes();
        } else {
          showSnackbar(result.error || 'Erro ao atualizar tipo de resíduo', 'error');
        }
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error submitting waste type:', error);
      showSnackbar('Erro ao processar a solicitação', 'error');
    }
  };

  // Handle waste type deletion
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este tipo de resíduo?')) {
      try {
        const result = await deleteWasteType(id);
        if (result.success) {
          showSnackbar('Tipo de resíduo removido com sucesso', 'success');
          fetchWasteTypes();
        } else {
          showSnackbar(result.error || 'Erro ao remover tipo de resíduo', 'error');
        }
      } catch (error) {
        console.error('Error deleting waste type:', error);
        showSnackbar('Erro ao processar a solicitação', 'error');
      }
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Gerenciamento de Tipos de Resíduos
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleAddClick}
          sx={{ 
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          Adicionar Tipo
        </Button>
      </Box>

      {/* Waste Types Table */}
      <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'background.paper' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Descrição</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <CircularProgress color="success" />
                </TableCell>
              </TableRow>
            ) : wasteTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    Nenhum tipo de resíduo cadastrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              wasteTypes.map((waste) => (
                <TableRow key={waste._id} hover>
                  <TableCell sx={{fontWeight: 'bold', fontSize:'1rem'}}>{waste.type}</TableCell>
                  <TableCell>{waste.description || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditClick(waste)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(waste._id)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ 
          backgroundColor: 'background.paper',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {dialogMode === 'add' ? 'Adicionar Tipo de Resíduo' : 'Editar Tipo de Resíduo'}
          </Typography>
          <IconButton onClick={() => setOpenDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="type"
            name="type"
            label="Tipo de Resíduo"
            type="text"
            fullWidth
            variant="outlined"
            value={currentWaste.type}
            onChange={handleInputChange}
            error={!!formErrors.type}
            helperText={formErrors.type}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Descrição"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={currentWaste.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{ 
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            {dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}