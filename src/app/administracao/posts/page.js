'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/config/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AppLayout from '@/components/Layout/page';
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
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/context/AuthContext';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
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
  });
  
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  
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
      const response = await fetch('/api/posts');
      const data = await response.json();
      if (response.ok) {
        setPosts(data);
      } else {
        showAlert(data.message || 'Erro ao carregar posts', 'error');
      }
    } catch (error) {
      showAlert('Erro ao carregar posts', 'error');
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
        title: post.title,
        subtitle: post.subtitle || '',
        description: post.description || '',
        category: post.category || [],
        content: post.content,
        image: post.image,
      });
      setImagePreview(post.image);
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

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category: e.target.value
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
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `posts/${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async () => {
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
        author: user.id,
      };
      
      let response;
      if (editMode) {
        response = await fetch(`/api/posts/${currentPost._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(postData),
        });
      } else {
        response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`,
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
      showAlert(error.message, 'error');
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
            'Authorization': `Bearer ${user.accessToken}`,
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
        showAlert('Erro ao excluir post', 'error');
      }
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  if (authLoading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography>Carregando...</Typography>
        </Box>
      </AppLayout>
    );
  }

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

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Novo Post
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Data de Criação</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.category ? post.category.join(', ') : 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{post.status || 'active'}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpen(post)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(post._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {posts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Nenhum post cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ bgcolor: "#f5f5f5", color: "#2e7d32", fontWeight: "bold" }}
        >
          {editMode ? "Editar Post" : "Novo Post"}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Seção: Informações Básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                Informações Básicas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Subtítulo"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Descrição Curta"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    margin="normal"
                    helperText="Breve descrição para exibição na listagem"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Categorias</InputLabel>
                    <Select
                      multiple
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                      label="Categorias"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Seção: Conteúdo */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                Conteúdo
              </Typography>
              <TextField
                fullWidth
                label="Conteúdo"
                name="content"
                value={formData.content}
                onChange={handleChange}
                multiline
                rows={10}
                required
                margin="normal"
              />
            </Grid>

            {/* Seção: Imagem */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                Imagem
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      sx={{ mt: 1 }}
                    >
                      {editMode ? "Alterar Imagem" : "Selecionar Imagem"}
                    </Button>
                  </label>
                  {!image && editMode && (
                    <Typography variant="caption" sx={{ ml: 2 }}>
                      Mantenha em branco para manter a imagem atual
                    </Typography>
                  )}
                </Grid>
                
                {imagePreview && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Pré-visualização:
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 400,
                        height: 'auto',
                        position: 'relative',
                        mt: 1,
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        width={400}
                        height={250}
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? "Salvando..." : (editMode ? "Atualizar" : "Salvar")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}