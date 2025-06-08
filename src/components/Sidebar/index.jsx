"use client";
import React, { useEffect, useState } from "react";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import '@/app/styles/globals.css';
import { useAuth } from "@/context/AuthContext";
import menuGroups from "@/data/menuItems";

const Sidebar = ({ sidebarOpen, setSidebarOpen, theme }) => { 
  const { user } = useAuth();
  const [pageName, setPageName] = useState("início");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  // Verifica o papel (role) do usuário e define quais itens de menu exibir
  useEffect(() => {
    if (user) {
      if (user.role) {
        setRole(user.role);
        setLoading(false);
      }
    } else {
      setRole("all");
      setLoading(false);
    }
  }, [user]);

  // Atualiza o pageName a partir do localStorage
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

  if (loading) {
    return <div>Carregando...</div>;
  }

  const shouldDisplayMenuItem = (item) => {
    if (!user) {
      return (
        item.role === "not-logged" ||
        item.role === "all" ||
        (Array.isArray(item.role) && (item.role.includes("not-logged") || item.role.includes("all")))
      );
    }

    return (
      item.role === "logged" ||
      item.role === "all" ||
      item.role === role ||
      (Array.isArray(item.role) && (
        item.role.includes("logged") ||
        item.role.includes("all") ||
        item.role.includes(role)
      ))
    );
  };

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 z-50 flex h-screen min-w-28 max-w-28 flex-col overflow-y-auto duration-300 ease-linear lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${
          theme === 'light' 
            ? 'bg-white border-r border-green-100' 
            : 'bg-boxdark dark:bg-boxdark'
        }`}
      >
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear green aling-center h-full">
          <nav className="mt-2 flex flex-col items-center w-full">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="w-full">
                <ul className="mb-1 flex flex-col gap-1 text-sm w-full">
                  {group.menuItems
                    .filter(shouldDisplayMenuItem)
                    .sort((a, b) => a.pos - b.pos)
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