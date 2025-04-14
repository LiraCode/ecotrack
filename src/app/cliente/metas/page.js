'use client'
import { useState } from 'react'
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
        <main className={`flex-1 p-1 mt-5 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} overflow-auto`}>
          <Container maxWidth="lg" className="space-y-8">
            <MetasContent />
          </Container>
        </main>
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