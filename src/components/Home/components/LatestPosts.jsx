'use client';
import { Box, Typography, Grid, Card, CardActionArea, CardMedia, CardContent, Button, CircularProgress } from "@mui/material";
import { Article as ArticleIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import Link from 'next/link';
import DOMPurify from 'dompurify';


  const renderHTML = (content) => {
    if (!content) return null;
    return { __html: DOMPurify.sanitize(content) };
  };

export default function LatestPosts({ post, loading }) {
  // Mostrar indicador de carregamento
  if (loading) {
    return (
      <Box sx={{ mb: 6, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
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
        <CircularProgress color="success" />
      </Box>
    );
  }
  
  // Verificar se post existe
  if (!post) {
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
        <Typography variant="body1" align="center">
          Nenhuma publicação disponível no momento.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 6, width: "100%" }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          color: "#2e8b57",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArticleIcon sx={{ mr: 1 }} /> Últimas Dicas Ecológicas
      </Typography>

      <Box sx={{ maxWidth: "900px", mx: "auto" }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="180"
                  image={post.image || "/images/main1.jpg"}
                  alt={post.title || "Post sem título"}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {post.title || "Sem título"}
                  </Typography>
                  <Typography
                    dangerouslySetInnerHTML={renderHTML(post.content?.substring(0, 50))}
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, textAlign: "center" }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #e0e0e0",
                      pt: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {post.date ||
                        new Date(post.createdAt).toLocaleDateString("pt-BR") ||
                        "Sem data"}
                    </Typography>
                    <Link
                      href={`/posts/${post._id || post.id || 0}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        component="span"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        sx={{ color: "#2e8b57" }}
                      >
                        Ler mais
                      </Button>
                    </Link>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>

        {/* View All Posts button */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Link href="/posts" style={{ textDecoration: "none" }}>
            <Button
              component="span"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: "#2e8b57",
                borderColor: "#2e8b57",
                "&:hover": {
                  borderColor: "#1f6b47",
                  backgroundColor: "#e8f5e9",
                },
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
