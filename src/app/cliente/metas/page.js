'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header/page'
import { Container } from '@mui/material'
import MetasHeader from '../../../components/Metas/MetasHeader'
import RankingSection from '../../../components/Metas/RankingSection'
import MetasTabs from '../../../components/Metas/MetasTabs'
import DesafiosDisponiveis from '../../../components/Metas/DesafiosDisponiveis'
import { MetasProvider } from '@/context/metas/MetasContext'
import { useMetasContext } from  '@/context/metas/MetasContext'

const MetasPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MetasProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className={`flex ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} overflow-auto`}>
          <Container maxWidth="lg" className="space-y-8">
            <MetasContent />
          </Container>
        </main>
      </div>
    </MetasProvider>
  )
}

// Separate component to use the context
const MetasContent = () => {
  const {
    meusPontos,
    ranking,
    abaAtiva,
    setAbaAtiva,
    desafiosAtivos,
    desafiosConcluidos,
    desafiosExpirados,
    concluirDesafio,
    removerDesafio,
    atualizarProgresso,
    desafiosDisponiveis,
    participarDesafio
  } = useMetasContext()

  return (
    <>
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
    </>
  )
}

export default MetasPage