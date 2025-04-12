'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export const useMetasState = () => {
  const [desafiosAtivos, setDesafiosAtivos] = useState([
    {
      id: 1,
      nome: 'Reciclar Plástico',
      progresso: 70,
      total: 100,
      pontuacao: 150,
      dataInicio: new Date(new Date().setDate(new Date().getDate() - 3)),
      dataTermino: new Date(new Date().setDate(new Date().getDate() + 4)),
      concluido: false
    },
    {
      id: 6,
      nome: 'Reciclar Metal',
      progresso: 40,
      total: 100,
      pontuacao: 120,
      dataInicio: new Date(new Date().setDate(new Date().getDate() - 10)),
      dataTermino: new Date(new Date().setDate(new Date().getDate() - 3)),
      concluido: false
    }
  ])
  
  const [desafiosConcluidos, setDesafiosConcluidos] = useState([])
  const [desafiosExpirados, setDesafiosExpirados] = useState([])
  const [pendingAlert, setPendingAlert] = useState(null) 
  const alertShownRef = useRef(false) 
  const [ranking, setRanking] = useState([
    { id: 1, nome: 'Maria', pontos: 850, posicao: 2 },
    { id: 2, nome: 'João', pontos: 1200, posicao: 1 },
    { id: 3, nome: 'Ana', pontos: 700, posicao: 3 },
    { id: 4, nome: 'Carlos', pontos: 650, posicao: 4 },
    { id: 5, nome: 'Você', pontos: 300, posicao: 5 },
  ])
  const [meusPontos, setMeusPontos] = useState(300)
  const [abaAtiva, setAbaAtiva] = useState('andamento')

  // Desafios disponíveis
  const desafiosDisponiveis = [
    { id: 2, nome: 'Reciclar Papel', pontuacao: 50 },
    { id: 3, nome: 'Reciclar Vidro', pontuacao: 180 },
    { id: 4, nome: 'Reciclagem de Eletrônicos', pontuacao: 200 },
    { id: 5, nome: 'Redução de Plástico', pontuacao: 80 },
    { id: 6, nome: 'Reciclar Metal', pontuacao: 150 },
    { id: 7, nome: 'Compostagem', pontuacao: 100 },
  ]

  const isExpirado = (dataTermino) => new Date() > dataTermino
  const diasRestantes = (dataTermino) => Math.ceil((dataTermino - new Date()) / (1000 * 60 * 60 * 24))

  // Função para mover desafios expirados - usando useCallback para evitar recriação
  const moverDesafiosExpirados = useCallback(() => {
    const agora = new Date()
    const [ativos, novosExpirados] = desafiosAtivos.reduce(
      ([ativos, expirados], desafio) => {
        return desafio.dataTermino < agora 
          ? [ativos, [...expirados, desafio]] 
          : [[...ativos, desafio], expirados]
      },
      [[], []]
    )

    if (novosExpirados.length > 0) {
      setDesafiosAtivos(ativos)
      setDesafiosExpirados(prev => [...prev, ...novosExpirados])
      setPendingAlert(novosExpirados.length) 
    }
  }, [desafiosAtivos]) // Adicionando desafiosAtivos como dependência

  // Efeito para verificar desafios expirados na montagem
  useEffect(() => {
    moverDesafiosExpirados()
    // Não incluímos moverDesafiosExpirados como dependência para evitar loop infinito
    // Esta função só deve ser executada uma vez na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  // Efeito para mostrar alerta após a renderização
  useEffect(() => {
    if (pendingAlert !== null && !alertShownRef.current) {
      const timer = setTimeout(() => {
        alert(`${pendingAlert} desafio(s) expiraram e foram movidos para "Não concluídos"`)
        setPendingAlert(null)
        alertShownRef.current = true
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pendingAlert])

  const participarDesafio = useCallback((desafio) => {
    const novoDesafio = {
      ...desafio,
      progresso: 0,
      total: 100,
      dataInicio: new Date(),
      dataTermino: new Date(new Date().setDate(new Date().getDate() + 7)),
      concluido: false
    }
    
    setDesafiosAtivos(prev => [...prev, novoDesafio])
    alert(`Você começou o desafio: ${desafio.nome}. Você tem 7 dias para completar!`)
  }, [])

  const concluirDesafio = useCallback((desafioId) => {
    const desafio = desafiosAtivos.find(d => d.id === desafioId)
    if (!desafio) return

    if (isExpirado(desafio.dataTermino)) {
      alert('Este desafio já expirou e não pode ser concluído!')
      return
    }

    if (desafio.progresso >= desafio.total) {
      const novosPontos = meusPontos + desafio.pontuacao
      setMeusPontos(novosPontos)
      setDesafiosConcluidos(prev => [...prev, { ...desafio, concluido: true }])
      setDesafiosAtivos(prev => prev.filter(d => d.id !== desafioId))
      atualizarRanking(novosPontos)
      alert(`Desafio concluído! +${desafio.pontuacao} pontos!`)
    } else {
      alert('Complete 100% do desafio primeiro!')
    }
  }, [desafiosAtivos, meusPontos])

  const removerDesafio = useCallback((desafioId) => {
    const desafio = desafiosAtivos.find(d => d.id === desafioId)
    if (!desafio) return

    if (isExpirado(desafio.dataTermino)) {
      setDesafiosExpirados(prev => [...prev, desafio])
    }
    
    setDesafiosAtivos(prev => prev.filter(d => d.id !== desafioId))
  }, [desafiosAtivos])

  const atualizarProgresso = useCallback((desafioId, incremento) => {
    setDesafiosAtivos(prev => prev.map(desafio => {
      if (desafio.id === desafioId) {
        if (isExpirado(desafio.dataTermino)) {
          alert('Este desafio expirou e não pode ser atualizado!')
          return desafio
        }
        
        const novoProgresso = Math.min(desafio.progresso + incremento, desafio.total)
        return { ...desafio, progresso: novoProgresso }
      }
      return desafio
    }))
  }, [])

  const atualizarRanking = useCallback((novosPontos) => {
    setRanking(prev => {
      const novoRanking = prev.map(p => 
        p.nome === 'Você' ? { ...p, pontos: novosPontos } : p
      ).sort((a, b) => b.pontos - a.pontos)
      .map((p, i) => ({ ...p, posicao: i + 1 }))
      
      return novoRanking
    })
  }, [])

  return {
    desafiosAtivos,
    desafiosConcluidos,
    desafiosExpirados,
    meusPontos,
    ranking,
    abaAtiva,
    setAbaAtiva,
    participarDesafio,
    concluirDesafio,
    removerDesafio,
    atualizarProgresso,
    desafiosDisponiveis,
    isExpirado,
    diasRestantes,
    pendingAlert
  }
}
