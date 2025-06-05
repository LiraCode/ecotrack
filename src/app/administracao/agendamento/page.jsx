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
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  FormHelperText
} from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { date } from 'zod';

export default function AgendamentoManagement() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAgendamento, setCurrentAgendamento] = useState(null);
  const [ecopontos, setEcopontos] = useState([]);
  const [users, setUsers] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [activeTab, setActiveTab] = useState(4); // 4 corresponde ao tab "Todos"
  const [loading, setLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    collectionPointId: "",
    date: new Date(),
    time: "",
    status: "Aguardando Confirmação",
    wastes: [{ wasteId: "", quantity: 1, weight: 0 }],
  });

  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // obter status da sidebar do localStorage
  useEffect(() => {
    const sidebarStatus = localStorage.getItem("sidebarOpen");
    if (sidebarStatus === "true") {
      setSidebarOpen(true);
      //verificar tamanho da tela se for maior que 768px setar sidebarOpen como true
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
        localStorage.setItem("sidebarOpen", "false");
        setIsMobile(false);
      }
    }
  }, []);

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const fetchAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/schedule", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAgendamentos(data);
      } else {
        showAlert(data.message || "Erro ao carregar agendamentos", "error");
      }
    } catch (error) {
      showAlert("Erro ao carregar agendamentos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEcopontos = useCallback(async () => {
    try {
      const response = await fetch("/api/collection-points",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setEcopontos(data);
      } else {
        showAlert(data.message || "Erro ao carregar ecopontos", "error");
      }
    } catch (error) {
      showAlert("Erro ao carregar ecopontos", "error");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        showAlert(data.message || "Erro ao carregar usuários", "error");
      }
    } catch (error) {
      showAlert("Erro ao carregar usuários", "error");
    }
  }, []);

  const fetchWasteTypes = useCallback(async () => {
    try {
      const response = await fetch("/api/waste");
      const data = await response.json();
      if (response.ok) {
        if (data.wasteTypes && Array.isArray(data.wasteTypes)) {
          setWasteTypes(data.wasteTypes);
        } else if (Array.isArray(data)) {
          setWasteTypes(data);
        } else {
          setWasteTypes([]);
          console.error("Unexpected waste types response format:", data);
        }
      }
    } catch (error) {
      showAlert("Erro ao carregar tipos de resíduos", "error");
      console.error("Error fetching waste types:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAgendamentos();
      fetchEcopontos();
      fetchUsers();
      fetchWasteTypes();
    }
  }, [user, fetchAgendamentos, fetchEcopontos, fetchUsers, fetchWasteTypes]);


  // funcion extrair o horário do agendamento
  const formattedTime = (date) => {
    const scheduleDate = new Date(date);
    return scheduleDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpen = (agendamento = null) => {
    if (agendamento) {
      setEditMode(true);
      setCurrentAgendamento(agendamento);

      setFormData({
        userId: agendamento.userId._id,
        collectionPointId: agendamento.collectionPointId._id,
        date: new Date(agendamento.date),
        time: formattedTime(agendamento.date) || "",
        status: agendamento.status,
        wastes: agendamento.wastes.map((waste) => ({
          wasteId: waste.wasteId._id,
          quantity: waste.quantity,
          weight: waste.weight,
        })),
      });
    } else {
      setEditMode(false);
      setCurrentAgendamento(null);
      setFormData({
        userId: "",
        collectionPointId: "",
        date: new Date(),
        time: formattedTime || "",
        status: "Aguardando Confirmação",
        wastes: [{ wasteId: "", quantity: 1, weight: 0 }],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTimeChange = (newTime) => {
    if (!newTime) return;

    // Create a new date object with the current date but updated time
    const updatedDate = new Date(formData.date);

    // Extract hours and minutes from the new time
    const hours = newTime.getHours();
    const minutes = newTime.getMinutes();

    // Set the hours and minutes to the date
    updatedDate.setHours(hours);
    updatedDate.setMinutes(minutes);

    setFormData({
      ...formData,
      date: updatedDate,
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    });
    handleDateChange(updatedDate);
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date,
    });
  };

  const handleWasteChange = (index, field, value) => {
    const updatedWastes = [...formData.wastes];
    updatedWastes[index] = {
      ...updatedWastes[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      wastes: updatedWastes,
    });
  };

  const addWaste = () => {
    setFormData({
      ...formData,
      wastes: [...formData.wastes, { wasteId: "", quantity: 1, weight: 0 }],
    });
  };

  const removeWaste = (index) => {
    if (formData.wastes.length > 1) {
      const updatedWastes = formData.wastes.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        wastes: updatedWastes,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (editMode) {
        console.log(formData);
        response = await fetch(`/api/schedule/${currentAgendamento._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        
        response = await fetch("/api/schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();
      if (response.ok) {
        showAlert(
          editMode
            ? "Agendamento atualizado com sucesso!"
            : "Agendamento criado com sucesso!",
          "success"
        );
        handleClose();
        fetchAgendamentos();
      } else {
        showAlert(data.message || "Erro ao salvar agendamento", "error");
      }
    } catch (error) {
      showAlert("Erro ao salvar agendamento", "error");
    }
  };

  const handleOpenDeleteConfirm = (id) => {
    setAgendamentoToDelete(id);
    setConfirmDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/schedule/${agendamentoToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        showAlert("Agendamento excluído com sucesso!", "success");
        setConfirmDeleteOpen(false);
        setAgendamentoToDelete(null);
        fetchAgendamentos();
      } else {
        const data = await response.json();
        showAlert(data.message || "Erro ao excluir agendamento", "error");
      }
    } catch (error) {
      showAlert("Erro ao excluir agendamento", "error");
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filtrar agendamentos por status
  const getFilteredAgendamentos = () => {
    if (activeTab === 0)
      return agendamentos.filter(
        (a) => a.status === "Aguardando confirmação do Ponto de Coleta"
      );
    if (activeTab === 1)
      return agendamentos.filter((a) => a.status === "Confirmado");
    if (activeTab === 2)
      return agendamentos.filter((a) => a.status === "Coletado");
    if (activeTab === 3)
      return agendamentos.filter((a) => a.status === "Cancelado");
    return agendamentos; // Tab 'Todos'
  };

  const filteredAgendamentos = getFilteredAgendamentos();

  // Formatar data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Obter chip de status com cor apropriada
  const getStatusChip = (status) => {
    let color = "default";

    if (status === "Aguardando confirmação do Ponto de Coleta") {
      color = "warning";
    } else if (status === "Confirmado") {
      color = "info";
    } else if (status === "Coletado") {
      color = "success";
    } else if (status === "Cancelado") {
      color = "error";
    }

    return <Chip label={status} color={color} size="small" />;
  };

  // Adicionar função para contar agendamentos por status
  const getStatusCount = (status) => {
    return agendamentos.filter(ag => ag.status === status).length;
  };

  if (loading && agendamentos.length === 0) {
    return (
      <AppLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress color="success" />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Carregando...
          </Typography>
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
              Gerenciamento de Agendamentos
            </Typography>

            <Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchAgendamentos}
                sx={{ mr: 1 }}
              >
                Atualizar
              </Button>
            </Box>
          </Box>

          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  fontWeight: "medium",
                  textTransform: "none",
                },
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    AGUARDANDO
                    <Chip 
                      size="small" 
                      label={getStatusCount('Aguardando confirmação do Ponto de Coleta')} 
                      color="warning"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    CONFIRMADOS
                    <Chip 
                      size="small" 
                      label={getStatusCount('Confirmado')} 
                      color="info"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    COLETADOS
                    <Chip 
                      size="small" 
                      label={getStatusCount('Coletado')} 
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    CANCELADOS
                    <Chip 
                      size="small" 
                      label={getStatusCount('Cancelado')} 
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    TODOS
                    <Chip 
                      size="small" 
                      label={agendamentos.length} 
                      color="default"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
              />
            </Tabs>
          </Paper>

          {/* Adicionar mensagem informativa do filtro atual */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 4 
                ? `Mostrando todos os ${agendamentos.length} agendamentos` 
                : `Mostrando ${filteredAgendamentos.length} agendamentos ${
                    activeTab === 0 ? 'aguardando confirmação do Ponto de Coleta' :
                    activeTab === 1 ? 'confirmados' :
                    activeTab === 2 ? 'coletados' :
                    'cancelados'
                  }`
              }
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Ecoponto</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Horário</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Resíduos</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAgendamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Nenhum agendamento encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgendamentos.map((agendamento) => (
                    <TableRow key={agendamento._id} hover>
                      <TableCell>
                        {agendamento.userId?.name || "Cliente não encontrado"}
                      </TableCell>
                      <TableCell>
                        {agendamento.collectionPointId?.name ||
                          "Ecoponto não encontrado"}
                      </TableCell>
                      <TableCell>{formatDate(agendamento.date)}</TableCell>
                      <TableCell>
                        {formattedTime(agendamento.date) || "Não definido"}
                      </TableCell>
                      <TableCell>{getStatusChip(agendamento.status)}</TableCell>
                      <TableCell>
                        {agendamento.wastes && agendamento.wastes.length > 0 ? (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {agendamento.wastes.map((waste, index) => ( 
                              <Chip
                                key={index}
                                size="small"
                                label={`${waste.wasteId?.type || "Desconhecido"
                                  } (${waste.quantity < 1 ? waste.weight : waste.quantity} ${waste.weight > 0 ? "kg" : "Un"}.)`}
                                sx={{ bgcolor: "#e8f5e9", color: "#2e7d32" }}
                              />
                            ))}
                          </Box>
                        ) : (
                          "Nenhum resíduo"
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpen(agendamento)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleOpenDeleteConfirm(agendamento._id)
                          }
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Diálogo de edição/criação de agendamento */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Editar Agendamento" : "Novo Agendamento"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Cliente</InputLabel>
                <Select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  label="Cliente"
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ecoponto</InputLabel>
                <Select
                  name="collectionPointId"
                  value={formData.collectionPointId}
                  onChange={handleChange}
                  label="Ecoponto"
                >
                  {ecopontos.map((ecoponto) => (
                    <MenuItem key={ecoponto._id} value={ecoponto._id}>
                      {ecoponto.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DatePicker
                  label="Data"
                  value={formData.date}
                  onChange={handleDateChange}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <TimePicker
                  label="Horário"
                  value={formData.date}
                  onChange={handleDateChange}
                  ampm={false}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="Aguardando confirmação do Ponto de Coleta">
                    Aguardando confirmação do Ponto de Coleta
                  </MenuItem>
                  <MenuItem value="Coletado">Coletado</MenuItem>
                  <MenuItem value="Confirmado">Confirmado</MenuItem>
                  <MenuItem value="Cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, mt: 2 }}>
                Resíduos
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {formData.wastes.map((waste, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Resíduo</InputLabel>
                        <Select
                          value={waste.wasteId}
                          onChange={(e) =>
                            handleWasteChange(index, "wasteId", e.target.value)
                          }
                          label="Tipo de Resíduo"
                          sx={{ minWidth: "150px" }}
                        >
                          {wasteTypes.map((type) => (
                            <MenuItem key={type._id} value={type._id}>
                              {type.type || type.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Quantidade"
                        type="number"
                        value={waste.quantity}
                        onChange={(e) =>
                          handleWasteChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Peso (kg)"
                        type="number"
                        value={waste.weight}
                        onChange={(e) =>
                          handleWasteChange(
                            index,
                            "weight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => removeWaste(index)}
                        disabled={formData.wastes.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                variant="outlined"
                color="primary"
                onClick={addWaste}
                sx={{ mt: 1 }}
              >
                Adicionar Resíduo
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? "Salvar Alterações" : "Criar Agendamento"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para exclusão */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este agendamento? Esta ação não pode
            ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para alertas */}
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