'use client';
import Header from "@/components/Header/page";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import '@/app/styles/globals.css';

// Dados sobre os tipos de resíduos
const wasteData = {
  Papel: {
    description: "O papel é reciclável e deve ser descartado seco e limpo. Inclui jornais, revistas, caixas de papelão e folhas de papel.",
    decomposition: "2 a 6 semanas",
    recyclingTip: "Remova clipes, grampos e fitas adesivas antes de reciclar."
  },
  Vidro: {
    description: "O vidro é 100% reciclável e pode ser reutilizado infinitamente sem perder qualidade. Inclui garrafas, potes e frascos.",
    decomposition: "Mais de 4.000 anos",
    recyclingTip: "Lave os recipientes e removas tampas antes de descartar."
  },
  Orgânico: {
    description: "Resíduos orgânicos incluem restos de alimentos, cascas de frutas e legumes, que podem ser compostados.",
    decomposition: "2 semanas a 12 meses",
    recyclingTip: "Use composteiras domésticas para transformar em adubo."
  },
  Plástico: {
    description: "Nem todos os plásticos são recicláveis. Verifique o símbolo de reciclagem (1 a 7) no produto.",
    decomposition: "Até 450 anos",
    recyclingTip: "Reduza o consumo e prefira plásticos recicláveis (PET - 1 e HDPE - 2)."
  },
  Metal: {
    description: "Latas de alumínio e aço são altamente recicláveis. Inclui latas de bebidas, conservas e objetos metálicos.",
    decomposition: "100 a 500 anos",
    recyclingTip: "Amasse latas para ocupar menos espaço nos coletores."
  },
  Eletrônico: {
    description: "E-lixo contém metais pesados e deve ser descartado em locais específicos. Inclui celulares, computadores e pilhas.",
    decomposition: "Indeterminado",
    recyclingTip: "Procure pontos de coleta especializados para descarte seguro."
  }
};

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState(null);
  
  const handleOpenDialog = (wasteType) => {
    setSelectedWaste(wasteType);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Page content */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            overflow: 'auto',
            transition: 'margin-left 0.3s',
            marginLeft: sidebarOpen ? '240px' : '0',
            backgroundColor: '#f5f5f5'
          }}
        >
          {/* EcoTrack Title */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" sx={{ color: '#2e8b57', mb: 3, textAlign: 'center' }}>
              EcoTrack
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Paper sx={{ p: 2, backgroundColor: '#e8f5e9' }}>
                <Typography variant="subtitle1" sx={{ color: '#2e8b57' }} fontStyle={"italic"}>Transformando hábitos, preservando o futuro.</Typography>
                <Typography>
                  Ao unir educação ambiental e tecnologia, o EcoTrack promove uma experiência prática, acessível e engajadora, contribuindo para a construção de uma cidade mais limpa e sustentável.
                </Typography>
              </Paper>
            </Box>
          </Paper>

          {/* Waste Classification */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#2e8b57', mb: 2 }}>
              Classificação de Resíduos →
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              {Object.keys(wasteData).map((item) => (
                <Button 
                  key={item}
                  variant="outlined" 
                  onClick={() => handleOpenDialog(item)}
                  sx={{ 
                    color: '#2e8b57', 
                    borderColor: '#2e8b57',
                    '&:hover': { 
                      borderColor: '#1f6b47',
                      backgroundColor: '#e8f5e9'
                    }
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>
          </Paper>

          {/* Dialog com informações detalhadas */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle sx={{ color: '#2e8b57' }}>
              Informações sobre: {selectedWaste}
            </DialogTitle>
            <DialogContent>
              {selectedWaste && (
                <>
                  <DialogContentText sx={{ mb: 2 }}>
                    <strong>Descrição:</strong> {wasteData[selectedWaste].description}
                  </DialogContentText>
                  <DialogContentText sx={{ mb: 2 }}>
                    <strong>Tempo de decomposição:</strong> {wasteData[selectedWaste].decomposition}
                  </DialogContentText>
                  <DialogContentText>
                    <strong>Dica de reciclagem:</strong> {wasteData[selectedWaste].recyclingTip}
                  </DialogContentText>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseDialog}
                sx={{ color: '#2e8b57' }}
              >
                Fechar
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}