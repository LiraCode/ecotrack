import React from "react";
import Link from "next/link";

const SidebarItem = ({ item, pageName, setPageName }) => {
  const { icon, label, route } = item;
  const isActive = pageName === label;

  return (
    <Link
      href={route}
      onClick={() => setPageName(label)}
      className={`group relative flex w-full flex-col items-center rounded-sm py-1.5 px-2 font-medium duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700
        ${isActive ? "bg-gray-100 dark:bg-gray-700" : ""}`}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <span className="mb-0.5 flex items-center justify-center text-green-600 dark:text-green-400">
          {React.cloneElement(icon, {
            style: { ...icon.props.style, fontSize: "28px" }
          })}
        </span>
        <span className="text-[10px] text-center w-full leading-tight text-green-600 dark:text-green-400">
          {label}
        </span>
      </div>
    </Link>
  );
};

export default SidebarItem;