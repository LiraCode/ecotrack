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
  Grid,
  CircularProgress,
  Chip,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { validateCNPJ, formatCNPJ, formatCEP } from '@/utils/validators';
import { fetchAddressByCEP, getCoordinatesFromAddress } from '@/services/cepService';

export default function EcopontoManagement() {
  const [ecopontos, setEcopontos] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEcoponto, setCurrentEcoponto] = useState(null);
  const [responsibles, setResponsibles] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);
  const [cnpjError, setCnpjError] = useState('');
  const [cepError, setCepError] = useState('');
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
    },
    lat: '',
    lng: ''
  });
  
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  
  // obter status da sidebar do localStorage
  useEffect(() => {
    const sidebarStatus = localStorage.getItem('sidebarOpen');
    if (sidebarStatus === 'true') {
      setSidebarOpen(true);
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
        // colocar data.location.coordinates[0] em lat e data.location.coordinates[1] em lng
        // setFormData((prevFormData) => ({
        //   ...prevFormData,
        //   lat: data?.location.coordinates[0],
        //   lng: data?.location.coordinates[1],
          
        //   }));
        
      } else {
        showAlert(data.message || 'Erro ao carregar ecopontos', 'error');
      }
    } catch (error) {
      showAlert('Erro ao carregar ecopontos', 'error');
    }
  }, []);

  const fetchResponsibles = useCallback(async () => {
    try {
      const response = await fetch('/api/responsible', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        if (data.responsibles && Array.isArray(data.responsibles)) {
          setResponsibles(data.responsibles);
        } else if (Array.isArray(data)) {
          setResponsibles(data);
        } else {
          setResponsibles([]);
          console.error('Unexpected response format:', data);
        }
      }
    } catch (error) {
      showAlert('Erro ao carregar responsáveis', 'error');
      console.error('Error fetching responsibles:', error);
    }
  }, [user]);

  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        const response = await fetch('/api/waste');
        const data = await response.json();
        if (response.ok) {
          if (data.wasteTypes && Array.isArray(data.wasteTypes)) {
            setWasteTypes(data.wasteTypes);
          } else if (Array.isArray(data)) {
            setWasteTypes(data);
          } else {
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
        responsableId: ecoponto.responsableId?._id || ecoponto.responsableId,
        typeOfWasteId: Array.isArray(ecoponto.typeOfWasteId) 
          ? ecoponto.typeOfWasteId.map(waste => waste._id || waste)
          : [],
        address: {
          street: ecoponto.address?.street || '',
          number: ecoponto.address?.number || '',
          complement: ecoponto.address?.complement || '',
          neighborhood: ecoponto.address?.neighborhood || '',
          city: ecoponto.address?.city || '',
          state: ecoponto.address?.state || '',
          zipCode: ecoponto.address?.zipCode || '',
        },
        lat: ecoponto.lat || '',
        lng: ecoponto.lng || '',
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
        },
        lat: '',
        lng: ''
      });
    }
    setCnpjError('');
    setCepError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      const formattedCNPJ = formatCNPJ(value);
      setFormData({ ...formData, [name]: formattedCNPJ });
      
      // Validar CNPJ
      if (value.replace(/[^\d]/g, '').length >= 14) {
        if (!validateCNPJ(value)) {
          setCnpjError('CNPJ inválido');
        } else {
          setCnpjError('');
        }
      } else {
        setCnpjError('');
      }
    } else if (name === 'address.zipCode') {
      const formattedCEP = formatCEP(value);
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          zipCode: formattedCEP
        }
      });
      setCepError('');
    } else if (name.includes('.')) {
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

  // Buscar endereço pelo CEP
  const handleCEPSearch = async () => {
    const cep = formData.address.zipCode.replace(/[^\d]/g, '');
    
    if (cep.length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }

    setLoadingCEP(true);
    setCepError('');

    try {
      const result = await fetchAddressByCEP(cep);
      
      if (result.success) {
        setFormData({
          ...formData,
          address: {
            ...formData.address,
            street: result.address.street,
            neighborhood: result.address.neighborhood,
            city: result.address.city,
            state: result.address.state,
            zipCode: formatCEP(result.address.zipCode)
          }
        });
        showAlert('Endereço encontrado com sucesso!', 'success');
      } else {
        setCepError(result.error);
        showAlert(result.error, 'error');
      }
    } catch (error) {
      setCepError('Erro ao buscar CEP');
      showAlert('Erro ao buscar CEP', 'error');
    } finally {
      setLoadingCEP(false);
    }
  };

  // Buscar coordenadas do endereço
  const handleGetCoordinates = async () => {
    if (!formData.address.street || !formData.address.number || !formData.address.city) {
      showAlert('Preencha pelo menos rua, número e cidade para buscar coordenadas', 'warning');
      return;
    }

    setLoadingCoordinates(true);

    try {
      const result = await getCoordinatesFromAddress(formData.address);
      
      if (result.success) {
        setFormData({
          ...formData,
          lat: result.coordinates.lat,
          lng: result.coordinates.lng
        });
        showAlert('Coordenadas encontradas com sucesso!', 'success');
      } else {
        showAlert(result.error, 'error');
      }
    } catch (error) {
      showAlert('Erro ao buscar coordenadas', 'error');
    } finally {
      setLoadingCoordinates(false);
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (cnpjError) {
      showAlert('Corrija o CNPJ antes de continuar', 'error');
      return;
    }

    if (!validateCNPJ(formData.cnpj)) {
      showAlert('CNPJ inválido', 'error');
      return;
    }

    if (!formData.lat || !formData.lng) {
      showAlert('Coordenadas são obrigatórias. Use o botão "Buscar Coordenadas"', 'error');
      return;
    }

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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Carregando...</Typography>
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
                  <TableCell>Coordenadas</TableCell>
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
                      {ecoponto.lat && ecoponto.lng ? (
                        <Chip
                          icon={<LocationOnIcon />}
                          label={`${ecoponto.lat.toFixed(4)}, ${ecoponto.lng.toFixed(4)}`}
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip label="Sem coordenadas" size="small" color="warning" />
                      )}
                    </TableCell>
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
                    <TableCell colSpan={6} align="center">
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
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
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
                    error={!!cnpjError}
                    helperText={cnpjError}
                    placeholder="00.000.000/0000-00"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    required
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Seção: Responsável e Tipos de Resíduos */}
            <Grid item xs={12}>
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
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="CEP"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    required
                    margin="normal"
                    error={!!cepError}
                    helperText={cepError}
                    placeholder="00000-000"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleCEPSearch}
                            disabled={loadingCEP}
                            edge="end"
                          >
                            {loadingCEP ? <CircularProgress size={20} /> : <SearchIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

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

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Complemento"
                    name="address.complement"
                    value={formData.address.complement}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
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
                    label="Cidade"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
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
              </Grid>
            </Grid>

            {/* Seção: Coordenadas */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                Localização (Coordenadas)
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="lat"
                    type="number"
                    value={formData.lat}
                    onChange={handleChange}
                    required
                    margin="normal"
                    inputProps={{
                      step: "any",
                      min: -90,
                      max: 90
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="lng"
                    type="number"
                    value={formData.lng}
                    onChange={handleChange}
                    required
                    margin="normal"
                    inputProps={{
                      step: "any",
                      min: -180,
                      max: 180
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleGetCoordinates}
                    disabled={loadingCoordinates}
                    startIcon={loadingCoordinates ? <CircularProgress size={20} /> : <LocationOnIcon />}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {loadingCoordinates ? 'Buscando...' : 'Buscar Coordenadas'}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Dica:</strong> Preencha o endereço completo e clique em &quot;Buscar Coordenadas&quot; 
                      para obter automaticamente a latitude e longitude do local.
                    </Typography>
                  </Alert>
                </Grid>

                {formData.lat && formData.lng && (
                  <Grid item xs={12}>
                    <Alert severity="success" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Coordenadas definidas:</strong> {formData.lat}, {formData.lng}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!!cnpjError || !!cepError}
          >
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
