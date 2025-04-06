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
        route: "#",
        
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
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between gap-1 py-2 lg:py-2.5">
          <Link href="/"></Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block lg:hidden"
          >
             <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill="#08B75B"
              />
            </svg>
          </button>
        </div>
        {/* SIDEBAR HEADER */}

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear green">
          {/* Sidebar Menu */}
          <nav className="mt-5 flex  py-2 lg:mt-5 ">
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
