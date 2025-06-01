'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './post.module.css';
// Use isomorphic-dompurify for both client and server environments
import DOMPurify from 'dompurify';

export default function PostsContent({ posts }) {
  const [expandedPost, setExpandedPost] = useState(null);
  const [localPosts, setLocalPosts] = useState([]);
  
  useEffect(() => {
    // If posts are provided as props, use them
    if (posts && posts.length > 0) {
      setLocalPosts(posts);
    } else {
      // Otherwise fetch posts directly (fallback)
      const fetchPosts = async () => {
        try {
          const response = await fetch('/api/posts');
          if (!response.ok) {
            throw new Error('Failed to fetch posts');
          }
          const data = await response.json();
          setLocalPosts(data);
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      };
      
      fetchPosts();
    }
  }, [posts]);
  
  // Function to safely render HTML content
  const renderHTML = (content) => {
    if (!content) return null;
    // Remove tags HTML para a prévia
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(content);
    const textContent = tempDiv.textContent || tempDiv.innerText;
    // Limita o texto a 150 caracteres, preservando palavras completas
    let previewText = '';
    if (textContent.length > 150) {
      // Encontra o último espaço antes do limite de 150 caracteres
      const lastSpace = textContent.substring(0, 150).lastIndexOf(' ');
      previewText = textContent.substring(0, lastSpace).trim() + '...';
    } else {
      previewText = textContent;
    }
    return { __html: previewText };
  };
  
  if (localPosts.length === 0) {
    return (
      <div className={styles.postsContainer}>
        <h1 className={styles.pageTitle}>EcoTrack Sustentável</h1>
        <p className={styles.pageSubtitle}>Esse é o nosso espaço para posts sobre sustentabilidade e tecnologia.</p>
        <div className={styles.loadingContainer}>
          <p>Carregando posts...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.postsContainer}>
      <h1 className={styles.pageTitle}>EcoTrack Sustentável</h1>
      <p className={styles.pageSubtitle}>Esse é o nosso espaço para posts sobre sustentabilidade e tecnologia.</p>
      
      <div className={styles.postsGrid}>
        {localPosts.map((post) => (
          <article key={post._id} className={styles.postCard}>
            <header className={styles.postHeader}>
              <h2 className={styles.postTitle}>
                {post.title.split(' ').map((word, index, array) => (
                  <span key={index}>
                    {word}
                    {index < array.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </h2>
              {post.subtitle && (
                <p className={styles.postSubtitle}>{post.subtitle}</p>
              )}
            </header>
            
            {post.image && (
              <Link href={`/posts/${post._id}`} passHref>
                <div 
                  className={styles.postImage}
                  role="button"
                  tabIndex={0}
                >
                  <Image
                    src={post.image}
                    alt={`Visualizar: ${post.title}`}
                    width={800}
                    height={400}
                    className={styles.imageElement}
                  />
                  <div className={styles.imageOverlay}>Clique para ver mais</div>
                </div>
              </Link>
            )}
            
            <div className={styles.postBody}>
              <p className={styles.postPreview}>
                {post.content && (
                  <>
                    {post.content
                      .replace(/<br\s*\/?>/gi, '\n') // Substitui <br> por quebra de linha
                      .replace(/<\/?p>/gi, '\n') // Substitui <p> e </p> por quebra de linha
                      .replace(/<\/?h[1-5]>/gi, '\n') // Substitui tags h1-h5 por quebra de linha
                      .replace(/<[^>]*>/g, '') // Remove outras tags HTML
                      .replace(/\n\s*\n/g, '\n') // Remove linhas em branco extras
                      .replace(/^\s+|\s+$/gm, '') // Remove espaços em branco no início e fim de cada linha
                      .trim() // Remove espaços em branco no início e fim do texto todo
                      .split('\n') // Divide por quebras de linha
                      .filter(line => line.trim() !== '') // Remove linhas vazias
                      .slice(0, 3) // Pega apenas as 3 primeiras linhas
                      .join('\n') // Junta novamente com quebras de linha
                      .substring(0, 150) // Limita a 150 caracteres
                      .split(' ') // Divide em palavras
                      .slice(0, -1) // Remove a última palavra se estiver cortada
                      .join(' ') // Junta novamente com espaços
                      + '...'}
                  </>
                )}
              </p>
            </div>
            
            {expandedPost === post._id && (
              <div className={styles.expandedContent}>
                {/* Render the full content with HTML formatting */}
                <div 
                  className={styles.fullContent}
                  dangerouslySetInnerHTML={renderHTML(post.content)}
                />
                
                {/* If there's additional description content, render it too */}
                {post.description && (
                  <div 
                    className={styles.tipContent}
                    dangerouslySetInnerHTML={renderHTML(post.description)}
                  />
                )}
              </div>
            )}
            
            <div className={styles.postFooter}>
              <p className={styles.postDate}>
                {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
              {post.category && post.category.length > 0 && (
                <div className={styles.postCategories}>
                  {post.category.map((cat, index) => (
                    <span key={index} className={styles.categoryTag}>{cat}</span>
                  ))}
                </div>
              )}
              
              {/* Adicionar botão para ver post completo */}
              <Link href={`/posts/${post._id}`} className={styles.readMoreLink}>
                Ver post completo
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}