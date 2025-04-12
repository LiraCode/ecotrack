'use client';
import React from 'react';
import CircularProgressBar from './CircularProgressBar';

const MetasInfografico = () => {
  const progress = 150; // Exemplo de itens reciclados
  const total = 300; // Total de itens que precisam ser reciclados

  return (
    <div>
      <CircularProgressBar progress={progress} total={total} />
      <div>
        <p>Pontuação: {progress} pontos</p>
        <p>Período de Validade: 30 dias</p>
      </div>
    </div>
  );
};

export default MetasInfografico;
