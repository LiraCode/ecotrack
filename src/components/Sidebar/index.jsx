import React, { useState } from "react";
import Link from "next/link";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import '@/app/styles/globals.css';

const menuGroups = [
  {
    name: "main",
    menuItems: [
      {
        id: 1,
        icon: <i className="fa-solid fa-house text-green-600 text-2xl"></i>,
        label: "Início",
        route: "/"
      },
      {
        id: 2,
        icon: <i className="fa-solid fa-calendar-plus text-green-600 text-2xl"></i>,
        label: "Agendar",
        route: "/agendamento"
      },
      {
        id: 3,
        icon: <i className="fa-sharp fa-solid fa-recycle text-green-600 text-2xl"></i>,
        label: "Eco Pontos",
        route: "/locais"
      },
      {
        icon: (
          <i className="fa-solid fa-user" style={{ fontSize: "32px", color: "#08B75B" }}></i>
        ),
        label: "Perfil",
        route: "/perfil",
      },
      {
        icon: (
          <i className="fa-solid fa-gamepad-modern" style={{ fontSize: "32px", color: "#08B75B" }}></i>
        ),
        label: "Games",
        route: "/games",
      },
      {
        icon: (
          <i className="fa-solid fa-books" style={{ fontSize: "32px", color: "#08B75B" }}></i>
        ),
        label: "Blog",
        route: "/posts",
      },
      {
        icon: (
          <i className="fa-solid fa-shield-keyhole" style={{ fontSize: "32px", color: "#08B75B" }}></i>
        ),
        label: "Login",
        route: "/cliente/login",
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className="fixed left-0 top-0 z-50 h-screen overflow-y-hidden transition-all duration-300 ease-in-out"
        style={{
          width: sidebarOpen ? '240px' : '100px',
          backgroundColor: '#e5e7eb',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 flex">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <ul className="mb-2 flex flex-col gap-2 text-sm">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
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
