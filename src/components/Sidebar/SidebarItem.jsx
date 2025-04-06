import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import '@/app/styles/globals.css';

const SidebarItem = ({ item, pageName, setPageName }) => {
  const handleClick = () => {
    const updatedPageName =
      pageName !== item.label.toLowerCase() ? item.label.toLowerCase() : "";
    return setPageName(updatedPageName);
  };

  const pathname = usePathname();

  const isActive = (item) => {
    if (item.route === pathname) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child));
    }
    return false;
  };

  const isItemActive = isActive(item);

  return (
    <>
      <li>
        <div>
        <Link
          href={item.route}
          onClick={handleClick}
          className={`${isItemActive ? " green"  : ""} group relative flex-col items-center  rounded-sm  font-medium green  `}
          style={{
           color: "green",
           textDecoration: "none" ,
          }}
        ><div>
          {item.icon}
          </div>
          <div className="flex row items-center py-2 no-underline ">
          {item.label}
         
          </div>
        </Link>
        </div>  
      </li>

    </>
  );
};

export default SidebarItem;
