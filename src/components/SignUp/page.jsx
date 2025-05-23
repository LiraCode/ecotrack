'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LogoClickable from '@/components/Icons/logoClick/page';
import { useAuth } from '@/context/AuthContext';
import { registerUser } from '@/services/authService';
import { fetchAddressByCEP } from '@/services/cepService';
import { formatCPF, validateCPF, formatCEP } from '@/utils/validators';

export default function Cadastro() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    cpf: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [error, setError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [cepError, setCepError] = useState('');

  // Redirecionar se o usuário já estiver logado
  useEffect(() => {
    if (user) {
      router.push(`/`);
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      // Formatar CPF enquanto digita
      const formattedCPF = formatCPF(value);
      setFormData((prevData) => ({ ...prevData, [name]: formattedCPF }));
      
      // Validar CPF quando tiver 11 dígitos
      if (value.replace(/[^\d]/g, '').length === 11) {
        if (!validateCPF(value)) {
          setCpfError('CPF inválido');
        } else {
          setCpfError('');
        }
      } else {
        setCpfError('');
      }
    } else if (name === 'cep') {
      // Formatar CEP enquanto digita
      const formattedCEP = formatCEP(value);
      setFormData((prevData) => ({ ...prevData, [name]: formattedCEP }));
      setCepError('');
      
      // Buscar endereço automaticamente quando o CEP tiver 8 dígitos
      if (value.replace(/[^\d]/g, '').length === 8) {
        handleCEPSearch(formattedCEP);
      }
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleCEPSearch = async (cepValue) => {
    const cep = cepValue || formData.cep;
    
    if (cep.replace(/[^\d]/g, '').length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }

    setLoadingCEP(true);
    setCepError('');

    try {
      const result = await fetchAddressByCEP(cep);
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          endereco: result.address.street,
          bairro: result.address.neighborhood,
          cidade: result.address.city,
          estado: result.address.state,
          cep: formatCEP(result.address.zipCode)
        }));
      } else {
        setCepError(result.error);
      }
    } catch (error) {
      setCepError('Erro ao buscar CEP');
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCEP(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar CPF
    if (cpfError) {
      setError('Por favor, corrija o CPF antes de continuar.');
      return;
    }
    
    if (!validateCPF(formData.cpf)) {
      setCpfError('CPF inválido');
      setError('Por favor, insira um CPF válido.');
      return;
    }
    
    // Validar se as senhas coincidem
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
    
    // Validar se o CEP foi preenchido corretamente
    if (formData.cep.replace(/[^\d]/g, '').length !== 8) {
      setCepError('CEP inválido');
      setError('Por favor, insira um CEP válido.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Adicionar o tipo de usuário aos dados
      const userData = { ...formData, userType: 'cliente' };
      
      // Registrar usuário no Firebase e MongoDB
      const result = await registerUser(formData.email, formData.senha, userData);
      
      if (result.success) {
        // Redirecionar para a página de login ou dashboard
        router.push(`/cliente/login?registered=true`);
      } else {
        setError(result.error || 'Erro ao criar conta. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError('Ocorreu um erro durante o cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar CEP manualmente (botão)
  const handleSearchCEPClick = () => {
    if (formData.cep) {
      handleCEPSearch(formData.cep);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="meta-3 text-white py-5 px-6">
          <h2 className="text-2xl font-bold text-center">
            Cadastro de Cliente
          </h2>
        </div>
        <LogoClickable rota='/' color='#08B75B' width={150} height={150} />
        
        {error && (
          <div className="px-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          <div>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="nomeCompleto"
              placeholder="Nome Completo"
              value={formData.nomeCompleto}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <input
              className={`w-full px-4 py-2 border ${cpfError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              type="text"
              name="cpf"
              placeholder="CPF (000.000.000-00)"
              value={formData.cpf}
              onChange={handleChange}
              required
              maxLength={14}
            />
            {cpfError && <p className="text-red-500 text-xs mt-1">{cpfError}</p>}
          </div>
          
          <div className="relative">
            <div className="flex">
              <input
                className={`w-full px-4 py-2 border ${cepError ? 'border-red-500' : 'border-gray-300'} rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                type="text"
                name="cep"
                placeholder="CEP (00000-000)"
                value={formData.cep}
                onChange={handleChange}
                required
                maxLength={9}
              />
              <button
                type="button"
                onClick={handleSearchCEPClick}
                disabled={loadingCEP}
                className="bg-green-500 hover:bg-green-600 text-white px-3 rounded-r-md"
              >
                {loadingCEP ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Buscar"
                )}
              </button>
            </div>
            {cepError && <p className="text-red-500 text-xs mt-1">{cepError}</p>}
            <p className="text-xs text-gray-500 mt-1">Digite o CEP para preencher o endereço automaticamente</p>
          </div>
          
          <div>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="endereco"
              placeholder="Rua/Avenida"
              value={formData.endereco}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="numero"
              placeholder="Número"
              value={formData.numero}
              onChange={handleChange}
              required
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="complemento"
              placeholder="Complemento"
              value={formData.complemento}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="bairro"
              placeholder="Bairro"
              value={formData.bairro}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="cidade"
              placeholder="Cidade"
              value={formData.cidade}
              onChange={handleChange}
              required
            />
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="estado"
              placeholder="Estado"
              value={formData.estado}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="text"
              name="telefone"
              placeholder="Telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="password"
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <div>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              type="password"
              name="confirmarSenha"
              placeholder="Confirmar Senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="pt-4">
            <button 
              className="w-full meta-3 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
          
          <div className="text-center pt-4 pb-2">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/cliente/login" className="text-green-500 hover:text-green-600 font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
