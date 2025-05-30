/**
 * Formata uma data para exibição amigável
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export function formatDate(date) {
  const options = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Date(date).toLocaleDateString('pt-BR', options);
} 