'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Container, Typography, Box, Button, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem, Grid,
  Chip, IconButton, Divider, Tab, Tabs, CircularProgress,
  FormHelperText, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  getAllGoals, 
  getGoalById, 
  createGoal, 
  updateGoal, 
  deleteGoal 
} from '@/services/goalService';
import { getAllWasteTypes } from '@/services/wasteService';
import AppLayout from '@/components/Layout/page';
import { min } from 'date-fns';

// Esquema de validação para o formulário de metas
const goalFormSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres' }),
  initialDate: z.date({ required_error: 'A data inicial é obrigatória' }),
  validUntil: z.date({ required_error: 'A data final é obrigatória' }),
  points: z.number().min(1, { message: 'A pontuação deve ser maior que zero' }),
  targetType: z.enum(['weight', 'quantity'], { required_error: 'Selecione o tipo de meta' }),
  targetValue: z.number().min(0.1, { message: 'O valor alvo deve ser maior que zero' }),
  challenges: z.array(
    z.object({
      waste: z.string().min(1, { message: 'Selecione um tipo de resíduo' }),
      weight: z.number().optional(),
      quantity: z.number().optional(),
    })
  ).min(1, { message: 'Adicione pelo menos um desafio' }),
});

export default function AdminMetasPage() {
  const { user, loading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // obter status da sidebar do localStorage
  useEffect(() => {
    const sidebarStatus = localStorage.getItem('sidebarOpen');
    if (sidebarStatus === 'true') {
      setSidebarOpen(true);
      //verificar tamanho da tela se for maior que 768px setar sidebarOpen como true
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
        localStorage.setItem('sidebarOpen', 'false');
        setIsMobile(false);
      }
    }
  }, []);

  const token = user?.accessToken;
  
  // Configurar formulário
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: '',
      description: '',
      initialDate: new Date(),
      validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
      points: 100,
      targetType: 'weight',
      targetValue: 10,
      challenges: [{ waste: '', weight: 0, quantity: 0 }],
    },
  });
  
  // Field array para os desafios
  const { fields, append, remove } = useFieldArray({
    control,
    name: "challenges",
  });
  
  // Carregar metas
  const loadGoals = useCallback(async () => {
    try {
      console.log("Carregando metas...");
      setLoading(true);
      const result = await getAllGoals();
      console.log("Resultado da API:", result);
      
      if (result.success) {
        setGoals(result.goals || []);
        console.log("Metas carregadas:", result.goals);
      } else {
        throw new Error(result.error || "Erro desconhecido ao carregar metas");
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      setError(`Erro ao carregar metas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar tipos de resíduos e metas
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Iniciando carregamento de dados...");
        setLoading(true);
        
        // Carregar tipos de resíduos
        console.log("Carregando tipos de resíduos...");
        const wasteResult = await getAllWasteTypes();
        console.log("Resultado de tipos de resíduos:", wasteResult);
        
        if (wasteResult.success) {
          setWasteTypes(wasteResult.wasteTypes || []);
        } else {
          throw new Error(wasteResult.error || "Erro desconhecido ao carregar tipos de resíduos");
        }
        
        // Carregar metas
        await loadGoals();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError(`Erro ao carregar dados: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.role === 'Administrador') {
      console.log("Usuário admin detectado, carregando dados...");
      loadData();
    } else {
      console.log("Aguardando autenticação ou usuário não é admin:", user);
      // Se não for admin, definir loading como false para não ficar em loop de carregamento
      if (!authLoading) {
        setLoading(false);
      }
    }
  }, [loadGoals, user, authLoading]);
  
  // Redirecionar se não estiver autenticado ou não for admin 
// authcontext.js ja faz isso

  
  // Adicionar desafio ao formulário
  const addChallenge = () => {
    append({ waste: '', weight: 0, quantity: 0 });
  };
  
  // Abrir formulário para edição
  const handleEditGoal = async (id) => {
    try {
      setLoading(true);
      const result = await getGoalById(id, token);
      
      if (result.success) {
        const goal = result.goal;
        
        // Preencher formulário com dados da meta
        reset({
          title: goal.title,
          description: goal.description,
          initialDate: new Date(goal.initialDate),
          validUntil: new Date(goal.validUntil),
          points: goal.points,
          targetType: goal.targetType,
          targetValue: goal.targetValue,
          challenges: goal.challenges.map(challenge => ({
            waste: challenge.waste._id,
            weight: challenge.weight,
            quantity: challenge.quantity
          })),
        });
        
        setEditingGoalId(id);
        setIsDialogOpen(true);
      } else {
        throw new Error(result.error || "Erro desconhecido ao carregar meta para edição");
      }
    } catch (error) {
      console.error('Erro ao carregar meta para edição:', error);
      setError(`Erro ao carregar meta para edição: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Abrir diálogo de confirmação para excluir
  const handleOpenDeleteConfirm = (id) => {
    setGoalToDelete(id);
    setConfirmDeleteOpen(true);
  };
  
  // Excluir meta
  const handleDeleteGoal = async () => {
    try {
      setLoading(true);
      const result = await deleteGoal(goalToDelete,token);
      
      if (result.success) {
        alert('Meta excluída com sucesso');
        setConfirmDeleteOpen(false);
        setGoalToDelete(null);
        
        // Recarregar metas
        await loadGoals();
      } else {
        throw new Error(result.error || "Erro desconhecido ao excluir meta");
      }
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      setError(`Erro ao excluir meta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Enviar formulário
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Ajustar dados dos desafios com base no tipo de meta
      const challenges = data.challenges.map(challenge => ({
        waste: challenge.waste,
        weight: data.targetType === 'weight' ? challenge.weight : 0,
        quantity: data.targetType === 'quantity' ? challenge.quantity : 0
      }));
      
      const formData = {
        ...data,
        challenges
      };
      
      let result;
      
      if (editingGoalId) {
        // Atualizar meta existente
        result = await updateGoal(editingGoalId, formData, token);
      } else {
        // Criar nova meta
        result = await createGoal(formData, token);
      }
      
      if (result.success) {
        alert(editingGoalId ? 'Meta atualizada com sucesso' : 'Meta criada com sucesso');
        
        // Fechar diálogo e resetar formulário
        setIsDialogOpen(false);
        reset();
        setEditingGoalId(null);
        
        // Recarregar metas
        await loadGoals();
      } else {
        throw new Error(result.error || "Erro desconhecido ao salvar meta");
      }
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      setError(`Erro ao salvar meta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar metas por status
  const getFilteredGoals = () => {
    if (activeTab === 0) return goals.filter(goal => goal.status === 'active');
    if (activeTab === 1) return goals.filter(goal => goal.status === 'inactive');
    return goals; // Tab 'all'
  };
  
  const filteredGoals = getFilteredGoals();
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Renderizar mensagem de erro se houver
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#ffebee' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Erro
          </Typography>
          <Typography variant="body1">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => {
              setError(null);
              loadGoals();
            }}
          >
            Tentar novamente
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Renderizar tela de carregamento
  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Carregando...</Typography>
      </Box>
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
              Gerenciamento de Metas
            </Typography>

            <Box>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={loadGoals}
                sx={{ mr: 1 }}
              >
                Atualizar
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />} 
                onClick={() => {
                  reset();
                  setEditingGoalId(null);
                  setIsDialogOpen(true);
                }}
              >
                Nova Meta
              </Button>
            </Box>
          </Box>
          
          <Paper sx={{ mb: 4 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              indicatorColor="primary"
              textColor="primary"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  fontWeight: 'medium',
                  textTransform: 'none',
                },
              }}
            >
              <Tab label="Ativas" />
              <Tab label="Inativas" />
              <Tab label="Todas" />
            </Tabs>
          </Paper>
          
          {filteredGoals.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Nenhuma meta encontrada
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Não há metas {activeTab === 0 ? 'ativas' : activeTab === 1 ? 'inativas' : ''} no momento.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />} 
                sx={{ mt: 2 }}
                onClick={() => {
                  reset();
                  setEditingGoalId(null);
                  setIsDialogOpen(true);
                }}
              >
                Criar Nova Meta
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descrição</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Período</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Pontos</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Meta</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGoals.map((goal) => (
                    <TableRow key={goal._id} hover>
                      <TableCell>{goal.title}</TableCell>
                      <TableCell>
                        {goal.description.length > 50 
                          ? `${goal.description.substring(0, 50)}...` 
                          : goal.description}
                      </TableCell>
                      <TableCell>
                        {new Date(goal.initialDate).toLocaleDateString()} a {new Date(goal.validUntil).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{goal.points}</TableCell>
                      <TableCell>
                        {goal.targetValue} {goal.targetType === 'weight' ? 'kg' : 'un'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={goal.status === 'active' ? 'Ativa' : 'Inativa'} 
                          color={goal.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditGoal(goal._id)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteConfirm(goal._id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {/* Diálogo para criar/editar meta */}
          <Dialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ 
              backgroundColor: '#f5f5f5', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 2
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {editingGoalId ? 'Editar Meta' : 'Nova Meta'}
              </Typography>
              <IconButton onClick={() => setIsDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Mensagens de erro */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  {/* Seção de informações básicas */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                      Informações Básicas
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Título"
                              fullWidth
                              error={!!errors.title}
                              helperText={errors.title?.message}
                              variant="outlined"
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Controller
                          name="points"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Pontuação"
                              type="number"
                              fullWidth
                              error={!!errors.points}
                              helperText={errors.points?.message}
                              variant="outlined"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              InputProps={{
                                startAdornment: (
                                  <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                                    Pts:
                                  </Typography>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Descrição"
                              fullWidth
                              multiline
                              rows={3}
                              error={!!errors.description}
                              helperText={errors.description?.message}
                              variant="outlined"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* Seção de período */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                      Período de Validade
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                          <Controller
                            name="initialDate"
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                label="Data Inicial"
                                value={field.value}
                                onChange={field.onChange}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    variant: "outlined",
                                    error: !!errors.initialDate,
                                    helperText: errors.initialDate?.message
                                  }
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                          <Controller
                            name="validUntil"
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                label="Data Final"
                                value={field.value}
                                onChange={field.onChange}
                                minDate={watch('initialDate')}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    variant: "outlined",
                                    error: !!errors.validUntil,
                                    helperText: errors.validUntil?.message
                                  }
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* Seção de configuração da meta */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                      Configuração da Meta
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="targetType"
                          control={control}
                          render={({ field }) => (
                            <FormControl 
                              fullWidth 
                              variant="outlined"
                              error={!!errors.targetType}
                            >
                              <InputLabel>Tipo de Meta</InputLabel>
                              <Select
                                {...field}
                                label="Tipo de Meta"
                                error={!!errors.targetType}
                                value={field.value}
                                sx={{minWidth:200}}
                              >
                                <MenuItem value="weight">Peso (kg)</MenuItem>
                                <MenuItem value="quantity">Quantidade (unidades)</MenuItem>
                              </Select>
                              {errors.targetType && (
                                <FormHelperText>{errors.targetType.message}</FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="targetValue"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={`Valor Alvo (${watch('targetType') === 'weight' ? 'kg' : 'unidades'})`}
                              type="number"
                              fullWidth
                              error={!!errors.targetValue}
                              helperText={errors.targetValue?.message}
                              variant="outlined"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              InputProps={{
                                endAdornment: (
                                  <Typography variant="body2" color="textSecondary">
                                    {watch('targetType') === 'weight' ? 'kg' : 'un'}
                                  </Typography>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  {/* Seção de desafios */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        Desafios
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={addChallenge}
                        sx={{ 
                          borderColor: '#2e7d32', 
                          color: '#2e7d32',
                          '&:hover': {
                            borderColor: '#1b5e20',
                            backgroundColor: '#f1f8e9',
                          }
                        }}
                      >
                        Adicionar Desafio
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {fields.map((field, index) => (
                      <Paper 
                        key={field.id} 
                        sx={{ 
                          mb: 2, 
                          p: 2, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          backgroundColor: '#fafafa'
                        }}
                        elevation={0}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <Controller
                              name={`challenges.${index}.waste`}
                              control={control}
                              render={({ field }) => (
                                <FormControl 
                                  fullWidth 
                                  error={!!errors.challenges?.[index]?.waste}
                                  variant="outlined"
                                  sx={{ minWidth: '150px' }}
                                >
                                  <InputLabel>Tipo de Resíduo</InputLabel>
                                  <Select
                                    {...field}
                                    label="Tipo de Resíduo"
                                    sx={{ minWidth: '150px' }}
                                    MenuProps={{ 
                                      PaperProps: { 
                                        sx: { minWidth: '150px' } 
                                      }
                                    }}
                                  >
                                    {wasteTypes && wasteTypes.length > 0 ? (
                                      wasteTypes.map((waste) => (
                                        <MenuItem key={waste._id} value={waste._id}>
                                          {waste.type || waste.name || 'Resíduo sem nome'}
                                        </MenuItem>
                                      ))
                                    ) : (
                                      <MenuItem disabled value="">
                                        Nenhum tipo de resíduo disponível
                                      </MenuItem>
                                    )}
                                  </Select>
                                  {errors.challenges?.[index]?.waste && (
                                    <FormHelperText>{errors.challenges[index].waste.message}</FormHelperText>
                                  )}
                                </FormControl>
                              )}
                            />
                          </Grid>
                          
                          {watch('targetType') === 'weight' ? (
                            <Grid item xs={8} md={4}>
                              <Controller
                                name={`challenges.${index}.weight`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Peso (kg)"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.challenges?.[index]?.weight}
                                    helperText={errors.challenges?.[index]?.weight?.message}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    InputProps={{
                                      endAdornment: (
                                        <Typography variant="body2" color="textSecondary">
                                          kg
                                        </Typography>
                                      ),
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                          ) : (
                            <Grid item xs={8} md={4}>
                              <Controller
                                name={`challenges.${index}.quantity`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Quantidade"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    error={!!errors.challenges?.[index]?.quantity}
                                    helperText={errors.challenges?.[index]?.quantity?.message}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    InputProps={{
                                      endAdornment: (
                                        <Typography variant="body2" color="textSecondary">
                                          un
                                        </Typography>
                                      ),
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                          )}
                          
                          <Grid item xs={4} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton
                              color="error"
                              onClick={() => fields.length > 1 && remove(index)}
                              disabled={fields.length <= 1}
                              sx={{ 
                                border: '1px solid',
                                borderColor: fields.length <= 1 ? '#e0e0e0' : '#f44336',
                                '&.Mui-disabled': {
                                  borderColor: '#e0e0e0',
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    
                    {errors.challenges?.message && (
                      <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                        {errors.challenges.message}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </form>
            </DialogContent>

            <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Button 
                onClick={() => setIsDialogOpen(false)} 
                color="inherit"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit(onSubmit)} 
                variant="contained" 
                disabled={loading}
                sx={{
                  backgroundColor: '#2e7d32',
                  '&:hover': {
                    backgroundColor: '#1b5e20',
                  }
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    {editingGoalId ? 'Salvando...' : 'Criando...'}
                  </>
                ) : (
                  editingGoalId ? 'Salvar Alterações' : 'Criar Meta'
                )}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Diálogo de confirmação para excluir */}
          <Dialog
            open={confirmDeleteOpen}
            onClose={() => setConfirmDeleteOpen(false)}
          >
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">
                Cancelar
              </Button>
              <Button onClick={handleDeleteGoal} color="error" autoFocus>
                Excluir
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </AppLayout>
  );
}
