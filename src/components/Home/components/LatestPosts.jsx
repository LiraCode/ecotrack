'use client';
import { Box, Typography, Grid, Card, CardActionArea, CardMedia, CardContent, Button } from "@mui/material";
import { Article as ArticleIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function LatestPosts({ posts }) {
  return (
    <Box sx={{ mb: 6, width: '100%' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          color: '#2e8b57', 
          fontWeight: 'bold', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ArticleIcon sx={{ mr: 1 }} /> Últimas Dicas Ecológicas
      </Typography>
      
      <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
        <Grid container spacing={3} justifyContent="center">
          {posts.map(post => (
            <Grid item xs={12} sm={6} md={5} key={post.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="180"
                    image={post.image || "/images/main1.jpg"}
                    alt={post.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2, textAlign: 'center' }}
                    >
                      {post.excerpt}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      borderTop: '1px solid #e0e0e0',
                      pt: 2
                    }}>
                      <Typography variant="caption" color="text.secondary">
                        {post.date}
                      </Typography>
                      <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
                        <Button 
                          component="span"
                          size="small" 
                          endIcon={<ArrowForwardIcon />}
                          sx={{ color: '#2e8b57' }}
                        >
                          Ler mais
                        </Button>
                      </Link>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* View All Posts button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Link href="/blog" style={{ textDecoration: 'none' }}>
            <Button 
              component="span"
              variant="outlined" 
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                color: '#2e8b57', 
                borderColor: '#2e8b57',
                '&:hover': { 
                  borderColor: '#1f6b47', 
                  backgroundColor: '#e8f5e9' 
                }
              }}
            >
              Ver Todas as Publicações
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
