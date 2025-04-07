'use client';
import Link from "next/link";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import clsx from "clsx";
import LogoClickable from "../Icons/logoClick/page";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-999 flex w-full meta-3 drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-2 sm:py-4 shadow-2 md:px-6 2xl:px-11">
      <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
        {/* <!-- Hamburger Toggle BTN --> */}
        <button
  id="hamburger-toggle"
  aria-controls="sidebar"
  onClick={(e) => {
    e.stopPropagation();
    setSidebarOpen((prev) => !prev);
  }}
  className="z-[99999] block rounded-sm p-1.5 lg:hidden"
>
  <span className="relative block h-5.5 w-5.5 cursor-pointer">
    {/* Hambúrguer (3 linhas horizontais) */}
    <span className="du-block absolute right-0 h-full w-full">
      <span
        className={clsx(
          "relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-background delay-[0] duration-200 ease-in-out dark:bg-white",
          !sidebarOpen && "!w-full delay-300"
        )}
      />
      <span
        className={clsx(
          "relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-background delay-150 duration-200 ease-in-out dark:bg-white",
          !sidebarOpen && "!w-full delay-400"
        )}
      />
      <span
        className={clsx(
          "relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-background delay-200 duration-200 ease-in-out dark:bg-white",
          !sidebarOpen && "!w-full delay-500"
        )}
      />
    </span>

    {/* Ícone X (quando sidebar aberta) */}
    <span className="absolute right-0 h-full w-full rotate-45">
      <span
        className={clsx(
          "absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-background delay-300 duration-200 ease-in-out dark:bg-white",
          !sidebarOpen && "!h-0 !delay-[0]"
        )}
      />
      <span
        className={clsx(
          "absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-background duration-200 ease-in-out dark:bg-white delay-400",
          !sidebarOpen && "!h-0 !delay-200"
        )}
      />
    </span>
  </span>
</button>

          {/* <!-- Hamburger Toggle BTN --> */}

          <Link className="block flex-shrink-0 lg:hidden" href="/">
          </Link>
          <LogoClickable color="#ffffff" width={60} height={60}/>
        </div>

        <div className="hidden sm:block">
        <LogoClickable color="#ffffff" width={64} height={64}/>
        </div>
        <div className="logoClick">
         
        </div>
        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Menu de Notificações --> */}
            <DropdownNotification />
            {/* <!-- Menu de Notificações --> */}
          </ul>

          {/* <!-- Área do Usuário --> */}
          <DropdownUser />
          {/* <!-- Área do Usuário --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
