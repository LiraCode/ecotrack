"use client";
import React, { useEffect } from "react";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import { useState } from "react";
import '@/app/styles/globals.css';
import { useAuth } from "@/context/AuthContext";





// Define menu items in a more organized structure
const menuGroups = [
  {
    name: " ",
    menuItems: [
      { 
        icon: <i className="fa-duotone fa-solid fa-house" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Início",
        route: "/",
        role: "all",
      },
      {
        icon: <i className="fa-solid fa-calendar-plus" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Agendar",
        route: "/agendamento",
        role: "user",
      },
      {
        icon: <i className="fa-sharp fa-solid fa-recycle" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Eco Pontos",
        route: "/locais",
        role:"all",
      },
      {
        icon: <i className="fa-solid fa-user" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Perfil",
        route: "/cliente/perfil",
        role: "user",
      },
      {
        icon: <i className="fa-solid fa-gamepad-modern" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Games",
        route: "/cliente/metas",
        role: "user",
      },
      {
        icon: <i className="fa-solid fa-books" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Blog",
        route: "/posts",
        role: "all",
      },
      {
        icon: <i className="fa-solid fa-shield-keyhole" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Acesso Cliente",
        route: "/cliente/login",
        role: "not-logged",
      },
      {
        icon: <i className="fa-solid fa-handshake-simple" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Acesso Parceiros",
        route: "/",
        role: "not-logged",
      }
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  // Use local state instead of localStorage to avoid hydration issues
  const [pageName, setPageName] = useState("dashboard");
  const { user } = useAuth();
  const [role, setRole] = useState("all"); // Initialize with "all" as default
  const [loggedRole, setLoggedRole] = useState("not-logged"); // Initialize with "not-logged" as default
  
  const isUser = async () => {
    try {
      const token = user?.accessToken || null;
      if (!user || !token) return false;
      const response = await fetch('/api/users/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          uid: user.uid,
        }
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao verificar permissões do user:', error);
      return false;
    }
  };

  const isAdmin = async () => {
    try {
      const token = user?.accessToken || null;
      if (!user || !token) return false;
      const response = await fetch('/api/admin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          uid: user.uid,
        }
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao verificar permissões do admin:', error);
      return false;
    }
  };
 

  // Use useEffect to call the async function and update the role state
  useEffect(() => {
    const checkUserRole = async () => {
      const isUserRole = await isUser();
      const userRole = isUserRole ? 'user' : 'all';
      setLoggedRole(user ? "logged" : "not-logged");
      setRole(userRole);
      if (userRole === "all" && user) {
        const adminRole = await isAdmin();
        setRole(adminRole ? "admin" : "responsible");
        
      }
    };
    checkUserRole();
    
  }, [user]); // Re-run when user changes
  // Update pageName from localStorage after component mounts
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
  
  // Update localStorage when pageName changes
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

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 z-50 flex h-screen min-w-28 max-w-28 flex-col overflow-y-hidden bg-gray-100 duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear green aling-center">
          {/* Sidebar Menu */}
          <nav className="mt-5 flex flex-col items-center w-full lg:mt-5">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="w-full">
                <ul className="mb-2 flex flex-col gap-2 text-sm w-full">
                  {group.menuItems.filter(item => item.role === role || item.role === "all" || item.role === loggedRole).map((menuItem, menuIndex) => (
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
