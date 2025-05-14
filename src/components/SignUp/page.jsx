'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LogoClickable from '@/components/Icons/logoClick/page';
import { useAuth } from '@/context/AuthContext';
import { registerAdmin, registerResponsible, registerUser } from '@/services/authService';

export default function Cadastro({ userType }) {
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
  const [error, setError] = useState('');

  // Redirecionar se o usuário já estiver logado
  useEffect(() => {
    console.log('User:', userType);
    if (user && userType === 'clientes') {

      router.push(`/`);
    }
  }, [user, router, userType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar se as senhas coincidem
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
    
    try {
      setLoading(true);
      
      // Adicionar o tipo de usuário aos dados
      const role = userType === 'cliente' ? 'User' : userType === 'responsável' ? 'Responsável' : 'Administrador';
      const userData = userType === 'cliente'?{ ...formData, userType }: { ...formData, role };
     
      var result = null;
      
      // Registrar usuário no Firebase e MongoDB
      console.log('User Type:', userType);
      if (userType === 'cliente') {
         result = await registerUser(formData.email, formData.senha, userData);
      } else if (userType === 'responsável') {
         result = await registerResponsible(formData.email, formData.senha, userData);
      } else if (userType === 'administração') {
        formData.role === 'administrador' ? console.log(userData): formData.role = 'employee'; 
         result = await registerAdmin(formData.email, formData.senha, userData);
      }
      
      if (result.success) {
        // Redirecionar para a página de login ou dashboard
        router.push(`/${userType}/login?registered=true`);
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

  const isCliente = userType === 'cliente';
  const isColaborador = userType === 'responsável';
  const isAdmin = userType === 'administração';
  

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="meta-3 text-white py-5 px-6">
          <h2 className="text-2xl font-bold text-center">
            Cadastro de {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </h2>
        </div>
         <LogoClickable rota='/' color='#08B75B' width={150} height={150} />
        
        {error && (
          <div className="px-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {/* Campos comuns para todos */}
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
          
          {!isAdmin && (
            <div>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                type="text"
                name="cpf"
                placeholder="CPF"
                value={formData.cpf}
                onChange={handleChange}
                required={userType !== 'administrador'}
              />
            </div>
          )}
          
          {isCliente && (
            <>
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
                  name="cep"
                  placeholder="CEP"
                  value={formData.cep}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          
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
          {isAdmin && (
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAdmin"
                  className="mr-2"
                  value={formData.role = 'Administrador'}
                  onChange={handleChange}
                />
                <label className="text-sm text-gray-600">
                  esse cadastro é para um administrador?
                </label>
              </div>
            </div>
          )}

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
              <Link href={`/${userType}/login`} className="text-green-500 hover:text-green-600 font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
