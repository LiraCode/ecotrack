import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configuração do nodemailer
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Credenciais de email não configuradas. Configure EMAIL_USER e EMAIL_PASS no arquivo .env.local');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Usar senha de aplicativo do Gmail
    },
  });
};

export async function POST(request) {
  try {
    const { nome, email, telefone, ecoponto, mensagem, tipoContato } = await request.json();
    let ecopontoData = null;

    const transporter = createTransporter();

    // Verificar a conexão com o servidor de email
    try {
      await transporter.verify();
    } catch (error) {
      console.error('Erro de configuração do email:', error);
      throw new Error(`Erro na configuração do email.
        Detalhes: ${error.message}`);
    }

    if (tipoContato === 'admin') {
      // Email para administração do site
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'fls.frontend@gmail.com', // Email da administração
        subject: 'Contato de ' + nome +  ',  para Administração - EcoTrack',
        html: `
          <h2>Nova mensagem de contato enviada do site EcoTrack</h2>
          <p><strong>Enviada por:</strong> ${nome}</p>
          <p><strong>Email de contato:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${telefone}</p>
          <p><strong>Conteúdo da mensagem:</strong></p>
          <p>${mensagem}</p>
        `,
      });
    } else {
      // Buscar informações do ecoponto selecionado
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const ecopontoResponse = await fetch(`${baseUrl}/api/collection-points/${ecoponto}`);
      if (!ecopontoResponse.ok) {
        throw new Error('Erro ao buscar informações do ecoponto');
      }
      const response = await ecopontoResponse.json();
      ecopontoData = response.collectionPoint;

      if (!ecopontoData?.responsableId?.email) {
        throw new Error('Erro na busca dos dados do ecoponto');
      }

      // Email para o responsável do ecoponto
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: ecopontoData.responsableId.email,
        subject: `Nova mensagem de contato sobre o Ecoponto: ${ecopontoData.name} - EcoTrack`,
        html: `
          <h2>Nova mensagem sobre seu Ecoponto</h2>
          <p><strong>Enviada por:</strong> ${nome}</p>
          <p><strong>Email para contato:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${telefone}</p>
          <p><strong>sobre qual Ecoponto:</strong> ${ecopontoData.name}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${mensagem}</p>
          <p><strong>Endereço do Ecoponto:</strong></p>
          <p>${ecopontoData.address.street}, ${ecopontoData.address.number} - ${ecopontoData.address.neighborhood}</p>
          <p>${ecopontoData.address.city} - ${ecopontoData.address.state}</p>
        `,
      });
    }

    // Email de confirmação para o usuário
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmação de mensagem - EcoTrack',
      html: `
        <h2>Obrigado por entrar em contato!</h2>
        <p>Confirmamos o envio da sua mensagem.</p>
        <p><strong>Telefone informado:</strong> ${telefone}</p>
        ${tipoContato === 'admin' ? `
        <p>Sua mensagem foi enviada para a administração do EcoTrack.</p>
        ` : `
        <p>Sua mensagem foi enviada para o email fornecido pelo responsável do ecoponto selecionado.</p>
        <p>Detalhes do Ecoponto:</p>
        <p><strong>Nome:</strong> ${ecopontoData.name}</p>
        <p><strong>Endereço:</strong> ${ecopontoData.address.street}, ${ecopontoData.address.number} . ${ecopontoData.address.neighborhood} - ${ecopontoData.address.city}-${ecopontoData.address.state}.</p>
        `}
        <p>Atenciosamente,<br>Equipe EcoTrack</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    // Retornar mensagem de erro 
    const errorMessage = error.code === 'EAUTH' 
      ? 'Erro de autenticação do email. Verifique as configurações do Gmail.'
      : error.message || 'Erro ao processar sua solicitação';

    return NextResponse.json(
      { error: errorMessage },
      { status: error.code === 'EAUTH' ? 401 : 500 }
    );
  }
} 