'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { useToast } from '@/components/ui/use-toast';
import { useMetasContext } from '@/context/metas/MetasContext';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/Layout/page';
import MetasHeader from '@/components/Metas/MetasHeader';
import MetasTabs from '@/components/Metas/MetasTabs';
import DesafiosDisponiveis from '@/components/Metas/DesafiosDisponiveis';
import RankingSection from '@/components/Metas/RankingSection';

const MetasPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Obter status da sidebar do localStorage
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
  
  const {
    desafiosAtivos,
    desafiosConcluidos,
    desafiosExpirados,
    desafiosDisponiveis,
    meusPontos,
    ranking,
    loading,
    abaAtiva,
    setAbaAtiva,
    participarDesafio,
    removerDesafio,
    atualizarProgresso,
    concluirDesafio
  } = useMetasContext();

  // console.log("MetasPage recebeu do contexto:", {
  //   meusPontos,
  //   tipo: typeof meusPontos,
  //   ranking: ranking?.length || 0,
  //   desafiosAtivos: desafiosAtivos?.length || 0,
  //   desafiosConcluidos: desafiosConcluidos?.length || 0
  // });

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress color="primary" />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          width: '100%',
          maxWidth: { xs: '95vw', md: '1600px' },
          margin: '0 auto',
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        <MetasHeader meusPontos={meusPontos} />
        
        <RankingSection ranking={ranking} />
        
        <MetasTabs
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          desafiosAtivos={desafiosAtivos}
          desafiosConcluidos={desafiosConcluidos}
          desafiosExpirados={desafiosExpirados}
          concluirDesafio={concluirDesafio}
          removerDesafio={removerDesafio}
          atualizarProgresso={atualizarProgresso}
        />
        
        <DesafiosDisponiveis
          desafiosDisponiveis={desafiosDisponiveis}
          participarDesafio={participarDesafio}
        />
      </Box>
    </AppLayout>
  );
};

export default MetasPage;