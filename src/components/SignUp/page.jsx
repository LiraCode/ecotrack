'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LogoClickable from '@/components/Icons/logoClick/page'; 


export default function Cadastro({ userType }) {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    cpf: '',
    endereco: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados enviados:', formData);
  };

  const isCliente = userType === 'cliente';
  const isColaborador = userType === 'colaborador';
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
            <div>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                type="text"
                name="endereco"
                placeholder="Endereço"
                value={formData.endereco}
                onChange={handleChange}
                required
              />
            </div>
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
            />
          </div>

          <div className="pt-4">
            <button 
              className="w-full meta-3 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              type="submit"
            >
              Cadastrar
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
