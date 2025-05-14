"use client";
import React, { useEffect, useState } from "react";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import '@/app/styles/globals.css';
import { useAuth } from "@/context/AuthContext";

const menuGroups = [
  {
    name: " ",
    menuItems: [
      { 
        icon: <i className="fa-duotone fa-solid fa-house" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "Início",
        route: "/",
        role: "all",
      },
      {
        icon: <i className="fa-solid fa-calendar-plus" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "Agendar",
        route: "/agendamento",
        role: "User",
      },
      {
        icon: <i className="fa-sharp fa-solid fa-recycle" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "Eco Pontos",
        route: "/locais",
        role: "all",
      },
      {
        icon: <i className="fa-solid fa-user" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "Perfil",
        route: "/cliente/perfil",
        role: "User",
      },
      {
        icon: <i className="fa-solid fa-gamepad-modern" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "Games",
        route: "/cliente/metas",
        role: "user",
      },
      {
        icon: <i className="fa-solid fa-books" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "Blog",
        route: "/posts",
        role: "all",
      },
      {
        icon: <i className="fa-solid fa-shield-keyhole" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "Acesso Cliente",
        route: "/cliente/login",
        role: "not-logged",
      },
      {
        icon: <i className="fa-solid fa-handshake-simple" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "Acesso Parceiros",
        route: "/parceiro/login",
        role: "not-logged",
      },
      {
        icon: <i className="fa-solid fa-user-plus" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "Add Admin / Funcionário",
        route: "administracao/cadastro",
        role: "Administrador",
      },
      {
        
        icon: <i className="fa-solid fa-trash-can-plus" style={{ fontSize: "32px", color: "#08B75B" }} />,
        label: "add tipos de resíduos",
        route: "/administracao/residuos/",
        role: "Administrador",
      }
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const [pageName, setPageName] = useState("dashboard");
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const [role, setRole] = useState("");


  useEffect(() => {
    // Verifica o estado do usuário e define o role
    if (user) {
      setRole(user.role);
      setLoading(false); 
    
    } else {
      setRole("all");
      setLoading(false);
    }
  

  }, [user]);

  


  // Atualiza o pageName a partir do localStorage quando o componente monta
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedPage = localStorage.getItem("selectedMenu");
        if (storedPage) {
          setPageName(JSON.parse(storedPage));
        }
      } catch (error) {
        console.error("Error accessing localStorage", error);
      }
    }
  }, []);

  // Atualiza o localStorage sempre que pageName muda
  const handleSetPageName = (value) => {
    setPageName(value);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("selectedMenu", JSON.stringify(value));
      } catch (error) {
        console.error("Error saving to localStorage", error);
      }
    }
  };

  // Enquanto carrega, pode renderizar uma interface de carregamento
  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 z-50 flex h-screen min-w-28 max-w-28 flex-col overflow-y-hidden bg-gray-100 duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear green aling-center">
          <nav className="mt-5 flex flex-col items-center w-full lg:mt-5">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="w-full">
                <ul className="mb-2 flex flex-col gap-2 text-sm w-full">
                  {group.menuItems
                    .filter((item) =>
                      item.role === role ||
                      item.role === "all" ||
                      (!user
                        ? item.role === "not-logged"
                        : item.role === "logged")
                    )
                    .map((menuItem, menuIndex) => (
                      <li key={menuIndex} className="flex justify-center w-full align-center">
                        <SidebarItem
                          item={menuItem}
                          pageName={pageName}
                          setPageName={handleSetPageName}
                        />
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
