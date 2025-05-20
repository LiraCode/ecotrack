'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import {
  Person,
  LocationOn,
  History,
  Edit,
  Add,
  EmojiEvents,
  Security
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/page';
import { useAuth } from '@/context/AuthContext';
import EditProfileDialog from '@/components/Profile/EditProfileDialog';
import EditAddressDialog from '@/components/Profile/EditAddressDialog';
import AddressList from '@/components/Profile/AddressList';
import ChangePasswordForm from '@/components/Profile/ChangePasswordForm';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openEditAddressDialog, setOpenEditAddressDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Detectar se é dispositivo móvel
  useEffect(() => {
    setIsMobile(window.innerWidth < 600);
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carregar dados do usuário quando a página for montada
  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserAddresses();
      fetchUserSchedules();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${user.uid}/profile/user`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data:', await response.text());
        setError('Erro ao carregar dados do usuário');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const response = await fetch(`/api/users/${user.uid}/addresses`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data || []);
      } else {
        console.error('Failed to fetch user addresses:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching user addresses:', error);
    }
  };

  const fetchUserSchedules = async () => {
    try {
      const response = await fetch(`/api/schedule?userId=${user.uid}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data || []);
      } else {
        console.error('Failed to fetch user schedules:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching user schedules:', error);
    }
  };



  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditProfile = () => {

    setOpenEditDialog(true);
  };


  const handleEditAddress = (address) => {
    console.log("Editando endereço:", address);
    if (address) {
      setSelectedAddress(address);
      setOpenEditAddressDialog(true);
    } else {
      alert('Selecione um endereço para editar.');
      setOpenEditAddressDialog(true);
    }


  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    // Recarregar dados após fechar o diálogo para refletir as alterações
    fetchUserData();
    fetchUserAddresses();
  };
  const handleCloseEditAddressDialog = () => {
    setOpenEditAddressDialog(false);
    // Recarregar dados após fechar o diálogo para refletir as alterações
    fetchUserData();
    fetchUserAddresses();
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        },
      });

      if (response.ok) {
        // Atualizar a lista de endereços após a exclusão
        fetchUserAddresses();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao remover endereço');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Erro ao remover endereço. Tente novamente mais tarde.');
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obter status com cor
  const getStatusChip = (status) => {
    let color = 'default';

    if (status.toLowerCase().includes('aguardando')) {
      color = 'warning';
    } else if (status.toLowerCase().includes('confirmado')) {
      color = 'info';
    } else if (status.toLowerCase().includes('concluído')) {
      color = 'success';
    } else if (status.toLowerCase().includes('cancelado')) {
      color = 'error';
    }

    return (
      <Chip
        label={status}
        size="small"
        color={color}
        sx={{ ml: 1 }}
      />
    );
  };

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
            <CircularProgress color="success" />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Cabeçalho do Perfil */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                background: "linear-gradient(to right, #e8f5e9, #f1f8e9)",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
              >
                <Avatar
                  src={(user && user.photoURL) || "images/generic-user.png"}
                  alt={userData.name || "Perfil"}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "#2e7d32",
                    mr: 3,
                  }}
                ></Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{ color: "#2e7d32", fontWeight: "bold" }}
                  >
                    {userData?.name || user?.displayName || "Usuário"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {userData?.email || user?.email}
                  </Typography>
                  {userData?.phone && (
                    <Typography variant="body2" color="text.secondary">
                      Telefone: {userData.phone}
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEditProfile}
                  sx={{
                    borderColor: "#2e7d32",
                    color: "#2e7d32",
                    "&:hover": {
                      borderColor: "#1b5e20",
                      backgroundColor: "#f1f8e9",
                    },
                  }}
                >
                  Editar Perfil
                </Button>
              </Box>
            </Paper>

            {/* Abas de Conteúdo */}
            <Box sx={{ width: "100%", mb: 4 }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons={isMobile ? "auto" : false}
                  sx={{
                    "& .MuiTab-root": {
                      fontWeight: "bold",
                      color: "#555",
                      "&.Mui-selected": { color: "#2e7d32" },
                    },
                    "& .MuiTabs-indicator": { backgroundColor: "#2e7d32" },
                  }}
                >
                  <Tab
                    icon={<Person />}
                    label="Dados Pessoais"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<LocationOn />}
                    label="Endereços"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<History />}
                    label="Histórico"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<EmojiEvents />}
                    label="Conquistas"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<Security />}
                    label="Senha e Segurança"
                    iconPosition="start" />
                </Tabs>
              </Box>

              {/* Aba de Dados Pessoais */}
              {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: "#2e7d32" }}>
                    Informações Pessoais
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, height: "100%" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nome Completo
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {userData?.name ||
                            user?.displayName ||
                            "Não informado"}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, height: "100%" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {userData?.email || user?.email}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, height: "100%" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          CPF
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {userData?.cpf || "Não informado"}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, height: "100%" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Telefone
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {userData?.phone || "Não informado"}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleEditProfile}
                      sx={{
                        backgroundColor: "#2e7d32",
                        "&:hover": {
                          backgroundColor: "#1b5e20",
                        },
                      }}
                    >
                      Editar Informações
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Aba de Endereços */}
              {activeTab === 1 && (
                <Box sx={{ p: 3 }}>
                  <Box
                    sx={{
                      mb: 3,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#2e7d32" }}>
                      Meus Endereços
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleEditProfile}
                      sx={{
                        backgroundColor: "#2e7d32",
                        "&:hover": {
                          backgroundColor: "#1b5e20",
                        },
                      }}
                    >
                      Adicionar Endereço
                    </Button>
                  </Box>

                  <AddressList
                    addresses={addresses}
                    onEdit={(address) => handleEditAddress(address)}
                    onDelete={handleDeleteAddress}
                  />
                </Box>
              )}

              {/* Aba de Histórico */}
              {activeTab === 2 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: "#2e7d32" }}>
                    Histórico de Agendamentos
                  </Typography>
                  {schedules.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <History sx={{ fontSize: 60, color: "#ccc", mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        Você ainda não possui agendamentos.
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {schedules.map((schedule) => (
                        <Paper
                          key={schedule._id}
                          elevation={1}
                          sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: 2,
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              flexWrap: "wrap",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold" }}
                              >
                                {schedule.collectionPointId?.name || "Ecoponto"}
                                {getStatusChip(schedule.status)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Data: {formatDate(schedule.date)}
                                {schedule.time &&
                                  ` - Horário: ${schedule.time}`}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Materiais:{" "}
                                {schedule.wastes
                                  ?.map((w) => w.wasteId?.name || "Resíduo")
                                  .join(", ")}
                              </Typography>
                            </Box>

                            <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                  borderColor: "#2e7d32",
                                  color: "#2e7d32",
                                  mr: 1,
                                }}
                                href={`/agendamento/`}
                              >
                                Detalhes
                              </Button>

                              {schedule.status !== "Cancelado" &&
                                schedule.status !== "Concluído" && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleCancelSchedule(schedule._id)
                                    }
                                  >
                                    Cancelar
                                  </Button>
                                )}
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              {/* Aba de conquista */}
              {activeTab === 3 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: "#2e7d32" }}>
                    Feature em desenvolvimento
                  </Typography>
                </Box>
              )}
              {/* Aba de Senha e Segurança */}
              {activeTab === 4 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: "#2e7d32" }}>
                    Senha e Segurança
                  </Typography>
                  
                  <ChangePasswordForm />
                </Box>
              )}
            </Box>
          </>
        )}
      </Container>

      {/* Diálogo de Edição de Perfil */}
      <EditProfileDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        isMobile={isMobile}
      />
      {/* Diálogo de Edição de Endereço */}
      <EditAddressDialog
        open={openEditAddressDialog}
        onClose={handleCloseEditAddressDialog}
        address={selectedAddress}
        isMobile={isMobile}
      />
    </AppLayout>
  );
}
