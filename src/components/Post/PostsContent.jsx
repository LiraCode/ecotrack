'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
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
    return { __html: DOMPurify.sanitize(content) };
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
              <h2 className={styles.postTitle}>{post.title}</h2>
              {post.subtitle && (
                <p className={styles.postSubtitle}>{post.subtitle}</p>
              )}
            </header>
            
            {post.image && (
              <div 
                className={styles.postImage}
                onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
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
            )}
            
            <div className={styles.postBody}>
              {/* Render a preview of the content */}
              <div 
                dangerouslySetInnerHTML={renderHTML(
                  post.content?.length > 150 
                    ? post.content.substring(0, 150) + '...' 
                    : post.content
                )} 
              />
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}