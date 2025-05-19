'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Container, Typography, Box, Button, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem, Grid,
  Chip, IconButton, Divider, Tab, Tabs, CircularProgress,
  FormHelperText
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
  Cancel as CancelIcon
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
    
    if (user && user.role === 'admin') {
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
      const result = await getGoalById(id);
      
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
      const result = await deleteGoal(goalToDelete);
      
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
        result = await updateGoal(editingGoalId, formData);
      } else {
        // Criar nova meta
        result = await createGoal(formData);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
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
          variant="fullWidth"
        >
          <Tab label="Ativas" />
          <Tab label="Inativas" />
          <Tab label="Todas" />
        </Tabs>
      </Paper>
      
      {filteredGoals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">
            Nenhuma meta {activeTab === 0 ? 'ativa' : activeTab === 1 ? 'inativa' : ''} encontrada.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Clique em &quot;Nova Meta&quot; para criar uma.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                                <TableCell>Pontos</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Valor Alvo</TableCell>
                <TableCell>Período</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGoals.map((goal) => (
                <TableRow key={goal._id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">{goal.title}</Typography>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {goal.description.length > 60 
                        ? `${goal.description.substring(0, 60)}...` 
                        : goal.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{goal.points}</TableCell>
                  <TableCell>
                    {goal.targetType === 'weight' ? 'Peso (kg)' : 'Quantidade'}
                  </TableCell>
                  <TableCell>
                    {goal.targetValue} {goal.targetType === 'weight' ? 'kg' : 'unidades'}
                  </TableCell>
                  <TableCell>
                    {new Date(goal.initialDate).toLocaleDateString()} - {new Date(goal.validUntil).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={goal.status === 'active' ? 'Ativa' : 'Inativa'} 
                      color={goal.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEditGoal(goal._id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleOpenDeleteConfirm(goal._id)}
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
        <DialogTitle>
          {editingGoalId ? 'Editar Meta' : 'Nova Meta'}
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
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
                      margin="normal"
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
                      margin="normal"
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      margin="normal"
                    />
                  )}
                />
              </Grid>
              
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            margin="normal"
                            error={!!errors.initialDate}
                            helperText={errors.initialDate?.message}
                          />
                        )}
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            margin="normal"
                            error={!!errors.validUntil}
                            helperText={errors.validUntil?.message}
                          />
                        )}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="targetType"
                  control={control}
                  render={({ field }) => (
                    <FormControl 
                      fullWidth 
                      margin="normal"
                      error={!!errors.targetType}
                    >
                      <InputLabel>Tipo de Meta</InputLabel>
                      <Select
                        {...field}
                        label="Tipo de Meta"
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
                      margin="normal"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">Desafios</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addChallenge}
                  >
                    Adicionar Desafio
                  </Button>
                </Box>
                
                {fields.map((field, index) => (
                  <Box key={field.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`challenges.${index}.waste`}
                          control={control}
                          render={({ field }) => (
                            <FormControl 
                              fullWidth 
                              error={!!errors.challenges?.[index]?.waste}
                            >
                              <InputLabel>Tipo de Resíduo</InputLabel>
                              <Select
                                {...field}
                                label="Tipo de Resíduo"
                              >
                                {wasteTypes.map((waste) => (
                                  <MenuItem key={waste._id} value={waste._id}>
                                    {waste.name}
                                  </MenuItem>
                                ))}
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
                                error={!!errors.challenges?.[index]?.weight}
                                helperText={errors.challenges?.[index]?.weight?.message}
                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                                error={!!errors.challenges?.[index]?.quantity}
                                helperText={errors.challenges?.[index]?.quantity?.message}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                        </Grid>
                      )}
                      
                      <Grid item xs={4} md={2}>
                        <IconButton
                          color="error"
                          onClick={() => fields.length > 1 && remove(index)}
                          disabled={fields.length <= 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                
                {errors.challenges?.message && (
                  <Typography color="error" variant="caption">
                    {errors.challenges.message}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            variant="contained" 
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {editingGoalId ? 'Salvar Alterações' : 'Criar Meta'}
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
          <Button onClick={() => setConfirmDeleteOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteGoal} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </AppLayout>
  );
}
