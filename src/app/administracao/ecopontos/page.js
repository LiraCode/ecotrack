'use client';

import AppLayout from '@/components/Layout/page';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function EcopontoManagement() {
  const [ecopontos, setEcopontos] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEcoponto, setCurrentEcoponto] = useState(null);
  const [responsibles, setResponsibles] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    cnpj: '',
    name: '',
    description: '',
    responsableId: '',
    typeOfWasteId: [],
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    }
  });
  
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  
  // obter statusda sidebar do localStorage
  useEffect(() => {
    const sidebarStatus = localStorage.getItem('sidebarOpen');
    if (sidebarStatus === 'true') {
      setSidebarOpen(true);
      //verificar tamnho da tela se for maior que 768px setar sidebarOpen como true
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
        localStorage.setItem('sidebarOpen', 'false');
        setIsMobile(false);
        
      }

    }

  }, []);


  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const fetchEcopontos = useCallback(async () => {
    try {
      const response = await fetch('/api/collection-points');
      const data = await response.json();
      if (response.ok) {
        setEcopontos(data);
      } else {
        showAlert(data.message || 'Erro ao carregar ecopontos', 'error');
      }
    } catch (error) {
      showAlert('Erro ao carregar ecopontos', 'error');
    }
  }, []);

  const fetchResponsibles = useCallback(async () => {
    try {
      const response = await fetch('/api/responsible',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
       
        }
      );
      const data = await response.json();
      if (response.ok) {
        // Check if data has a specific property that contains the array
        if (data.responsibles && Array.isArray(data.responsibles)) {
          setResponsibles(data.responsibles);
        } else if (Array.isArray(data)) {
          setResponsibles(data);
        } else {
          // If all else fails, set an empty array
          setResponsibles([]);
          console.error('Unexpected response format:', data);
        }
      }
    } catch (error) {
      showAlert('Erro ao carregar responsáveis', 'error');
      console.error('Error fetching responsibles:', error);
    }
  }, []);

  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        const response = await fetch('/api/waste');
        const data = await response.json();
        if (response.ok) {
          // Check if data has a specific property that contains the array
          if (data.wasteTypes && Array.isArray(data.wasteTypes)) {
            setWasteTypes(data.wasteTypes);
             
          } else if (Array.isArray(data)) {
            setWasteTypes(data);
            
          } else {
            // If all else fails, set an empty array
            setWasteTypes([]);
            console.error('Unexpected waste types response format:', data);
          }
        }
      } catch (error) {
        showAlert('Erro ao carregar tipos de resíduos', 'error');
        console.error('Error fetching waste types:', error);
      }
    };
    
    fetchEcopontos();
    fetchResponsibles();
    fetchWasteTypes();
  }, [user, fetchEcopontos, fetchResponsibles]);

  const handleOpen = (ecoponto = null) => {
    if (ecoponto) {
      setEditMode(true);
      setCurrentEcoponto(ecoponto);
      setFormData({
        cnpj: ecoponto.cnpj,
        name: ecoponto.name,
        description: ecoponto.description,
        responsableId: ecoponto.responsableId._id,
        typeOfWasteId: ecoponto.typeOfWasteId.map(waste => waste._id),
        address: {
          street: ecoponto.address.street,
          number: ecoponto.address.number,
          complement: ecoponto.address.complement,
          neighborhood: ecoponto.address.neighborhood,
          city: ecoponto.address.city,
          state: ecoponto.address.state,
          zipCode: ecoponto.address.zipCode,
        }
      });
    } else {
      setEditMode(false);
      setCurrentEcoponto(null);
      setFormData({
        cnpj: '',
        name: '',
        description: '',
        responsableId: '',
        typeOfWasteId: [],
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
        }
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleWasteChange = (e) => {
    setFormData({
      ...formData,
      typeOfWasteId: e.target.value
    });
  };

  const handleSubmit = async () => {
    console.log(editMode);
    console.log(formData);
    try {
      let response;
      if (editMode) {
        response = await fetch(`/api/collection-points/${currentEcoponto._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('/api/collection-points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();
      if (response.ok) {
        showAlert(editMode ? 'Ecoponto atualizado com sucesso!' : 'Ecoponto criado com sucesso!', 'success');
        handleClose();
        fetchEcopontos();
      } else {
        showAlert(data.message || 'Erro ao salvar ecoponto', 'error');
      }
    } catch (error) {
      showAlert('Erro ao salvar ecoponto', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este ecoponto?')) {
      try {
        const response = await fetch(`/api/collection-points/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          showAlert('Ecoponto excluído com sucesso!', 'success');
          fetchEcopontos();
        } else {
          const data = await response.json();
          showAlert(data.message || 'Erro ao excluir ecoponto', 'error');
        }
      } catch (error) {
        showAlert('Erro ao excluir ecoponto', 'error');
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '0vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Carregando...</Typography>
        </Box>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box
        sx={{
          p: 3,
          width: "100%",
          maxWidth: "1600px",
          marginLeft: "100px",
          flexGrow: 1,
          overflow: "auto",
          transition: "margin-left 0.3s",
          xs: { marginLeft: sidebarOpen ? "240px" : "0px" },
          marginRight: isMobile ? "0" : "100px",
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{ color: "#2e7d32", fontWeight: "bold" }}
            >
              Gerenciamento de Ecopontos
            </Typography>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Novo Ecoponto
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CNPJ</TableCell>
                  <TableCell>Responsável</TableCell>
                  <TableCell>Cidade</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ecopontos.map((ecoponto) => (
                  <TableRow key={ecoponto._id}>
                    <TableCell>{ecoponto.name}</TableCell>
                    <TableCell>{ecoponto.cnpj}</TableCell>
                    <TableCell>
                      {ecoponto.responsableId?.name || "N/A"}
                    </TableCell>
                    <TableCell>{ecoponto.address?.city || "N/A"}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpen(ecoponto)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(ecoponto._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {ecopontos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum ecoponto cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#2e7d32", fontWeight: "bold" }}
          >
            Sobre os Ecopontos
          </Typography>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="body1" paragraph>
              Os Ecopontos são locais estratégicos para o descarte correto de
              resíduos específicos, contribuindo para a gestão sustentável de
              materiais recicláveis e não recicláveis.
            </Typography>
            <Typography variant="body1" paragraph>
              Cada Ecoponto é gerenciado por um responsável designado e pode
              receber diferentes tipos de resíduos, conforme sua capacidade e
              infraestrutura.
            </Typography>
            <Typography variant="body1">
              Mantenha esta lista atualizada para garantir que os usuários
              tenham informações precisas sobre os Ecopontos disponíveis e os
              tipos de resíduos aceitos em cada um.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Dialog para adicionar/editar ecoponto */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ bgcolor: "#f5f5f5", color: "#2e7d32", fontWeight: "bold" }}
        >
          {editMode ? "Editar Ecoponto" : "Novo Ecoponto"}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Seção: Informações Básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                Informações Básicas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="CNPJ"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    required
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Seção: Responsável e Tipos de Resíduos */}
            <Grid xs={12}>
              <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                Responsável e Tipos de Resíduos
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required margin="normal">
                    <InputLabel>Responsável</InputLabel>
                    <Select
                      name="responsableId"
                      value={formData.responsableId}
                      onChange={handleChange}
                      label="Responsável"
                      sx={{ minWidth: "200px" }} // Garante espaço suficiente para o select
                    >
                      {(Array.isArray(responsibles) ? responsibles : []).map(
                        (responsible) => (
                          <MenuItem
                            key={responsible._id}
                            value={responsible._id}
                          >
                            {responsible.name}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required margin="normal">
                    <InputLabel>Tipos de Resíduos</InputLabel>
                    <Select
                      multiple
                      name="typeOfWasteId"
                      value={formData.typeOfWasteId}
                      onChange={handleWasteChange}
                      label="Tipos de Resíduos"
                      sx={{ minWidth: "200px" }} // Garante espaço suficiente para exibir as opções
                    >
                      {(Array.isArray(wasteTypes) ? wasteTypes : []).map(
                        (waste) => (
                          <MenuItem key={waste._id} value={waste._id}>
                            {waste.type || waste.name}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Seção: Endereço */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                Endereço
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Rua"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Número"
                    name="address.number"
                    value={formData.address.number}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bairro"
                    name="address.neighborhood"
                    value={formData.address.neighborhood}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Complemento"
                    name="address.complement"
                    value={formData.address.complement}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Cidade"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Estado"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="CEP"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? "Atualizar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}

