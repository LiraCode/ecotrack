import { Avatar, Card, CardContent, Typography, Box, Divider, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Image from 'next/image';

export default function Profile({ userType, userData }) {
  // Default profile image path
  const profileImage = userData.urlPhoto || '/images/generic_user.png';


  return (
    <Box className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg overflow-hidden">
        {/* Green banner for title with rounded top */}
        <Box className="bg-green-500 text-white py-5 px-6 text-center">
          <Typography variant="h5" component="h2" className="font-bold">
            Perfil {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </Typography>
        </Box>

        <CardContent className="p-6">
          {/* Profile Image */}
          <Box className="flex flex-col items-center mb-6">
            <Avatar
              src={profileImage}
              alt={userData.nomeCompleto}
              sx={{ width: 120, height: 120, mb: 2, border: '4px solid #4CAF50' }}
            />
            <Typography variant="h6" className="font-bold text-gray-800 text-center">
              {userData.nomeCompleto}
            </Typography>
            <Typography variant="body2" className="text-gray-600 text-center">
              {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </Typography>
          </Box>

          <Divider className="my-4" />

          <Box className="space-y-3 px-2 flex flex-col items-center">
            <Typography variant="body1" className="text-gray-700 text-center">
              <span className="font-semibold">Email:</span> {userData.email}
            </Typography>
          
            {/* Renderizar CPF para cliente ou colaborador */}
            {(userType === 'cliente' || userType === 'colaborador') && (
              <Typography variant="body1" className="text-gray-700 text-center">
                <span className="font-semibold">CPF:</span> {userData.cpf}
              </Typography>
            )}

            {/* Renderizar endereço somente para cliente */}
            {userType === 'Cliente' && (
              <Typography variant="body1" className="text-gray-700 text-center">
                <span className="font-semibold">Endereço:</span> {userData.endereco}
              </Typography>
            )}

            {/* Renderizar telefone para todos */}
            <Typography variant="body1" className="text-gray-700 text-center">
              <span className="font-semibold">Telefone:</span> {userData.telefone}
            </Typography>
          </Box>

          <Box className="mt-6 flex justify-center">
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              className="bg-green-500 hover:bg-green-600"
            >
              Editar Perfil
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}