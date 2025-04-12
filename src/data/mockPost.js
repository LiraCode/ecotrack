import styles from '@/components/Post/post.module.css';
const mockPosts = [
    {
      id: 1,
      title: 'Dica Ecológica',
      subtitle: 'Sua jornada sustentável começa aqui',
      content: 'Sustentabilidade na tecnologia é essencial!',
      image: '/images/post1.png',
      expandContent: 'Dica sustentável: Reduza seu consumo de plástico descartável trazendo sua própria garrafa de água.'
    },
    {
      id: 2,
      title: 'Dicas para economizar energia',
      subtitle: 'Pequenas mudanças, grandes impactos',
      content: 'Reduzir o consumo de energia economiza recursos e diminui sua conta de luz. Veja como:',
      image: '/images/post2.png',
      expandContent: (
        <div className={styles.tipContent}>
          <h4 className={styles.tipTitle}>Dica EcoTrack</h4>
          <ul className={styles.tipList}>
            <li><strong>Troque para lâmpadas LED</strong> - Consomem até 85% menos energia que as incandescentes e duram 25 vezes mais</li>
            <li><strong>Use o ar-condicionado com moderação</strong> - Mantenha a 24°C (limite máximo recomendado) e limpe os filtros mensalmente</li>
            <li><strong>Aproveite a luz natural</strong> - Posicione móveis estrategicamente e use cores claras que refletem melhor a luz</li>
            <li><strong>Desligue aparelhos da tomada</strong> - A função stand-by pode representar até 12% do consumo elétrico doméstico</li>
            <li><strong>Organize sua geladeira</strong> - Não a mantenha aberta por longo tempo e evite guardar alimentos quentes</li>
          </ul>
        </div>
      )
    },
    {
      id: 3,
      title: 'Reciclagem: por onde começar?',
      subtitle: 'Transforme seus resíduos em recursos',
      content: 'A reciclagem preserva recursos naturais e reduz a poluição. Comece hoje mesmo:',
      image: '/images/post3.png',
      expandContent: (
        <div className={styles.tipContent}>
          <h4 className={styles.tipTitle}>Guia Prático de Reciclagem</h4>
          <div className={styles.stepContainer}>
            {[
              "Separação básica: Comece separando papel, plástico, vidro e metal",
              "Limpeza rápida: Enxágue embalagens para remover resíduos",
              "Redução de volume: Amasse latas e garrafas plásticas",
              "Pontos de coleta: Identifique os ecopontos mais próximos",
              "Orgânicos: Restos de comida podem virar adubo"
            ].map((step, index) => (
              <div key={index} className={styles.stepItem}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
          <p className={styles.proTip}>Dica profissional: Comece com 2 categorias e vá aumentando!</p>
        </div>
      )
    },
  ];
  export default mockPosts;