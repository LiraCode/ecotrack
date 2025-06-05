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
import {
  registerResponsible,
  updateResponsible,
  deleteResponsible,
  getResponsibles,
} from "@/services/responsibleService";

export default function ResponsiblePage() {
  const { user } = useAuth();
  const [responsibles, setResponsibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentResponsible, setCurrentResponsible] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', severity: 'info' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    passwordConfirmation: '',
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [open, setOpen] = useState(false);
  
  // obter status da sidebar do localStorage
  useEffect(() => {
    const sidebarStatus = localStorage.getItem('sidebarOpen');
    if (sidebarStatus === 'true') {
      setSidebarOpen(true);
      //verificar tamanho da tela se for maior que 768px setar sidebarOpen como true
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
        localStorage.setItem('sidebarOpen', 'false');
        setIsMobile(false);
      }
    }
  }, []);

  const showAlert = (message, severity = 'info') => {
    setAlertInfo({ show: true, message, severity });
    setTimeout(() => {
      setAlertInfo({ show: false, message: '', severity: 'info' });
    }, 5000);
  };

  const fetchResponsibles = useCallback(async () => {
    if (!user || !user.accessToken) {
      console.log("Usuário não autenticado ou token não disponível");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Buscando responsáveis...");
      const token = user.accessToken;
      const responsiblesData = await getResponsibles(token);
      console.log("Responsáveis recebidos:", responsiblesData);
      
      // Verificar se responsiblesData é um array
      if (Array.isArray(responsiblesData)) {
        setResponsibles(responsiblesData);
      } else {
        console.error("Dados recebidos não são um array:", responsiblesData);
        setResponsibles([]);
      }
    } catch (error) {
      console.error('Erro ao buscar responsáveis:', error);
      showAlert('Erro ao carregar responsáveis', 'error');
      setResponsibles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchResponsibles();
    }
  }, [user, fetchResponsibles]);

  const handleOpen = (responsible) => {
    if (responsible) {
      setEditMode(true);
      setCurrentResponsible(responsible);
      setFormData({
        name: responsible.name,
        email: responsible.email,
        phone: responsible.phone || '',
        cpf: responsible.cpf || '',
      });
    } else {
      setEditMode(false);
      setCurrentResponsible(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        password: '',
        confirmPassword: ''
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
      [name]: value
    });
  };

  const validateForm = () => {
    // Validação básica
    if (!formData.name.trim()) {
      showAlert('Nome é obrigatório', 'error');
      return false;
    }
    
    if (!formData.email.trim()) {
      showAlert('Email é obrigatório', 'error');
      return false;
    }
    
    if (!editMode && !formData.password) {
      showAlert('Senha é obrigatória', 'error');
      return false;
    }
    
    if (!editMode && formData.password !== formData.confirmPassword) {
      showAlert('As senhas não coincidem', 'error');
      return false;
    }
    
    if (!formData.cpf.trim()) {
      showAlert('CPF é obrigatório', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (editMode) {
        const result = await updateResponsible(
          user.accessToken,
          currentResponsible._id,
          {
            name: formData.name,
            phone: formData.phone,
            cpf: formData.cpf
          }
        );
        
        if (result.success) {
          showAlert('Responsável atualizado com sucesso!', 'success');
          handleClose();
          // Chamar fetchResponsibles fora do useEffect
          await fetchResponsibles();
        } else {
          showAlert(result.error || 'Erro ao atualizar responsável', 'error');
        }
      } else {
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cpf: formData.cpf
        };
        
        // Obter o token do usuário atual
        const token = user.accessToken;
        
        const result = await registerResponsible(token, formData.email, formData.password, userData);
        
        if (result.success) {
          showAlert('Responsável criado com sucesso!', 'success');
          handleClose();
          // Chamar fetchResponsibles fora do useEffect com um pequeno delay
          setTimeout(async () => {
            await fetchResponsibles();
          }, 500);
        } else {
          showAlert(result.error || 'Erro ao criar responsável', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar responsável:', error);
      showAlert('Erro ao salvar responsável', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (responsible) => {
    if (window.confirm(`Tem certeza que deseja excluir o responsável ${responsible.name}?`)) {
      try {
        setLoading(true);
        const result = await deleteResponsible(user.accessToken, responsible._id);
        
        if (result.success) {
          showAlert('Responsável excluído com sucesso!', 'success');
          // Chamar fetchResponsibles fora do useEffect
          await fetchResponsibles();
        } else {
          showAlert(result.error || 'Erro ao excluir responsável', 'error');
        }
      } catch (error) {
        console.error('Erro ao excluir responsável:', error);
        showAlert('Erro ao excluir responsável', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseAlert = () => {
    setAlertInfo({ ...alertInfo, show: false });
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
              Gerenciamento de Responsáveis
            </Typography>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Novo Responsável
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responsibles.map((responsible) => (
                  <TableRow key={responsible._id}>
                    <TableCell>{responsible.name}</TableCell>
                    <TableCell>{responsible.email}</TableCell>
                    <TableCell>{responsible.phone || "Não informado"}</TableCell>
                    <TableCell>{responsible.cpf || "Não informado"}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpen(responsible)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(responsible)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {responsibles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum responsável cadastrado
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
            Sobre os Responsáveis
          </Typography>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="body1" paragraph>
              Os Responsáveis são pessoas designadas para gerenciar ecopontos no sistema EcoTrack.
              Eles têm permissões para cadastrar e manter informações sobre seus ecopontos, 
              incluindo tipos de resíduos aceitos e horários de funcionamento.
            </Typography>
            <Typography variant="body1" paragraph>
              Cada Responsável pode gerenciar um ou mais ecopontos, sendo o ponto de contato
              principal para questões relacionadas a esses locais.
            </Typography>
            <Typography variant="body1">
              Mantenha esta lista atualizada para garantir que apenas pessoas
              autorizadas tenham acesso às funcionalidades de gerenciamento de ecopontos.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Dialog para adicionar/editar responsável */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ bgcolor: "#f5f5f5", color: "#2e7d32", fontWeight: "bold" }}
        >
          {editMode ? "Editar Responsável" : "Novo Responsável"}
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
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                    disabled={editMode} // Email não pode ser alterado na edição
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Grid>
                              <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="CPF"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Seção: Senha (apenas para novos responsáveis) */}
            {!editMode && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                  Credenciais de Acesso
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Senha"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirmar Senha"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para alertas */}
      <Snackbar
        open={alertInfo.show}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertInfo.severity}
          sx={{ width: "100%" }}
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
