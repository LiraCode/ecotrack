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
  Business,
  Edit,
  Security
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/page';
import { useAuth } from '@/context/AuthContext';
import EditResponsibleProfileDialog from '@/components/Profile/EditResponsibleProfileDialog';
import ChangePasswordForm from '@/components/Profile/ChangePasswordForm';
import OrganizationsList from '@/components/Profile/OrganizationsList';
import { useRouter } from 'next/navigation';

export default function ResponsibleProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState(null);
  const [organizations, setOrganizations] = useState([]);
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

  // Carregar dados do responsável quando a página for montada
  useEffect(() => {
    if (user) {
      fetchResponsibleData();
      fetchResponsibleOrganizations();
    }
  }, [user]);

  const fetchResponsibleData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/responsible?uid=${user.uid}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.responsible);
      } else {
        console.error('Failed to fetch responsible data:', await response.text());
        setError('Erro ao carregar dados do responsável');
      }
    } catch (error) {
      console.error('Error fetching responsible data:', error);
      setError('Erro ao carregar dados do responsável');
    } finally {
      setLoading(false);
    }
  };

  const fetchResponsibleOrganizations = async () => {
    try {
      const response = await fetch(`/api/responsible/${user.uid}/profile/organizations`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      } else {
        console.error('Failed to fetch responsible organizations:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching responsible organizations:', error);
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
    fetchResponsibleData();
  };

  const handleViewOrganizationDetails = (orgId) => {
    router.push(`/ecopontos/${orgId}`);
  };

  return (
    <AppLayout>
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 8,
          px: isMobile ? 1 : 3
        }}
      >
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
              elevation={3}
              sx={{
                p: isMobile ? 2 : 4,
                mb: 4,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "center" : "flex-start",
                  gap: 2
                }}
              >
                <Avatar
                  src={userData?.photoURL || user?.photoURL}
                  alt={userData?.name || user?.displayName}
                  sx={{
                    width: isMobile ? 60 : 80,
                    height: isMobile ? 60 : 80,
                    bgcolor: "primary.main",
                    mr: isMobile ? 0 : 3,
                  }}
                >
                  {(userData?.name || user?.displayName || "P")[0].toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    sx={{ color: "primary.main", fontWeight: "bold" }}
                  >
                    {userData?.name || user?.displayName || "Parceiro"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "text.secondary" }}
                  >
                    {userData?.email || user?.email}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                  >
                    Telefone: {userData?.phone || "Não informado"}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  onClick={handleEditProfile}
                  sx={{
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                      borderColor: "primary.dark",
                      backgroundColor: "action.hover",
                    },
                    width: isMobile ? "100%" : "auto"
                  }}
                >
                  Editar Perfil
                </Button>
              </Box>
            </Paper>

            {/* Abas de Conteúdo */}
            <Box sx={{ width: "100%", mb: 4 }}>
              <Box sx={{ 
                borderBottom: 1, 
                borderColor: "divider",
                overflowX: isMobile ? 'auto' : 'hidden',
                '.MuiTabs-flexContainer': {
                  gap: isMobile ? 1 : 0
                },
                '.MuiTabs-root': {
                  minHeight: isMobile ? '48px' : '64px'
                },
                '.MuiTab-root': {
                  minHeight: isMobile ? '48px' : '64px',
                  fontSize: isMobile ? '0.75rem' : 'inherit',
                  minWidth: isMobile ? '120px' : '160px',
                  padding: isMobile ? '6px 12px' : '12px 16px'
                }
              }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons={isMobile ? "auto" : false}
                  allowScrollButtonsMobile
                  sx={{
                    "& .MuiTab-root": {
                      fontWeight: "bold",
                      color: "text.secondary",
                      "&.Mui-selected": { color: 'primary.main' },
                      "& .MuiSvgIcon-root": {
                        fontSize: isMobile ? '1.2rem' : '1.5rem',
                        marginBottom: isMobile ? '0' : '4px'
                      }
                    },
                    "& .MuiTabs-indicator": { backgroundColor: 'primary.main' },
                    "& .MuiTabs-scrollButtons": {
                      color: 'primary.main',
                      '&.Mui-disabled': {
                        opacity: 0.3
                      }
                    }
                  }}
                >
                  <Tab
                    icon={<Person />}
                    label="Dados Pessoais"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<Business />}
                    label="Ecopontos"
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
                <Box sx={{ p: isMobile ? 1 : 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                    Informações Pessoais
                  </Typography>

                  <Grid container spacing={isMobile ? 2 : 3}>
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
                </Box>
              )}

              {/* Aba de Ecopontos */}
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
                    <Typography variant="h6" sx={{ color: 'primary.main' }}>
                      Meus Ecopontos
                    </Typography>
                    
                  </Box>

                  <OrganizationsList
                    organizations={organizations}
                    onViewDetails={handleViewOrganizationDetails}
                  />
                </Box>
              )}

              {/* Aba de Senha e Segurança */}
              {activeTab === 2 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                    Senha e Segurança
                  </Typography>
                  
                  <ChangePasswordForm />
                </Box>
              )}
            </Box>
          </>
        )}
      </Container>

      {/* Diálogos */}
      <EditResponsibleProfileDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        isMobile={isMobile}
      />
    </AppLayout>
  );
}