'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  Grid,
  Snackbar,
  Alert,
  Chip,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function GerenciamentoMetas() {
  const { user, loading } = useAuth();
  const [metas, setMetas] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    initialDate: dayjs(),
    validUntil: dayjs().add(30, 'day'),
    status: 'active',
    points: 100
  });
  const [formErrors, setFormErrors] = useState({});
  const [challenges, setChallenges] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState({
    waste: null,
    value: '',
    type: 'quantity'
  });
  
  // Get sidebar status from localStorage
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

  const fetchMetas = useCallback(async () => {
    if (!user?.accessToken) return;

    try {
      setFetchLoading(true);
      const response = await fetch('/api/goals', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar metas');
      }
      
      const data = await response.json();
      setMetas(data.goals || []);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      showAlert('Erro ao carregar metas', 'error');
    } finally {
      setFetchLoading(false);
    }
  }, [user]);

  const fetchWasteTypes = useCallback(async () => {
    if (!user?.accessToken) return;

    try {
      const response = await fetch('/api/waste', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar tipos de resíduos');
      }
      
      const data = await response.json();
      setWasteTypes(data.wasteTypes || []);
    } catch (error) {
      console.error('Erro ao buscar tipos de resíduos:', error);
      showAlert('Erro ao carregar tipos de resíduos', 'error');
    }
  }, [user]);

  useEffect(() => {
    if (user && !loading) {
      fetchMetas();
      fetchWasteTypes();
    }
  }, [user, loading, fetchMetas, fetchWasteTypes]);

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Função para extrair o valor numérico
  const extractNumericValue = (value) => {
    if (!value) return '';
    if (value.$numberDecimal) return value.$numberDecimal;
    if (typeof value === 'object' && value.toString) return value.toString();
    return value;
  };

  const handleOpen = (meta = null) => {
    if (meta) {
      setEditMode(true);
      setCurrentId(meta._id);
      setFormData({
        title: meta.title,
        description: meta.description,
        initialDate: dayjs(meta.initialDate),
        validUntil: dayjs(meta.validUntil),
        status: meta.status,
        points: meta.points
      });
      
      const metaChallenges = meta.challenges || [];
      setChallenges(metaChallenges.map(challenge => ({
        waste: challenge.waste,
        value: extractNumericValue(challenge.value),
        type: challenge.type
      })));
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({
        title: '',
        description: '',
        initialDate: dayjs(),
        validUntil: dayjs().add(30, 'day'),
        status: 'active',
        points: 100
      });
      setChallenges([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (field, newValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  const handleChallengeChange = (field, value) => {
    setCurrentChallenge(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addChallenge = () => {
    if (!currentChallenge.waste || !currentChallenge.value) {
      showAlert('Preencha todos os campos do desafio', 'error');
      return;
    }

    setChallenges(prev => [...prev, { ...currentChallenge }]);
    setCurrentChallenge({
      waste: null,
      value: '',
      type: 'quantity'
    });
  };

  const removeChallenge = (index) => {
    setChallenges(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title) errors.title = 'Título é obrigatório';
    if (!formData.description) errors.description = 'Descrição é obrigatória';
    if (!formData.initialDate) errors.initialDate = 'Data inicial é obrigatória';
    if (!formData.validUntil) errors.validUntil = 'Data final é obrigatória';
    if (!formData.points) errors.points = 'Pontuação é obrigatória';
    if (challenges.length === 0) errors.challenges = 'Adicione pelo menos um desafio';
    
    if (formData.initialDate && formData.validUntil) {
      if (formData.initialDate.isAfter(formData.validUntil)) {
        errors.dates = 'Data inicial não pode ser posterior à data final';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const url = editMode ? `/api/goals/${currentId}` : '/api/goals';
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({
          ...formData,
          initialDate: formData.initialDate.toISOString(),
          validUntil: formData.validUntil.toISOString(),
          challenges: challenges
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar meta');
      }

      showAlert(editMode ? 'Meta atualizada com sucesso!' : 'Meta criada com sucesso!', 'success');
      handleClose();
      fetchMetas();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      showAlert(error.message || 'Erro ao salvar meta', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta meta?')) return;

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir meta');
      }

      showAlert('Meta excluída com sucesso!', 'success');
      fetchMetas();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      showAlert(error.message || 'Erro ao excluir meta', 'error');
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  if (loading || fetchLoading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box
        sx={{
          p: 3,
          minWidth: "80vw",
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
              Gerenciamento de Metas
            </Typography>

            <Box>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={fetchMetas}
                sx={{ mr: 1 }}
              >
                Atualizar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
              >
                Nova Meta
              </Button>
            </Box>
          </Box>

          {fetchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress color="success" />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Carregando metas...
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Período</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Pontos</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Desafios</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metas.map((meta) => (
                    <TableRow key={meta._id} hover>
                      <TableCell>{meta.title}</TableCell>
                      <TableCell>{formatDate(meta.initialDate)} - {formatDate(meta.validUntil)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(meta.status)} 
                          color={getStatusColor(meta.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{meta.points}</TableCell>
                      <TableCell>
                        {meta.challenges && meta.challenges.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {meta.challenges.map((challenge, index) => {
                              // Extrair o valor numérico do desafio
                              const challengeValue = extractNumericValue(challenge.value);
                              
                              return (
                                <Chip 
                                  key={index} 
                                  label={`${challenge.waste?.name || 'Resíduo'}: ${challengeValue} ${challenge.type === 'weight' ? 'kg' : 'un'}`} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              );
                            })}
                          </Box>
                        ) : (
                          'Nenhum desafio'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpen(meta)}
                          size="small"
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(meta._id)}
                          size="small"
                          title="Excluir"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {metas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body1" sx={{ py: 2, color: 'text.secondary' }}>
                          Nenhuma meta encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#2e7d32", fontWeight: "bold" }}
          >
            Sobre as Metas
          </Typography>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="body1" paragraph>
              As metas são desafios de reciclagem que os usuários podem participar para ganhar pontos e reconhecimento.
            </Typography>
            <Typography variant="body1" paragraph>
              Cada meta deve ter pelo menos um desafio específico, que define a quantidade ou peso de um determinado tipo de resíduo que o usuário precisa reciclar.
            </Typography>
            <Typography variant="body1">
              Quando um usuário completa todos os desafios de uma meta, ele recebe os pontos definidos e a meta é marcada como concluída em seu perfil.
            </Typography>
          </Paper>
        </Box>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>{editMode ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Data Inicial"
                    value={formData.initialDate}
                    onChange={(newValue) => handleDateChange('initialDate', newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal",
                        error: !!formErrors.initialDate || !!formErrors.dates,
                        helperText: formErrors.initialDate || formErrors.dates
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Data Final"
                    value={formData.validUntil}
                    onChange={(newValue) => handleDateChange('validUntil', newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal",
                        error: !!formErrors.validUntil || !!formErrors.dates,
                        helperText: formErrors.validUntil || formErrors.dates
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pontos"
                  name="points"
                  type="number"
                  value={formData.points}
                  onChange={handleChange}
                  error={!!formErrors.points}
                  helperText={formErrors.points}
                  margin="normal"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Desafios
                </Typography>
                {!!formErrors.challenges && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formErrors.challenges}
                  </Alert>
                )}
                
                <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <Autocomplete
                        options={wasteTypes}
                        getOptionLabel={(option) => option.name || ''}
                        value={currentChallenge.waste}
                        onChange={(event, newValue) => {
                          handleChallengeChange('waste', newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Tipo de Resíduo"
                            fullWidth
                            margin="normal"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Valor"
                        type="number"
                        value={currentChallenge.value}
                        onChange={(e) => handleChallengeChange('value', e.target.value)}
                        margin="normal"
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          value={currentChallenge.type}
                          onChange={(e) => handleChallengeChange('type', e.target.value)}
                          label="Tipo"
                        >
                          <MenuItem value="quantity">Quantidade</MenuItem>
                          <MenuItem value="weight">Peso (kg)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={addChallenge}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Adicionar
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
                
                <List>
                  {challenges.map((challenge, index) => (
                    <Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={challenge.waste?.name || 'Resíduo'}
                          secondary={`Meta: ${challenge.value} ${challenge.type === 'weight' ? 'kg' : 'unidades'}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" color="error" onClick={() => removeChallenge(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < challenges.length - 1 && <Divider />}
                    </Fragment>
                  ))}
                  {challenges.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Nenhum desafio adicionado"
                        secondary="Adicione pelo menos um desafio para esta meta"
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editMode ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  );
}
