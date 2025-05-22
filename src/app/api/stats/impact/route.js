import connectToDB from '@/lib/db';
import CollectionScheduling from '@/models/collectionScheduling';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectToDB();
    
    // Buscar apenas agendamentos concluídos
    const completedSchedules = await CollectionScheduling.find({ 
      status: { $in: ['Coletado', 'Completed'] }
    }).populate({
      path: 'wastes.wasteId',
      model: 'Waste'
    });
    
    // Calcular estatísticas
    let wasteCount = 0;
    let totalWeight = 0;
    const collectionsCount = completedSchedules.length;
    
    // Iterar sobre cada agendamento concluído
    completedSchedules.forEach(schedule => {
      // Contar os itens de resíduos
      if (schedule.wastes && Array.isArray(schedule.wastes)) {
        // Adicionar a quantidade de cada tipo de resíduo
        schedule.wastes.forEach(waste => {
          // Se houver uma quantidade especificada, use-a, caso contrário, conte como 1 item
          const quantity = waste.quantity || 1;
          wasteCount += quantity;
          
          // Se houver um peso especificado, adicione-o ao peso total
          if (waste.weight) {
            totalWeight += waste.weight * quantity;
          } else if (waste.wasteId && waste.wasteId.averageWeight) {
            // Se não houver peso específico, mas houver um peso médio no tipo de resíduo
            totalWeight += waste.wasteId.averageWeight * quantity;
          }
        });
      }
    });
    
    // Arredondar o peso total para 2 casas decimais
    totalWeight = Math.round(totalWeight * 100) / 100;
    
    // Retornar as estatísticas calculadas
    return NextResponse.json({
      wasteCount,
      totalWeight,
      collectionsCount,
      success: true
    });
    
  } catch (error) {
    console.error('Error calculating impact stats:', error);
    return NextResponse.json(
      { 
        message: 'Erro ao calcular estatísticas de impacto', 
        error: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}