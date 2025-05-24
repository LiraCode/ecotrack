'use client';
import { useEffect, useState } from "react";
import {
  Box, Container, Tabs, Tab
} from "@mui/material";
import useLocalStorage from "@/hooks/useLocalStorage";
// Import sub-components
import HeroSection from "./sections/HeroSection";
import HomeTab from "./sections/HomeTab";
import EcopointsTab from "./sections/EcopointsTab";
import WasteGuideTab from "./sections/WasteGuideTab";
import WasteDetailDialog from "./dialogs/WasteDetailDialog";
import { useAuth } from "@/context/AuthContext"; // Importar o contexto de autenticação

export default function HomePage() {
  const { user, isAuthenticated } = useAuth(); // Obter informações do usuário
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Estados para dados dinâmicos
  const [latestPost, setLatestPost] = useState(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [goals, setGoals] = useState([]);
  const [impactStats, setImpactStats] = useState({
    wasteCount: 0,
    totalWeight: 0,
    collectionsCount: 0,
    loading: true
  });

  // Estados de carregamento
  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(true);

  const handleOpenDialog = (wasteType) => {
    setSelectedWaste(wasteType);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewAllWasteTypes = () => {
    setActiveTab(2);
  };

  // Verificar se o usuário está logado e é do tipo "user"
  const isUserLoggedIn = user && user.role === 'User';

  // Função para buscar os posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/posts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const posts = await response.json();

        // Verificar se há posts e pegar o primeiro (mais recente)
        if (posts && posts.length > 0) {
          setLatestPost(posts[0]);
        } else {
          setLatestPost(null);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLatestPost(null);
      } finally {
        setLoading(false);
      }
    };

    // Chamar a função imediatamente
    fetchPosts();
  }, []);

  // Função para buscar os agendamentos próximos - apenas para usuários logados do tipo "user"
  useEffect(() => {
    const fetchUpcomingSchedules = async () => {
      try {
        setLoadingSchedules(true);

        // Verificar se o usuário está logado e é do tipo "user"
        if (!isUserLoggedIn) {
          // Se não estiver logado ou não for user, definir dados vazios
          setUpcomingSchedules([]);
          return;
        }

        // Obter token de autenticação do localStorage
        const token = localStorage.getItem('ecotrack_token');
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const response = await fetch("/api/schedule?limit=2&sort=date", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        

        // Formatar os dados para o formato esperado pelo componente
        const formattedSchedules = data.map(schedule => {
          // Converter a data para um formato legível
          const scheduleDate = new Date(schedule.date);
          const formattedDate = scheduleDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });

          // Extrair o horário
          const formattedTime = scheduleDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return {
            id: schedule._id,
            location: schedule.collectionPointId?.name || "Ecoponto",
            date: formattedDate,
            time: formattedTime,
            status: schedule.status,
            type: schedule.wastes?.map(w => w.wasteId?.type || "Resíduo").join(", ") || "Diversos"
          };
        });

        const nextSchedule = formattedSchedules
        .filter(schedule => schedule.status !== "Cancelado" && schedule.status !== "Coletado")
        .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

        setUpcomingSchedules(nextSchedule);
        console.log(nextSchedule);
      } catch (error) {
        console.error("Error fetching upcoming schedules:", error);
        setUpcomingSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    // Chamar a função imediatamente
    fetchUpcomingSchedules();
  }, [isUserLoggedIn]); // Adicionar isUserLoggedIn como dependência

  // Função para buscar as metas do usuário - apenas para usuários logados do tipo "user"
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoadingGoals(true);

        // Verificar se o usuário está logado e é do tipo "user"
        if (!isUserLoggedIn) {
          // Se não estiver logado ou não for user, definir dados vazios
          setGoals([]);
          return;
        }

        // Obter token de autenticação do localStorage
        const token = localStorage.getItem('ecotrack_token');
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        const response = await fetch("/api/goals?limit=3", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const scoresResponse = await fetch('/api/scores?status=active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!scoresResponse.ok) {
          throw new Error('Falha ao buscar metas ativas')
        }

        const responseData = await scoresResponse.json();
        console.log("scores",responseData);

        // Verificar a estrutura da resposta e extrair o array de metas
        const goalsArray = Array.isArray(responseData)
          ? responseData
          : responseData.scores || responseData.data || [];

        // Verificar se goalsArray é realmente um array
        if (!Array.isArray(goalsArray)) {
          console.error("Resposta da API não contém um array de metas:", responseData);
          throw new Error('Formato de resposta inválido');
        }

        // Formatar os dados para o formato esperado pelo componente
        const formattedGoals = goalsArray.map(goal => ({
          id: goal._id || goal.id,
          title: goal.goalId.title || goal.title,
          status: goal.status || false
        }));
        console.log(formattedGoals);
        setGoals(formattedGoals);
      } catch (error) {
        console.error("Error fetching goals:", error);
        setGoals([]);
      } finally {
        setLoadingGoals(false);
      }
    };

    // Chamar a função imediatamente
    fetchGoals();
  }, [isUserLoggedIn]); // Adicionar isUserLoggedIn como dependência

  // Função para buscar estatísticas de impacto ambiental
  useEffect(() => {
    const fetchImpactStats = async () => {
      try {
        // Iniciar com loading
        setImpactStats(prev => ({ ...prev, loading: true }));

        // Fazer a requisição para a API
        const response = await fetch("/api/stats/impact", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dados recebidos da API:", data);

        // Atualizar o estado com os dados recebidos
        setImpactStats({
          wasteCount: data.wasteCount || 0,
          totalWeight: data.totalWeight || 0,
          collectionsCount: data.collectionsCount || 0,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching impact stats:", error);
        // Em caso de erro, usar dados de exemplo
        setImpactStats({
          wasteCount: 1250,
          totalWeight: 3500,
          collectionsCount: 420,
          loading: false
        });
      }
    };

    // Chamar a função imediatamente
    fetchImpactStats();
  }, []);

  return (
    <Container maxWidth="4xl" sx={{ minWidth: '330px', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      {/* Hero Section */}
      <HeroSection impactStats={impactStats} />

      {/* Main Content Tabs */}
      <Box sx={{ Width: { sm: '30vh', xs: '40vh', lg: '90vh' }, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            centered
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                padding: { xs: '1px 5px', sm: '0px s0px' },
                ontSize: { xs: '10px', sm: '10px' },
                color: '#555',
                '&.Mui-selected': { color: '#2e8b57' }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#2e8b57' }
            }}
          >
            <Tab label="Início" />
            <Tab label="Ecopontos" />
            <Tab label="Info Resíduos" />
          </Tabs>
        </Box>

        {/* Home Tab */}
        {activeTab === 0 && (
          <HomeTab
            latestPost={latestPost}
            loading={loading}
            upcomingSchedules={upcomingSchedules}
            loadingSchedules={loadingSchedules}
            goals={goals}
            loadingGoals={loadingGoals}
            impactStats={impactStats}
            handleOpenDialog={handleOpenDialog}
            onViewAllWasteTypes={handleViewAllWasteTypes}
            isUserLoggedIn={isUserLoggedIn} // Passar o estado de login para o componente
          />
        )}

        {/* Ecopoints Tab */}
        {activeTab === 1 && <EcopointsTab />}

        {/* Waste Guide Tab */}
        {activeTab === 2 && <WasteGuideTab handleOpenDialog={handleOpenDialog} />}
      </Box>

      {/* Dialog with detailed information */}
      <WasteDetailDialog
        open={openDialog}
        onClose={handleCloseDialog}
        selectedWaste={selectedWaste}
      />
    </Container>
  );
}
