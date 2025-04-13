'use client';
import { useState } from "react";
import { 
  Box, Container, Tabs, Tab
} from "@mui/material";
import useLocalStorage from "@/hooks/useLocalStorage";
import mockPosts from "@/data/mockPost";

// Import sub-components
import HeroSection from "./sections/HeroSection";
import HomeTab from "./sections/HomeTab";
import EcopointsTab from "./sections/EcopointsTab";
import WasteGuideTab from "./sections/WasteGuideTab";
import WasteDetailDialog from "./dialogs/WasteDetailDialog";

export default function HomePage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [schedules, setSchedules] = useLocalStorage("ecotrack-schedules", []);
  const [goals, setGoals] = useLocalStorage("ecotrack-goals", [
    { id: 1, title: "Reduzir o uso de plástico em 50% até 2025", completed: false },
    { id: 2, title: "Reciclar 10kg de papel este mês", completed: false },
    { id: 3, title: "Descartar corretamente 5 itens eletrônicos", completed: true }
  ]);
  
  const [latestPosts, setLatestPosts] = useState(() => {
    return [...mockPosts]
      .sort((a, b) => b.id - a.id)
      .slice(0, 2);
  });
   
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

  // Sample upcoming schedules
  const upcomingSchedules = [
    { id: 1, location: "Ecoponto - Pajuçara", date: "15 Jun 2023", time: "14:00", type: "Eletrônicos" },
    { id: 2, location: "Ecoponto - Tabuleiro", date: "22 Jun 2023", time: "10:30", type: "Plástico e Papel" }
  ];

  return (
    <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Tabs */}
      <Box sx={{ width: '100%', mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                fontSize: '1rem',
                color: '#555',
                '&.Mui-selected': { color: '#2e8b57' }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#2e8b57' }
            }}
          >
            <Tab label="Início" />
            <Tab label="Ecopontos" />
            <Tab label="Guia de Resíduos" />
          </Tabs>
        </Box>

        {/* Home Tab */}
        {activeTab === 0 && (
          <HomeTab 
            latestPosts={latestPosts} 
            upcomingSchedules={upcomingSchedules} 
            goals={goals} 
            handleOpenDialog={handleOpenDialog}
            onViewAllWasteTypes={handleViewAllWasteTypes}
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
