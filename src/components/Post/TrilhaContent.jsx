'use client';
import styles from './post.module.css';

const recyclingGuide = {
  title: "Trilha Ambiental",
  sections: [
    {
      title: "O que pode e não pode ser reciclado?",
      items: [
        { type: "Papéis", description: "jornais, revistas, caixas de papelão" },
        { type: "Plásticos", description: "embalagens limpas, garrafas PET" },
        { type: "Vidros", description: "garrafas, frascos de alimentos" },
        { type: "Metais", description: "latas de alumínio, latas de aço" }
      ]
    },
    {
      title: "Diferença entre materiais",
      items: [
        { type: "Reciclável", description: "Materiais transformáveis em novos produtos" },
        { type: "Orgânico", description: "Restos de alimentos para compostagem" },
        { type: "Perigoso", description: "Pilhas, baterias, lâmpadas fluorescentes" }
      ]
    }
  ]
};

export default function TrilhaContent() {
  return (
    <div className={styles.trilhaContainer}>
      <h1 className={styles.pageTitle}>{recyclingGuide.title}</h1>
      
      {recyclingGuide.sections.map((section, index) => (
        <section key={index} className={styles.guideSection}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <div className={styles.itemsGrid}>
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className={styles.itemCard}>
                <h3 className={styles.itemType}>{item.type}</h3>
                <p className={styles.itemDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
