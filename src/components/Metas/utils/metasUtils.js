'use client'

export const isExpirado = (dataTermino) => new Date() > dataTermino

export const diasRestantes = (dataTermino) => 
  Math.ceil((dataTermino - new Date()) / (1000 * 60 * 60 * 24))

export const calcularPorcentagem = (progresso, total) => 
  Math.round((progresso / total) * 100)
