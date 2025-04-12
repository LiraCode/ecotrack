'use client';
import styles from './post.module.css';
import recyclingGuide from '@/data/recyclingGuide';


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
