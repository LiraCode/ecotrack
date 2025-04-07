"use client"; // ⬅️ Adicione isso no topo do arquivo
import { useRouter } from 'next/navigation';
import Logo from "./logo"; // Ajuste o caminho conforme necessário

export default function LogoClickable({ rota = '/', color = '#ffffff', width = 150, height = 150 }) {
    const router = useRouter(); // Agora pode ser usado dentro do App Router

    const handleLogoClick = () => {
        router.push(rota);
    };

    return (
        <div onClick={handleLogoClick} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Logo Color={color} width={width} height={height} />
        </div>
    );
}
