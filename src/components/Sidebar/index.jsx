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
          <svg
  width="56"
  height="56"
  version="1.1"
  viewBox="0 0 4734.92 4734.92"
  style={{
    shapeRendering: "geometricPrecision",
    textRendering: "geometricPrecision",
    imageRendering: "optimizeQuality",
    fillRule: "evenodd",
    clipRule: "evenodd",
  }}
  xmlns="http://www.w3.org/2000/svg"
>
  <g id="Camada_x0020_1">
    <g id="_2411150338816">
      <path
        fill="#08B75B"
        d="M1785.21 3101.14l772.96 0 -0.39 1046.37c0.06,37.2 42.61,24.43 80.17,24.43l522.99 0c137.18,0 252.89,-11.23 339.31,-79.09 96.45,-75.75 142.04,-139.73 173.55,-244.83 33.4,-111.36 15.45,-650.46 15.45,-821.34 0,-97.39 25.37,-328.71 -28.31,-390.08 -61.12,-69.87 -141.64,-143.3 -208.37,-210.03l-1045.97 -1045.98c-60.36,-60.35 -154.02,-183.78 -234.91,-183.78 -80.71,0 -174.26,123.14 -234.9,183.78l-1045.98 1045.98c-66.72,66.73 -147.25,140.16 -208.36,210.03 -53.69,61.37 -28.31,292.69 -28.31,390.08 0,170.95 -17.97,709.92 15.44,821.34 34.79,116.03 88.23,177.82 173.56,244.83 85.13,66.86 198.86,79.09 339.3,79.09l523 0c38.67,0 79.1,12.57 80.02,-24.57 1.73,-68.62 -0.25,-140.43 -0.25,-209.45 0,-278.92 0,-557.86 0,-836.78z"
      />
      <path
        fill="#08B75B"
        d="M1817.12 370.96l-1711.76 1692.1 2.74 2.74c0,2.76 -22.4,55.86 -26.39,69.34 -3.41,11.52 -4.9,23.04 -5.52,35.22l0 63.34c2.73,51.6 34.53,92.81 58.7,124.42 26.38,34.5 71.62,58.86 117.57,73.9 75.32,24.66 126.91,-11.65 167.66,-11.65l0 -7.09c43.51,0 574.05,-550.74 638.24,-613.4 212.62,-207.55 420.86,-420.14 626.45,-626.95 103.07,-103.68 214.51,-207.16 313.06,-312.75 170.17,-182.35 216.21,-139.68 369.93,22.03 98.11,103.21 210.04,211.54 312.94,312.88 104.33,102.75 207.55,214.93 313.64,313.95 213.13,198.91 415.06,423.22 625.66,625.96 72.19,69.49 237.24,263.04 332.54,293.28 138.62,43.97 283.58,-49.31 314.61,-175.19l0 -99.02c-1.22,-4.95 -2.62,-9.92 -4.24,-14.89 -27.54,-84.63 -51.69,-102.72 -130.49,-181.53l-469.81 -469.8c-103.8,-103.8 -97.5,-62.04 -97.5,-214.51 0,-104.6 0,-209.2 0,-313.8 0,-104.31 1.55,-209.77 0.14,-313.93 -0.62,-45.71 -61.06,-193.1 -120.7,-193.1l0 -7.1c-43.56,0 -71.25,-44.78 -179.61,-23.59 -46.13,9.02 -98.08,40.12 -134.79,86.81 -73.7,93.77 -50.8,245.48 -50.8,390.63z"
      />
    </g>
  </g>
</svg>

        ),
        label: "Início",
        route: "/",
      },
      {
        icon: (
          <svg
            className="fill-current"
            width="56"
            height="56"
            viewBox="0 0 18 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_130_9756)">
              <path
                d="M15.7501 0.55835H2.2501C1.29385 0.55835 0.506348 1.34585 0.506348 2.3021V15.8021C0.506348 16.7584 1.29385 17.574 2.27822 17.574H15.7782C16.7345 17.574 17.5501 16.7865 17.5501 15.8021V2.3021C17.522 1.34585 16.7063 0.55835 15.7501 0.55835ZM6.69385 10.599V6.4646H11.3063V10.5709H6.69385V10.599ZM11.3063 11.8646V16.3083H6.69385V11.8646H11.3063ZM1.77197 6.4646H5.45635V10.5709H1.77197V6.4646ZM12.572 6.4646H16.2563V10.5709H12.572V6.4646ZM2.2501 1.82397H15.7501C16.0313 1.82397 16.2563 2.04897 16.2563 2.33022V5.2271H1.77197V2.3021C1.77197 2.02085 1.96885 1.82397 2.2501 1.82397ZM1.77197 15.8021V11.8646H5.45635V16.3083H2.2501C1.96885 16.3083 1.77197 16.0834 1.77197 15.8021ZM15.7501 16.3083H12.572V11.8646H16.2563V15.8021C16.2563 16.0834 16.0313 16.3083 15.7501 16.3083Z"
                fill="#08B75B"
              />
            </g>
            <defs>
              <clipPath id="clip0_130_9756">
                <rect
                  width="18"
                  height="18"
                  fill="#08B75B"
                  transform="translate(0 0.052124)"
                />
              </clipPath>
            </defs>
          </svg>
        ),
        label: "Convidados",
        route: "#",
        children: [
          { label: "Importar", route: "/import" },
          { label: "Exportar", route: "/export" },
        ],
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
