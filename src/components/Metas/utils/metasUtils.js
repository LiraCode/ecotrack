/**
 * Calcula a porcentagem de progresso
 * @param {number} atual - Valor atual
 * @param {number} total - Valor total
 * @returns {number} - Porcentagem de progresso (0-100)
 */
export const calcularPorcentagem = (atual, total) => {
  if (!total || total <= 0) return 0
  const porcentagem = (atual / total) * 100
  return Math.min(100, Math.max(0, porcentagem)); // Limita entre 0 e 100
}

/**
 * Formata uma data para exibição
 * @param {Date|string} data - Data a ser formatada
 * @returns {string} - Data formatada
 */
export const formatarData = (data) => {
  if (!data) return 'N/A'
  
  try {
    const dataObj = data instanceof Date ? data : new Date(data)
    if (isNaN(dataObj.getTime())) return 'Data inválida'
    
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return 'Data inválida'
  }
}

/**
 * Calcula o número de dias restantes até uma data
 * @param {Date|string} dataFinal - Data final
 * @returns {number} - Número de dias restantes
 */
export const calcularDiasRestantes = (dataFinal) => {
  if (!dataFinal) return 0
  
  try {
    const dataFinalObj = dataFinal instanceof Date ? dataFinal : new Date(dataFinal)
    if (isNaN(dataFinalObj.getTime())) return 0
    
    const hoje = new Date()
    const diffTempo = dataFinalObj.getTime() - hoje.getTime()
    const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDias); // Não permitir dias negativos
  } catch (error) {
    console.error('Erro ao calcular dias restantes:', error)
    return 0
  }
}

/**
 * Verifica se uma meta está expirada
 * @param {Date|string} dataFinal - Data final da meta
 * @returns {boolean} - True se a meta estiver expirada
 */
export const metaExpirada = (dataFinal) => {
  if (!dataFinal) return false
  
  try {
    const dataFinalObj = dataFinal instanceof Date ? dataFinal : new Date(dataFinal)
    if (isNaN(dataFinalObj.getTime())) return false
    
    const hoje = new Date()
    return dataFinalObj < hoje
  } catch (error) {
    console.error('Erro ao verificar se meta está expirada:', error)
    return false
  }
}

/**
 * Formata um valor numérico para exibição
 * @param {number} valor - Valor a ser formatado
 * @param {number} casasDecimais - Número de casas decimais
 * @returns {string} - Valor formatado
 */
export const formatarNumero = (valor, casasDecimais = 0) => {
  if (valor === undefined || valor === null) return '0'
  
  try {
    return Number(valor).toLocaleString('pt-BR', {
      minimumFractionDigits: casasDecimais,
      maximumFractionDigits: casasDecimais
    })
  } catch (error) {
    console.error('Erro ao formatar número:', error)
    return '0'
  }
}
