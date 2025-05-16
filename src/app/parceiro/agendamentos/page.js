'use client';

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
  Grid,
  Chip
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Configurar dayjs para usar o locale pt-br
dayjs.locale('pt-br');

export default function AgendamentosManagement() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentAgendamento, setCurrentAgendamento] = useState(null);
    const [ecopontos, setEcopontos] = useState([]);
    const [wasteTypes, setWasteTypes] = useState([]);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        status: '',
        collector: '',
        collectedAt: null,
        wastes: []
    });
    const [responsableId, setResponsableId] = useState(null);

    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(true);

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

    const showAlert = useCallback((message, severity) => {
        setAlert({ open: true, message, severity });
    }, []);

    // Função para buscar o ID do responsável no MongoDB
    const fetchResponsableId = useCallback(async () => {
        try {
            if (!user) {
                showAlert('Usuário não autenticado', 'error');
                return null;
            }

            // Usar o token de acesso do usuário do AuthContext
            const token = user.accessToken;
            
            // Buscar o responsável pelo firebaseId
            const response = await fetch(`/api/responsible?uid=${user.uid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                showAlert(errorData.message || 'Erro ao buscar dados do responsável', 'error');
                return null;
            }
            
            const data = await response.json();
            
            if (!data.responsible || !data.responsible._id) {
                showAlert('Dados do responsável não encontrados', 'error');
                return null;
            }
            
            setResponsableId(data.responsible._id);
            return data.responsible._id;
        } catch (error) {
            console.error('Erro ao buscar ID do responsável:', error);
            showAlert('Erro ao buscar dados do responsável', 'error');
            return null;
        }
    }, [user, showAlert]);

    const fetchAgendamentos = useCallback(async () => {
        try {
            if (!responsableId) {
                // Se não temos o ID do responsável, não podemos buscar agendamentos
                return;
            }

            // Usar o token de acesso do usuário do AuthContext
            const token = user.accessToken;
            
            const response = await fetch(`/api/schedule/resposable/${responsableId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                setAgendamentos(data.schedules || []);
            } else {
                showAlert(data.message || 'Erro ao carregar agendamentos', 'error');
            }
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            showAlert('Erro ao carregar agendamentos', 'error');
        }
    }, [user, responsableId, showAlert]);

    const fetchEcopontos = useCallback(async () => {
        try {
            const response = await fetch('/api/collection-points');
            const data = await response.json();
            if (response.ok) {
                setEcopontos(data);
            } else {
                showAlert(data.message || 'Erro ao carregar ecopontos', 'error');
            }
        } catch (error) {
            showAlert('Erro ao carregar ecopontos', 'error');
        }
    }, [showAlert]);

    const fetchWasteTypes = useCallback(async () => {
        try {
            const response = await fetch('/api/waste');
            const data = await response.json();
            if (response.ok) {
                if (data.wasteTypes && Array.isArray(data.wasteTypes)) {
                    setWasteTypes(data.wasteTypes);
                } else if (Array.isArray(data)) {
                    setWasteTypes(data);
                } else {
                    setWasteTypes([]);
                    console.error('Unexpected waste types response format:', data);
                }
            }
        } catch (error) {
            showAlert('Erro ao carregar tipos de resíduos', 'error');
        }
    }, [showAlert]);

    // Efeito para buscar o ID do responsável quando o usuário estiver disponível
    useEffect(() => {
        if (user && !loading) {
            fetchResponsableId();
        }
    }, [user, loading, fetchResponsableId]);

    // Efeito para buscar agendamentos quando tivermos o ID do responsável
    useEffect(() => {
        if (responsableId) {
            fetchAgendamentos();
            fetchEcopontos();
            fetchWasteTypes();
        }
    }, [responsableId, fetchAgendamentos, fetchEcopontos, fetchWasteTypes]);

    const handleOpen = (agendamento = null) => {
    if (agendamento) {
        setEditMode(true);
        setCurrentAgendamento(agendamento);
        setFormData({
            status: agendamento.status,
            collector: agendamento.collector,
            collectedAt: agendamento.collectedAt ? dayjs(agendamento.collectedAt).format('YYYY-MM-DD') : null,
            wastes: agendamento.wastes ? [...agendamento.wastes] : []
        });
    } else {
        setEditMode(false);
        setCurrentAgendamento(null);
        setFormData({
            status: '',
            collector: '',
            collectedAt: null,
            wastes: []
        });
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

    const handleDateChange = (newValue) => {
        setFormData({
            ...formData,
            collectedAt: newValue ? newValue.format('YYYY-MM-DD') : null
        });
    };

    const handleSubmit = async () => {
        try {
            if (!currentAgendamento) {
                showAlert('Nenhum agendamento selecionado', 'error');
                return;
            }

            // Criar uma cópia dos dados para manipulação
            const dataToSend = { ...formData };
            
            // Garantir que apenas os IDs dos resíduos sejam enviados
            if (dataToSend.wastes && Array.isArray(dataToSend.wastes)) {
                dataToSend.wastes = dataToSend.wastes.map(waste => ({
                    wasteId: typeof waste.wasteId === 'object' && waste.wasteId._id 
                        ? waste.wasteId._id 
                        : waste.wasteId,
                    quantity: waste.quantity,
                    weight: waste.weight
                }));
            }

            // Usar o token de acesso do usuário do AuthContext
            const token = user.accessToken;

            const response = await fetch(`/api/schedule/${currentAgendamento._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();
            if (response.ok) {
                showAlert('Agendamento atualizado com sucesso!', 'success');
                handleClose();
                fetchAgendamentos();
            } else {
                showAlert(data.message || 'Erro ao atualizar agendamento', 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar agendamento:', error);
            showAlert('Erro ao atualizar agendamento', 'error');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            // Usar o token de acesso do usuário do AuthContext
            const token = user.accessToken;

            const updateData = { 
                status: newStatus
            };
            
            // Se o status for "Coletado", adicionar a data atual
            if (newStatus === 'Coletado') {
                updateData.collectedAt = new Date().toISOString();
            }

            const response = await fetch(`/api/collection-scheduling/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData),
            });
            
            if (response.ok) {
                showAlert(`Status atualizado para ${newStatus}!`, 'success');
                fetchAgendamentos();
            } else {
                const data = await response.json();
                showAlert(data.message || 'Erro ao atualizar status', 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            showAlert('Erro ao atualizar status', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
            try {
                // Usar o token de acesso do usuário do AuthContext
                const token = user.accessToken;

                const response = await fetch(`/api/collection-scheduling/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    showAlert('Agendamento excluído com sucesso!', 'success');
                    fetchAgendamentos();
                } else {
                    const data = await response.json();
                    showAlert(data.message || 'Erro ao excluir agendamento', 'error');
                }
            } catch (error) {
                console.error('Erro ao excluir agendamento:', error);
                showAlert('Erro ao excluir agendamento', 'error');
            }
        }
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Aguardando confirmação do Ponto de Coleta':
                return 'warning';
            case 'Confirmado':
                return 'info';
            case 'Coletado':
                return 'success';
            case 'Cancelado':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return dayjs(dateString).format('DD/MM/YYYY HH:mm');
        } catch (error) {
            return 'Data inválida';
        }
    };

    const getEcopontoName = (id) => {
        const ecoponto = id.name
        return ecoponto
    };
const handleWasteChange = (index, field, value) => {
    // Criar uma cópia do array de resíduos
    const updatedWastes = [...formData.wastes];
    
    // Atualizar o campo específico do resíduo no índice fornecido
    updatedWastes[index] = {
        ...updatedWastes[index],
        [field]: value
    };
    
    // Atualizar o estado formData com o array de resíduos atualizado
    setFormData({
        ...formData,
        wastes: updatedWastes
    });
};
    const getWasteName = (wasteData) => {
    // Verificar se recebemos um objeto completo em vez de apenas um ID
    if (wasteData && typeof wasteData === 'object' && wasteData._id) {
        // Se o próprio objeto já tem type ou name, retornar diretamente
        if (wasteData.type) return wasteData.type;
        if (wasteData.name) return wasteData.name;
        
        // Caso contrário, usar o _id para buscar nos wasteTypes
        const idString = wasteData._id.toString();
        const waste = wasteTypes.find(w => w._id && w._id.toString() === idString);
        return waste ? (waste.type || waste.name) : 'N/A';
    } 
    // Caso seja apenas um ID (string ou ObjectId)
    else if (wasteData) {
        const idString = wasteData.toString();
        const waste = wasteTypes.find(w => w._id && w._id.toString() === idString);
        return waste ? (waste.type || waste.name) : 'N/A';
    }
    
    // Se não tiver dados válidos
    return 'N/A';
};
    if (loading) {
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
                            Gerenciamento de Agendamentos
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Ecoponto</TableCell>
                                    <TableCell>Data Agendada</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Coletor</TableCell>
                                    <TableCell>Data da Coleta</TableCell>
                                    <TableCell>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {agendamentos.map((agendamento) => (
                                    <TableRow key={agendamento._id}>
                                        <TableCell>{agendamento.userId?.name || 'N/A'}</TableCell>
                                        <TableCell>{getEcopontoName(agendamento.collectionPointId)}</TableCell>
                                        <TableCell>{formatDate(agendamento.date)}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={agendamento.status} 
                                                color={getStatusColor(agendamento.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{agendamento.collector}</TableCell>
                                        <TableCell>{agendamento.collectedAt ? formatDate(agendamento.collectedAt) : 'Pendente'}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleOpen(agendamento)}
                                                color="primary"
                                                title="Editar"
                                            >
                                                <EditIcon />
                                                                                            </IconButton>
                                            
                                            
                                            {agendamento.status === 'Confirmado' && (
                                                <IconButton
                                                    onClick={() => handleStatusChange(agendamento._id, 'Coletado')}
                                                    color="success"
                                                    title="Marcar como coletado"
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            )}
                                            
                                            {(agendamento.status === 'Aguardando confirmação do Ponto de Coleta' || 
                                                agendamento.status === 'Confirmado') && (
                                                <IconButton
                                                    onClick={() => handleStatusChange(agendamento._id, 'Cancelado')}
                                                    color="error"
                                                    title="Cancelar"
                                                >
                                                    <CancelIcon />
                                                </IconButton>
                                            )}
                                            
                                            <IconButton
                                                onClick={() => handleDelete(agendamento._id)}
                                                color="error"
                                                title="Excluir"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {agendamentos.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Nenhum agendamento encontrado
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
                        Sobre os Agendamentos
                    </Typography>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <Typography variant="body1" paragraph>
                            Os agendamentos de coleta são solicitações feitas pelos usuários para que seus resíduos sejam coletados em um ecoponto específico.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Como parceiro, você pode confirmar, cancelar ou marcar agendamentos como coletados, além de designar um coletor responsável.
                        </Typography>
                        <Typography variant="body1">
                            Mantenha os status dos agendamentos atualizados para garantir uma comunicação eficiente com os usuários e uma gestão eficaz das coletas.
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            {/* Dialog para editar agendamento */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle
                    sx={{ bgcolor: "#f5f5f5", color: "#2e7d32", fontWeight: "bold" }}
                >
                    Editar Agendamento
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={3}>
                        {/* Informações do Agendamento */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2 }}>
                                Informações do Agendamento
                            </Typography>
                            
                            {currentAgendamento && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1">
                                            <strong>Cliente:</strong> {currentAgendamento.userId?.name || 'N/A'}
                                        </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1">
                                            <strong>Ecoponto:</strong> {getEcopontoName(currentAgendamento.collectionPointId)}
                                        </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1">
                                            <strong>Data Agendada:</strong> {formatDate(currentAgendamento.date)}
                                        </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1">
                                            <strong>Data de Criação:</strong> {formatDate(currentAgendamento.createdAt)}
                                        </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>Endereço:</strong> {currentAgendamento.addressId?.street}, 
                                            {currentAgendamento.addressId?.number}, 
                                            {currentAgendamento.addressId?.neighborhood}, 
                                            {currentAgendamento.addressId?.city} - 
                                            {currentAgendamento.addressId?.state}, 
                                            CEP: {currentAgendamento.addressId?.zipCode}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            )}
                            
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            label="Status"
                                        >
                                            <MenuItem value="Aguardando confirmação do Ponto de Coleta">
                                                Aguardando confirmação do Ponto de Coleta
                                            </MenuItem>
                                            <MenuItem value="Confirmado">Confirmado</MenuItem>
                                            <MenuItem value="Coletado">Coletado</MenuItem>
                                            <MenuItem value="Cancelado">Cancelado</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Coletor"
                                        name="collector"
                                        value={formData.collector}
                                        onChange={handleChange}
                                        margin="normal"
                                    />
                                </Grid>
                                
                                {formData.status === 'Coletado' && (
                                    <Grid item xs={12} md={6}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label="Data da Coleta"
                                                value={formData.collectedAt ? dayjs(formData.collectedAt) : null}
                                                onChange={handleDateChange}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        margin: "normal"
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                        
                        {/* Seção de Resíduos */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ color: "#2e7d32", mb: 2, mt: 2 }}>
                                Resíduos Coletados
                            </Typography>
                            
                            <TableContainer component={Paper} sx={{ mb: 3 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Tipo de Resíduo</TableCell>
                                            <TableCell align="right">Quantidade (unidades)</TableCell>
                                            <TableCell align="right">Peso (kg)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.wastes.map((waste, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{getWasteName(waste.wasteId)}</TableCell>
                                                <TableCell align="right">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={waste.quantity}
                                                        onChange={(e) => handleWasteChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        InputProps={{ inputProps: { min: 0 } }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={waste.weight}
                                                        onChange={(e) => handleWasteChange(index, 'weight', parseFloat(e.target.value) || 0)}
                                                        InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {formData.wastes.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center">
                                                    Nenhum resíduo registrado
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            
                            {formData.status === 'Coletado' && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Ao marcar como coletado, certifique-se de atualizar as quantidades e pesos reais dos resíduos coletados.
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Atualizar
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

