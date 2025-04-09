"use client";
import React, { useEffect } from "react";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import { useState } from "react";
import '@/app/styles/globals.css';

// Define menu items in a more organized structure
const menuGroups = [
  {
    name: " ",
    menuItems: [
      {
        icon: <i className="fa-duotone fa-solid fa-house" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Início",
        route: "/",
      },
      {
        icon: <i className="fa-solid fa-calendar-plus" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Agendar",
        route: "/agendamento",
      },
      {
        icon: <i className="fa-sharp fa-solid fa-recycle" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Eco Pontos",
        route: "/locais",
      },
      {
        icon: <i className="fa-solid fa-user" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Perfil",
        route: "/cliente/perfil",
      },
      {
        icon: <i className="fa-solid fa-gamepad-modern" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Games",
        route: "/cliente/metas",
      },
      {
        icon: <i className="fa-solid fa-books" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Blog",
        route: "/posts",
      },
      {
        icon: <i className="fa-solid fa-shield-keyhole" style={{fontSize:"32px", color: "#08B75B"}}></i>,
        label: "Login",
        route: "/cliente/login",
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  // Use local state instead of localStorage to avoid hydration issues
  const [pageName, setPageName] = useState("dashboard");
  
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
                  {group.menuItems.map((menuItem, menuIndex) => (
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
