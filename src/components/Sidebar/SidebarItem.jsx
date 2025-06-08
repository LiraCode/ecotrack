import React from "react";
import Link from "next/link";

const SidebarItem = ({ item, pageName, setPageName, theme }) => {
  const { icon, label, route } = item;
  const isActive = pageName === label;

  return (
    <Link
      href={route}
      onClick={() => setPageName(label)}
      className={`group relative flex w-full flex-col items-center rounded-sm py-1.5 px-2 font-medium duration-300 ease-in-out ${
        theme === 'light'
          ? isActive
            ? 'bg-green-50 text-green-600' // Ativo no modo claro
            : 'text-green-600 hover:bg-green-50' // Normal no modo claro
          : isActive
          ? 'bg-graydark text-secondary' // Ativo no modo escuro (original)
          : 'text-bodydark1 hover:bg-graydark' // Normal no modo escuro (original)
      }`}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <span className="mb-0.5 flex items-center justify-center">
          {React.cloneElement(icon, {
            style: { 
              ...icon.props.style, 
              fontSize: "28px",
              color: theme === 'light' && isActive ? '#2e8b57' : 
                    theme === 'light' ? '#2e8b57' : 
                    icon.props.style?.color
            }
          })}
        </span>
        <span className="text-[10px] lg:text-[13px] text-center w-full leading-tight">
  {label}
</span>
      </div>
    </Link>
  );
};

export default SidebarItem;