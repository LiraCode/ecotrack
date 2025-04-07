"use client";
import React from "react";
import Link from "next/link";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import '@/app/styles/globals.css'

const menuGroups = [
  {
    name: " ",
    menuItems: [
      {
        icon: (
          
<i className="fa-duotone fa-solid fa-house" style={{fontSize:"32px" , color: "#08B75B"}}></i>
        ),
        label: "Início",
        route: "/",
      },
      {
        icon: (
          //<i class="fa-duotone fa-solid fa-calendar-plus"></i>
          <i className="fa-solid fa-calendar-plus" style={{fontSize:"32px" , color: "#08B75B"}}></i>
        ),
        label: "Agendar",
        route: "#",
        
      },
      {
        icon: (
          //<i class="fa-duotone fa-solid fa-calendar-plus"></i>
          //<i class="fa-sharp fa-solid fa-recycle"></i>
          <i className="fa-sharp fa-solid fa-recycle" style={{fontSize:"32px" , color: "#08B75B"}}></i>
        ),
        label: "Eco Pontos",
        route: "#",
        
      },
      {
        icon: (
          //<i class="fa-duotone fa-solid fa-calendar-plus"></i>
          <i className="fa-solid fa-user" style={{fontSize:"32px" , color: "#08B75B"}}></i>
        ),
        label: "Perfil",
        route: "#",
        
      },
      {
        icon: (
          //<i class="fa-solid fa-books"></i>
          //<i class="fa-duotone fa-solid fa-gamepad-modern"></i>
          <i className="fa-solid fa-gamepad-modern" style={{fontSize:"32px" , color: "#08B75B"}}></i>
        ),
        label: "Games",
        route: "#",
        
      },
      {
        icon: (
          //<i class="fa-solid fa-books"></i>
          //<i class="fa-duotone fa-solid fa-gamepad-modern"></i>
          <i className="fa-solid fa-books" style={{fontSize:"32px" , color: "#08B75B"}}></i>
        ),
        label: "Blog",
        route: "/posts",
        
      },
      {
        icon: (
          //<i class="fa-solid fa-shield-keyhole"></i>
          //<i class="fa-duotone fa-solid fa-gamepad-modern"></i>
          <i className="fa-solid fa-shield-keyhole" style={{fontSize:"32px" , color: "#08B75B"}}></i>
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
        className={`fixed left-0  z-9999 flex h-screen w-28 flex-col overflow-y-hidden meta-9 duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear green">
          {/* Sidebar Menu */}
          <nav className="mt-5 flex  lg:mt-5 ">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                

                <ul className="mb-2 flex flex-col gap-2 text-sm ">
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
          {/* Sidebar Menu */}
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
