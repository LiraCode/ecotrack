import React from "react";
import Link from "next/link";

const SidebarItem = ({ item, pageName, setPageName }) => {
  const { icon, label, route } = item;
  const isActive = pageName === label;

  return (
    <Link
      href={route}
      onClick={() => setPageName(label)}
      className={`group relative flex w-full flex-col items-center rounded-sm py-1.5 px-2 font-medium duration-300 ease-in-out hover:bg-graydark 
        ${isActive ? "bg-graydark text-secondary" : "text-bodydark1"}`}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <span className="mb-0.5 flex items-center justify-center">
          {React.cloneElement(icon, {
            style: { ...icon.props.style, fontSize: "28px" }
          })}
        </span>
        <span className="text-[10px] text-center w-full leading-tight">{label}</span>
      </div>
    </Link>
  );
};

export default SidebarItem;