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
  Snackbar,
  Alert,
  Grid,
  Chip,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { updateScoreProgress, updateScoresFromScheduling, updateWasteProgress } from '@/services/scoreService';

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
    const [activeTab, setActiveTab] = useState(4); // 4 corresponde ao tab "Todos"
    const [formData, setFormData] = useState({
        status: '',
        collector: '',
        collectedAt: null,
        collectedTime: null,
        wastes: []
    });
    const [responsableId, setResponsableId] = useState(null);
    const [confirmationDialog, setConfirmationDialog] = useState({
        open: false,
        title: '',
        message: '',
        action: null,
        actionText: '',
        cancelText: 'Cancelar'
    });

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

    const handleOpen = (agendamento = null, initialStatus = null) => {
        if (agendamento) {
            setEditMode(true);
            setCurrentAgendamento(agendamento);
            
            // Extrair data e hora da coleta, se existir
            let collectedDate = null;
            let collectedTime = null;
            
            if (agendamento.collectedAt) {
                const collectedDateTime = dayjs(agendamento.collectedAt);
                collectedDate = collectedDateTime;
                collectedTime = collectedDateTime;
            }
            
            setFormData({
                status: initialStatus || agendamento.status,
                collector: agendamento.collector || '',
                collectedAt: collectedDate,
                collectedTime: collectedTime,
                wastes: agendamento.wastes ? [...agendamento.wastes] : []
            });
        } else {
            setEditMode(false);
            setCurrentAgendamento(null);
            setFormData({
                status: initialStatus || '',
                collector: '',
                collectedAt: null,
                collectedTime: null,
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
            collectedAt: newValue
        });
    };

    const handleTimeChange = (newValue) => {
        setFormData({
            ...formData,
            collectedTime: newValue
        });
    };

    // Função para processar as metas do usuário
    const processUserGoals = async (userId, wastes) => {
        try {
            if (!userId) {
                console.log('ID do usuário não disponível para processar metas');
                return;
            }
            
            // Obter token de autenticação
            const token = user.accessToken;
            
            // Buscar as metas ativas do usuário
            const response = await fetch(`/api/scores?userId=${userId}&status=active`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resposta de erro completa:', errorText);
                throw new Error('Falha ao buscar metas do usuário');
            }
            
            const data = await response.json();
            const userScores = data.scores || [];
            
            if (userScores.length === 0) {
                console.log('Usuário não possui metas ativas para atualizar');
                return;
            }
            
            console.log('Metas ativas do usuário:', userScores);
            
            // Para cada resíduo coletado, atualizar as metas correspondentes
            for (const waste of wastes) {
                const wasteId = waste.wasteId;
                const quantity = waste.quantity || 0;
                
                if (!wasteId || quantity <= 0) {
                    continue;
                }
                
                console.log(`Processando resíduo ${wasteId} com quantidade ${quantity}`);
                
                // Para cada meta ativa do usuário
                for (const score of userScores) {
                    // Atualizar o progresso do resíduo na meta
                    try {
                        const updateResponse = await fetch(`/api/scores/${score._id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                wasteTypeId: wasteId,
                                quantity: quantity
                            })
                        });
                        
                        if (updateResponse.ok) {
                            const updateData = await updateResponse.json();
                            console.log(`Meta ${score._id} atualizada:`, updateData.score);
                        } else {
                            const errorData = await updateResponse.json();
                            console.error(`Erro ao atualizar meta ${score._id}:`, errorData);
                        }
                    } catch (error) {
                        console.error(`Erro ao processar meta ${score._id}:`, error);
                    }
                }
            }
            
            console.log('Processamento de metas concluído com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao processar metas do usuário:', error);
            return false;
        }
    };

    const handleSubmit = async () => {
        try {
            if (!currentAgendamento) {
                showAlert('Nenhum agendamento selecionado', 'error');
                return;
            }

            // Criar uma cópia dos dados para manipulação
            const dataToSend = { ...formData };
            
            // Combinar data e hora da coleta, se ambos estiverem presentes
            if (dataToSend.collectedAt && dataToSend.collectedTime) {
                const collectedDate = dayjs(dataToSend.collectedAt);
                const collectedTime = dayjs(dataToSend.collectedTime);
                
                // Criar um novo objeto dayjs com a data e hora combinados
                const combinedDateTime = collectedDate
                    .hour(collectedTime.hour())
                    .minute(collectedTime.minute())
                    .second(0);
                
                dataToSend.collectedAt = combinedDateTime.toISOString();
            } else if (dataToSend.collectedAt) {
                dataToSend.collectedAt = dayjs(dataToSend.collectedAt).toISOString();
            }
            
            // Remover o campo collectedTime antes de enviar
            delete dataToSend.collectedTime;
            
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
                // Se o status foi alterado para "Coletado", processar as metas do usuário
                if (dataToSend.status === 'Coletado' && currentAgendamento.status !== 'Coletado') {
                    const userId = currentAgendamento.userId?._id;
                    if (userId) {
                        await processUserGoals(userId, dataToSend.wastes);
                        showAlert('Agendamento atualizado e metas do usuário processadas com sucesso!', 'success');
                    } else {
                        showAlert('Agendamento atualizado com sucesso, mas não foi possível processar metas do usuário.', 'warning');
                    }
                } else {
                    showAlert('Agendamento atualizado com sucesso!', 'success');
                }
                
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

    // Função para confirmar uma ação
    const confirmAction = (title, message, action, actionText = 'Confirmar', cancelText = 'Cancelar') => {
        setConfirmationDialog({
            open: true,
            title,
            message,
            action,
            actionText,
            cancelText
        });
    };

    const handleCloseConfirmation = () => {
        setConfirmationDialog({
            ...confirmationDialog,
            open: false
        });
    };

    const executeConfirmedAction = () => {
        if (confirmationDialog.action) {
            confirmationDialog.action();
        }
        handleCloseConfirmation();
    };

    const handleStatusChange = async (agendamento, newStatus) => {
        try {
            // Se o status for "Coletado", abrir o modal de edição para preencher informações adicionais
            if (newStatus === 'Coletado') {
                handleOpen(agendamento, 'Coletado');
                setFormData(prev => ({
                    ...prev,
                    status: 'Coletado',
                    collectedAt: dayjs(),
                    collectedTime: dayjs()
                }));
                return;
            }
            
            // Para outros status, pedir confirmação
            const statusText = {
                'Confirmado': 'confirmar',
                'Cancelado': 'cancelar'
            };
            
            confirmAction(
                `${statusText[newStatus]} Agendamento`,
                `Tem certeza que deseja ${statusText[newStatus]} este agendamento?`,
                async () => {
                    // Usar o token de acesso do usuário do AuthContext
                    const token = user.accessToken;

                    const updateData = { 
                        status: newStatus
                    };

                    const response = await fetch(`/api/schedule/${agendamento._id}`, {
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
                },
                `${statusText[newStatus].charAt(0).toUpperCase() + statusText[newStatus].slice(1)}`
            );
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            showAlert('Erro ao atualizar status', 'error');
        }
    };

    const handleDelete = async (id) => {
        confirmAction(
            'Excluir Agendamento',
            'Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.',
            async () => {
                try {
                    // Usar o token de acesso do usuário do AuthContext
                    const token = user.accessToken;

                    const response = await fetch(`/api/schedule/${id}`, {
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
            },
            'Excluir'
        );
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

    // Renderiza os botões de ação com base no status atual do agendamento
    const renderActionButtons = (agendamento) => {
        const status = agendamento.status;
        
        return (
            <Stack direction="row" spacing={1}>
                {/* Botão de edição sempre disponível */}
                <IconButton
                    onClick={() => handleOpen(agendamento)}
                    color="primary"
                    title="Editar detalhes"
                    size="small"
                >
                    <EditIcon />
                </IconButton>
                
                {/* Botões específicos para cada status */}
                {status === 'Aguardando confirmação do Ponto de Coleta' && (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<EventAvailableIcon />}
                            onClick={() => handleStatusChange(agendamento, 'Confirmado')}
                        >
                            Confirmar
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => handleStatusChange(agendamento, 'Cancelado')}
                        >
                            Cancelar
                        </Button>
                    </>
                )}
                
                {status === 'Confirmado' && (
                    <>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleStatusChange(agendamento, 'Coletado')}
                        >
                            Coletar
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => handleStatusChange(agendamento, 'Cancelado')}
                        >
                            Cancelar
                        </Button>
                    </>
                )}
                
                
            </Stack>
        );
    };

    // Adicionar função para lidar com mudança de tab
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Função para filtrar agendamentos baseado no tab ativo
    const getFilteredAgendamentos = () => {
        switch (activeTab) {
            case 0:
                return agendamentos.filter(ag => ag.status === 'Aguardando confirmação do Ponto de Coleta');
            case 1:
                return agendamentos.filter(ag => ag.status === 'Confirmado');
            case 2:
                return agendamentos.filter(ag => ag.status === 'Coletado');
            case 3:
                return agendamentos.filter(ag => ag.status === 'Cancelado');
            default:
                return agendamentos;
        }
    };

    // Função para contar agendamentos por status
    const getStatusCount = (status) => {
        return agendamentos.filter(ag => ag.status === status).length;
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

                    {/* Tabs para filtro */}
                    <Paper sx={{ width: '100%', mb: 2 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                            aria-label="Filtro de agendamentos"
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTab-root': {
                                    minWidth: 120,
                                    fontWeight: 'medium',
                                }
                            }}
                        >
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Aguardando
                                        <Chip 
                                            size="small" 
                                            label={getStatusCount('Aguardando confirmação do Ponto de Coleta')} 
                                            color="warning"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                }
                            />
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Confirmados
                                        <Chip 
                                            size="small" 
                                            label={getStatusCount('Confirmado')} 
                                            color="info"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                }
                            />
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Coletados
                                        <Chip 
                                            size="small" 
                                            label={getStatusCount('Coletado')} 
                                            color="success"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                }
                            />
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Cancelados
                                        <Chip 
                                            size="small" 
                                            label={getStatusCount('Cancelado')} 
                                            color="error"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                }
                            />
                            <Tab 
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Todos
                                        <Chip 
                                            size="small" 
                                            label={agendamentos.length} 
                                            color="default"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                }
                            />
                        </Tabs>
                    </Paper>

                    {/* Mensagem informativa do filtro atual */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            {activeTab === 4 
                                ? `Mostrando todos os ${agendamentos.length} agendamentos` 
                                : `Mostrando ${getFilteredAgendamentos().length} agendamentos ${
                                    activeTab === 0 ? 'aguardando confirmação do Ponto de Coleta' :
                                    activeTab === 1 ? 'confirmados' :
                                    activeTab === 2 ? 'coletados' :
                                    'cancelados'
                                }`
                            }
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
                                {getFilteredAgendamentos().map((agendamento) => (
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
                                        <TableCell>{agendamento.collector || 'Não designado'}</TableCell>
                                        <TableCell>{agendamento.collectedAt ? formatDate(agendamento.collectedAt) : 'Pendente'}</TableCell>
                                        <TableCell>
                                            {renderActionButtons(agendamento)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {getFilteredAgendamentos().length === 0 && (
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
                    {formData.status === 'Coletado' ? 'Registrar Coleta' : 'Editar Agendamento'}
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
                                    
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>Status atual:</strong> 
                                            <Chip 
                                                label={currentAgendamento.status} 
                                                color={getStatusColor(currentAgendamento.status)}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        </Typography>
                                    </Grid>
                                </Grid>
                            )}
                            
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {/* Campo oculto para manter o status */}
                                <input type="hidden" name="status" value={formData.status} />
                                
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Coletor"
                                        name="collector"
                                        value={formData.collector}
                                        onChange={handleChange}
                                        margin="normal"
                                        placeholder="Nome do coletor responsável"
                                    />
                                </Grid>
                                
                                {formData.status === 'Coletado' && (
                                    <>
                                        <Grid item xs={12} md={6}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    label="Data da Coleta"
                                                    value={formData.collectedAt}
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
                                        <Grid item xs={12} md={6}>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <TimePicker
                                                    label="Horário da Coleta"
                                                    value={formData.collectedTime}
                                                    onChange={handleTimeChange}
                                                    ampm={false} // Formato 24 horas
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            margin: "normal"
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </Grid>
                                    </>
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
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Ao registrar a coleta, as metas de reciclagem do usuário serão atualizadas automaticamente com base nas quantidades informadas.
                                </Alert>
                            )}
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
                        color={formData.status === 'Coletado' ? "success" : "primary"}
                    >
                        {formData.status === 'Coletado' ? 'Registrar Coleta' : 'Atualizar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de confirmação */}
            <Dialog
                open={confirmationDialog.open}
                onClose={handleCloseConfirmation}
            >
                <DialogTitle>{confirmationDialog.title}</DialogTitle>
                <DialogContent>
                    <Typography>{confirmationDialog.message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmation} color="inherit">
                        {confirmationDialog.cancelText}
                    </Button>
                    <Button 
                        onClick={executeConfirmedAction} 
                        variant="contained" 
                        color={confirmationDialog.actionText === 'Excluir' ? 'error' : 'primary'}
                        autoFocus
                    >
                        {confirmationDialog.actionText}
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
