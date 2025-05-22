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
  Alert
} from '@mui/material';
import {
  Person,
  Edit,
  Security
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/page';
import { useAuth } from '@/context/AuthContext';
import EditAdminProfileDialog from '@/components/Profile/EditAdminProfileDialog';
import ChangePasswordForm from '@/components/Profile/ChangePasswordForm';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(
    {
      name: '',
      email: '',
      phone: '',
      role: ''
    }
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é dispositivo móvel
  useEffect(() => {
    setIsMobile(window.innerWidth < 600);
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carregar dados do administrador quando a página for montada
  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin?uid=${user.uid}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
    
      if (response.ok) {
        const data = await response.json();
        console.log('Admin data response:', data); // Log para depuração
         if (data.success && data.admins && data.admins.length > 0) {
          // Formato alternativo: { success: true, admins: [ ... ] }
          const adminData = data.admins[0];
          console.log('Admin data response 2:',adminData.name); // Log para depuração
          setUserData({
            name: adminData.name || '',
            email: adminData.email || user.email || '',
            phone: adminData.phone || '',
            role: adminData.role || 'Administrador'
          });
        } else {
          // Nenhum formato reconhecido
          console.error('Formato de resposta não reconhecido:', data);
          setError('Erro ao carregar dados do administrador: formato de resposta inesperado');
        
          // Usar dados do usuário do Firebase como fallback
          setUserData({
            name: user.displayName || '',
            email: user.email || '',
            phone: '',
            role: 'Administrador'
          });
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch admin data:', errorText);
        setError('Erro ao carregar dados do administrador');
        
        // Usar dados do usuário do Firebase como fallback
        setUserData({
          name: user.displayName || '',
          email: user.email || '',
          phone: '',
          role: 'Administrador'
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Erro ao carregar dados do administrador');
    
      // Usar dados do usuário do Firebase como fallback
      setUserData({
        name: user.displayName || '',
        email: user.email || '',
        phone: '',
        role: 'Administrador'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditProfile = () => {
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    // Recarregar dados após fechar o diálogo para refletir as alterações
    fetchAdminData();
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
                  src={(user && user.photoURL) || "/images/generic_user.png"}
                  alt={userData?.name || "Perfil"}
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
                    {userData?.name || user?.displayName || "Administrador"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {userData?.email || user?.email}
                  </Typography>
                  {userData?.phone && (
                    <Typography variant="body2" color="text.secondary">
                      Telefone: {userData.phone}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Função: {userData?.role || "Administrador"}
                  </Typography>
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
                    icon={<Security />}
                    label="Senha e Segurança"
                    iconPosition="start" 
                  />
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
                          Função
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {userData?.role || "Administrador"}
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

              {/* Aba de Senha e Segurança */}
              {activeTab === 1 && (
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
      <EditAdminProfileDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        isMobile={isMobile}
      />
    </AppLayout>
  );
}