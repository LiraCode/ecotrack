'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/config/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import AppLayout from '@/components/Layout/page';
import dynamic from 'next/dynamic';
// Remover o import do CSS do react-quill
// import 'react-quill/dist/quill.snow.css';
// Importar o CSS do react-quill-new
import 'react-quill-new/dist/quill.snow.css';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '@/context/AuthContext';

// Importar React-Quill-New dinamicamente para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando editor...</Box>
});

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState(['Notícia', 'Tutorial', 'Evento', 'Dica', 'Outro']);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: [],
    content: '',
    image: '',
    status: 'active'
  });
  
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  
  // Configuração do editor Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image',
    'align',
    'color', 'background'
  ];
  
  // Get sidebar status from localStorage
  useEffect(() => {
    const sidebarStatus = localStorage.getItem('sidebarOpen');
    if (sidebarStatus === 'true') {
      setSidebarOpen(true);
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
        localStorage.setItem('sidebarOpen', 'false');
        setIsMobile(false);
      }
    }
  }, []);

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const fetchPosts = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await fetch('/api/posts');
      const data = await response.json();
      if (response.ok) {
        setPosts(Array.isArray(data) ? data : []);
      } else {
        showAlert(data.message || 'Erro ao carregar posts', 'error');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showAlert('Erro ao carregar posts', 'error');
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleOpen = (post = null) => {
    if (post) {
      setEditMode(true);
      setCurrentPost(post);
      setFormData({
        title: post.title || '',
        subtitle: post.subtitle || '',
        description: post.description || '',
        category: Array.isArray(post.category) ? post.category : [],
        content: post.content || '',
        image: post.image || '',
        status: post.status || 'active'
      });
      setImagePreview(post.image || null);
    } else {
      setEditMode(false);
      setCurrentPost(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        category: [],
        content: '',
        image: '',
        status: 'active'
      });
      setImage(null);
      setImagePreview(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditorChange = (content) => {
    setFormData({
      ...formData,
      content
    });
  };

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category: e.target.value
    });
  };

  const handleStatusChange = (e) => {
    setFormData({
      ...formData,
      status: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `posts/${uuidv4()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
  };

  const handleSubmit = async () => {
    // Validação básica
    if (!formData.title.trim()) {
      showAlert('O título é obrigatório', 'error');
      return;
    }

    if (!formData.content.trim()) {
      showAlert('O conteúdo é obrigatório', 'error');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image;
      
      // Upload new image if selected
      if (image) {
        imageUrl = await uploadImage(image);
      }
      
      const postData = {
        ...formData,
        image: imageUrl,
        author: user?.uid || '',
      };
      
      let response;
      if (editMode && currentPost?._id) {
        response = await fetch(`/api/posts/${currentPost._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`,
          },
          body: JSON.stringify(postData),
        });
      } else {
        response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.accessToken}`,
          },
          body: JSON.stringify(postData),
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        showAlert(editMode ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!', 'success');
        handleClose();
        fetchPosts();
      } else {
        throw new Error(data.message || 'Erro ao salvar post');
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      showAlert(error.message || 'Erro ao salvar post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      try {
        const response = await fetch(`/api/posts/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.accessToken}`,
          },
        });
        
        if (response.ok) {
          showAlert('Post excluído com sucesso!', 'success');
          fetchPosts();
        } else {
          const data = await response.json();
          showAlert(data.message || 'Erro ao excluir post', 'error');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        showAlert('Erro ao excluir post', 'error');
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Função para renderizar uma prévia do conteúdo HTML
  const renderContentPreview = (content) => {
    if (!content) return '';
    // Limitar a 100 caracteres e remover tags HTML
    const plainText = content.replace(/<[^>]*>?/gm, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  // Função para obter o status formatado
  const getStatusChip = (status) => {
    let color = 'default';
    let label = 'Desconhecido';
    
    switch(status) {
      case 'active':
        color = 'success';
        label = 'Ativo';
        break;
      case 'draft':
        color = 'warning';
        label = 'Rascunho';
        break;
      case 'archived':
        color = 'default';
        label = 'Arquivado';
        break;
      default:
        color = 'primary';
        label = status || 'Ativo';
    }
    
    return <Chip label={label} color={color} size="small" />;
  };

  return (
    <AppLayout>
      <Box
        sx={{
          p: 3,
          width: "100%",
          maxWidth: "1600px",
          marginLeft: "100px",
          flexGrow: 1,
          overflow: "auto",
          transition: "margin-left 0.3s",
          xs: { marginLeft: sidebarOpen ? "240px" : "0px" },
          marginRight: isMobile ? "0" : "100px",
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{ color: "#2e7d32", fontWeight: "bold" }}
            >
              Gerenciamento de Posts
            </Typography>

            <Box>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={fetchPosts}
                sx={{ mr: 1 }}
              >
                Atualizar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
              >
                Novo Post
              </Button>
            </Box>
          </Box>

          {fetchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Carregando posts...</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Categoria</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Conteúdo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <TableRow key={post._id} hover>
                        <TableCell>{post.title}</TableCell>
                        <TableCell>
                          {post.category && Array.isArray(post.category) ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {post.category.map((cat, index) => (
                                <Chip 
                                  key={index} 
                                  label={cat} 
                                  size="small" 
                                  sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                                />
                              ))}
                            </Box>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>{renderContentPreview(post.content)}</TableCell>
                        <TableCell>
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{getStatusChip(post.status)}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleOpen(post)}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(post._id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          Nenhum post cadastrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#2e7d32", fontWeight: "bold" }}
          >
            Sobre os Posts
          </Typography>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="body1" paragraph>
              Os posts são uma forma de compartilhar informações, notícias e conteúdos educativos sobre sustentabilidade, reciclagem e meio ambiente.
            </Typography>
            <Typography variant="body1" paragraph>
              Cada post pode ser categorizado para facilitar a busca e organização do conteúdo, além de conter imagens ilustrativas para melhor engajamento.
            </Typography>
            <Typography variant="body1">
              Mantenha esta seção atualizada para informar e educar os usuários sobre práticas sustentáveis e novidades relacionadas ao meio ambiente.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Dialog para adicionar/editar post */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle
          sx={{ 
            bgcolor: "#f5f5f5", 
            color: "#2e7d32", 
            fontWeight: "bold",
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
            py: 2
          }}
        >
          {editMode ? "Editar Post" : "Novo Post"}
          <IconButton onClick={handleClose} size="small">
            <DeleteIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ flexGrow: 1, overflow: 'auto', px: 4, py: 3 }}>
          <Grid container spacing={4}>
            {/* Coluna da esquerda - Informações básicas e imagem */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2, borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                  Informações Básicas
                </Typography>
                
                <TextField
                  fullWidth
                  label="Título"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  margin="normal"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Subtítulo"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Descrição Curta"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  margin="normal"
                  size="small"
                  helperText="Breve descrição para listagens"
                />
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="draft">Rascunho</MenuItem>
                    <MenuItem value="archived">Arquivado</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Categorias</InputLabel>
                  <Select
                    multiple
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    label="Categorias"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
              
              {/* Seção de imagem */}
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2, borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                  Imagem de Capa
                </Typography>
                
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      color="primary"
                      size="small"
                      fullWidth
                    >
                      Selecionar Imagem
                    </Button>
                  </label>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                    Recomendado: 1200 x 630 pixels
                  </Typography>
                </Box>
                
                {imagePreview ? (
                  <Box sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center',
                    mb: 1
                  }}>
                    <Box sx={{ 
                      width: '100%', 
                      maxWidth: '400px',
                      height: 'auto',
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid #ddd'
                    }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: 'auto',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    width: '100%', 
                    height: '150px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px dashed #ccc',
                    borderRadius: 1,
                    bgcolor: '#f9f9f9'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma imagem selecionada
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Coluna da direita - Editor de conteúdo */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2, borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                  Conteúdo
                </Typography>
                
                <Box 
                  sx={{ 
                    mb: 2,
                    mx: 'auto',
                    '.ql-container': {
                      minHeight: '400px',
                      fontSize: '16px'
                    },
                    '.ql-editor': {
                      minHeight: '400px'
                    },
                    '.ql-toolbar': {
                      borderRadius: '4px 4px 0 0',
                      backgroundColor: '#f9f9f9'
                    },
                    '.ql-container': {
                      borderRadius: '0 0 4px 4px'
                    }
                  }}
                >
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={handleEditorChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Escreva o conteúdo do seu post aqui..."
                  />
                </Box>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                    Dicas para o editor:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" display="block">
                        • Use os botões da barra para formatar seu texto
                      </Typography>
                      <Typography variant="caption" display="block">
                        • Para adicionar imagens, clique no ícone de imagem
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" display="block">
                        • Para adicionar links, selecione o texto e clique no ícone de link
                      </Typography>
                      <Typography variant="caption" display="block">
                        • Use os cabeçalhos para organizar seu conteúdo
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between', borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={handleClose} 
            color="inherit"
            variant="outlined"
          >
            Cancelar
          </Button>
          <Box>
            {editMode && (
              <Button
                onClick={() => {
                  setFormData({
                    ...formData,
                    status: 'draft'
                  });
                  setTimeout(handleSubmit, 0);
                }}
                variant="outlined"
                color="warning"
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Salvar como Rascunho
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Salvando...' : editMode ? 'Atualizar' : 'Publicar'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar para alertas */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
