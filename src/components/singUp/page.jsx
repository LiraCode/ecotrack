'use client';
import Head from 'next/head';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '@/app/styles/util.css';
import '@/app/styles/main.css';
import { useState } from 'react';

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
    <>
      <Head>
        <title>Cadastro</title>
      </Head>
      <div className="limiter">
        <div className="container-login100">
          <div className="wrap-login100">
            <form onSubmit={handleSubmit} className="login100-form validate-form p-l-55 p-r-55 p-t-178">
              <span className="login100-form-title">
                Cadastro de {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </span>
              <div className="logo-container">
                              <Image
                                src="/logo.svg"
                                alt="Logo"
                                className="logo"
                                width={150}
                                height={150}
                              />
              </div>

              {/* Campos comuns para todos */}
              <div className="wrap-input50 m-b-16">
                <input
                  className="input50"
                  type="text"
                  name="nomeCompleto"
                  placeholder="Nome Completo"
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                  required
                />
                <span className="focus-input50"></span>
              </div>
              <div className="wrap-input50 m-b-16">
                <input
                  className="input50"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <span className="focus-input50"></span>
              </div>
              {!isAdmin  && (
                <div className="wrap-input50 m-b-16">
                  <input
                    className="input50"
                    type="text"
                    name="cpf"
                    placeholder="CPF"
                    value={formData.cpf}
                    onChange={handleChange}
                    required={userType !== 'administrador'}
                  />
                  <span className="focus-input50"></span>
                </div>
              )}
              {isCliente && (
                <div className="wrap-input50 m-b-16">
                  <input
                    className="input50"
                    type="text"
                    name="endereco"
                    placeholder="Endereço"
                    value={formData.endereco}
                    onChange={handleChange}
                    required
                  />
                  <span className="focus-input50"></span>
                </div>
              )}
              <div className="wrap-input50 m-b-16">
                <input
                  className="input50"
                  type="text"
                  name="telefone"
                  placeholder="Telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                />
                <span className="focus-input50"></span>
              </div>
              <div className="wrap-input50 m-b-16">
                <input
                  className="input50"
                  type="password"
                  name="senha"
                  placeholder="Senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                />
                <span className="focus-input50"></span>
              </div>
              <div className="wrap-input50 m-b-16">
                <input
                  className="input50"
                  type="password"
                  name="confirmarSenha"
                  placeholder="Confirmar Senha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                />
                <span className="focus-input50"></span>
              </div>

              <div className="container-login100-form-btn">
                <button className="login100-form-btn">Cadastrar</button>
                <div className="flex-col-c p-t-80 p-b-40"></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
