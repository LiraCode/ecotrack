"use client";
import React, { useEffect, useState } from "react";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import '@/app/styles/globals.css';
import { useAuth } from "@/context/AuthContext";
import menuGroups from "@/data/menuItems";



const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  // salvar sidebarOpen no localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarOpen", sidebarOpen);
    }
  }, [sidebarOpen]);
  const { user } = useAuth();
  const [pageName, setPageName] = useState("início");
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const [role, setRole] = useState("");


  useEffect(() => {
    // Verifica o estado do usuário e define o role
    if (user) {
      if(user.role){
        setRole(user.role);
        setLoading(false);
      }
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
