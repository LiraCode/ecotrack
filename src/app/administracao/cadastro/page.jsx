'use client';
import Cadastro from "@/components/SignUp/page";
import AppLayout from "@/components/Layout/page";

export default function CadastroPage() {
  return (
    <AppLayout>
      <div className="lg:ml-[100px] lg:mr-[0px] lg:mt-0 mt-16 flex flex-col w-90vh h-95vh">
        <Cadastro userType="administração" />
      </div>
    </AppLayout>
  );
}