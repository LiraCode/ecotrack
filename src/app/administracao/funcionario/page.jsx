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
  registerAdmin,
  updateAdmin,
  deleteAdmin,
  getAdmins,
} from "@/services/adminService";
import { ca } from 'date-fns/locale';

export default function AdminPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', severity: 'info' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Admin',
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

  const fetchAdmins = useCallback(async () => {
    if (!user || !user.accessToken) {
      console.log("Usuário não autenticado ou token não disponível");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // console.log("Buscando administradores...");
      const token = user.accessToken;
      const adminsData = await getAdmins(token);
      // console.log("Administradores recebidos:", adminsData);
      
      // Verificar se adminsData é um array
      if (Array.isArray(adminsData)) {
        setAdmins(adminsData);
      } else {
        console.error("Dados recebidos não são um array:", adminsData);
        setAdmins([]);
      }
    } catch (error) {
      console.error('Erro ao buscar administradores:', error);
      showAlert('Erro ao carregar administradores', 'error');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAdmins();
    }
  }, [user, fetchAdmins]);

  const handleOpen = (admin) => {
    if (admin) {
      setEditMode(true);
      setCurrentAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        phone: admin.phone || '',
        role: admin.role || 'Employee',
      });
    } else {
      setEditMode(false);
      setCurrentAdmin(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Administrador',
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

    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (editMode) {
        // Código para edição permanece o mesmo...
        const result = await updateAdmin(
          user.accessToken,
          currentAdmin._id,
          {
            name: formData.name,
            phone: formData.phone,
            role: formData.role
          }
        );
        
        if (result.success) {
          showAlert('Administrador atualizado com sucesso!', 'success');
          handleClose();
          // Chamar fetchAdmins fora do useEffect
          await fetchAdmins();
        } else {
          showAlert(result.error || 'Erro ao atualizar administrador', 'error');
        }
      } else {
        // Para criação, usamos diretamente a função registerAdmin
        const userData = {
          name: formData.name,  // Ajustado para corresponder ao que registerAdmin espera
          email: formData.email,
          phone: formData.phone,
          role: formData.role || 'Agente'
        };
        
        // Obter o token do usuário atual
        const token = user.accessToken;
        
        // Passar o token como primeiro parâmetro
        const result = await registerAdmin(token, formData.password, userData);
        
        if (result.success) {
          showAlert('Administrador criado com sucesso!', 'success');
          handleClose();
          // Chamar fetchAdmins fora do useEffect com um pequeno delay
          setTimeout(async () => {
            await fetchAdmins();
          }, 500);
        } else {
          showAlert(result.error || 'Erro ao criar administrador', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar administrador:', error);
      showAlert('Erro ao salvar administrador', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (admin) => {
    if (window.confirm(`Tem certeza que deseja excluir o administrador ${admin.name}?`)) {
      try {
        setLoading(true);
        const result = await deleteAdmin(user.accessToken, admin._id);
        
        if (result.success) {
          showAlert('Administrador excluído com sucesso!', 'success');
          // Chamar fetchAdmins fora do useEffect
          await fetchAdmins();
        } else {
          showAlert(result.error || 'Erro ao excluir administrador', 'error');
        }
      } catch (error) {
        console.error('Erro ao excluir administrador:', error);
        showAlert('Erro ao excluir administrador', 'error');
      } finally {
        setLoading(false);
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
              Gerenciamento de Administradores
            </Typography>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Novo Administrador
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Função</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.phone || "Não informado"}</TableCell>
                    <TableCell>{admin.role || "Administrador"}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpen(admin)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(admin)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum administrador cadastrado
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
            Sobre os Administradores
          </Typography>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="body1" paragraph>
              Os Administradores são responsáveis pela gestão do sistema
              EcoTrack, incluindo o cadastro e manutenção de ecopontos,
              funcionários, tipos de resíduos e outras configurações essenciais.
            </Typography>
            <Typography variant="body1" paragraph>
              Cada Administrador possui permissões para gerenciar diferentes
              aspectos do sistema, conforme sua função designada.
            </Typography>
            <Typography variant="body1">
              Mantenha esta lista atualizada para garantir que apenas pessoas
              autorizadas tenham acesso administrativo ao sistema.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Dialog para adicionar/editar administrador */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ bgcolor: "#f5f5f5", color: "#2e7d32", fontWeight: "bold" }}
        >
          {editMode ? "Editar Administrador" : "Novo Administrador"}
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
                  <FormControl
                    fullWidth
                    margin="normal"
                    sx={{ minWidth: "200px" }} // Adicionando largura mínima
                  >
                    <InputLabel>Função</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Função"
                      sx={{ minWidth: "200px" }} // Adicionando largura mínima
                    >
                      <MenuItem value="Administrador">Administrador</MenuItem>
                      <MenuItem value="Agente">Funcionário</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Seção: Senha - Mostrar apenas no modo de cadastro */}
            {!editMode && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                  Definir Senha
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
                      helperText="Mínimo de 6 caracteres"
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
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para alertas */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
