'use client';
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ClickOutside from "@/components/ClickOutside";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from '@mui/material/styles';


// const userFetch = async (id, token) => {
//   const user = await fetch(`/api/user/${id}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   const userData = await user.json();
  
//   return userData;
// }
 


const DropdownUser = () => {
   const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const theme = useTheme();
  
  // const [dados, setDados] = useState(null);
  const role = user?.role;

  const Name = user?.displayName;
  const urlPhoto = user?.photoURL;
  let rota = "" ;
  let page = "/perfil";
  let url = "";

  switch (role) {
    case "Administrador":
      rota = "/administracao";
      break;
    case "responsavel":
      rota = "/parceiro";
      break;
    case "User":
      rota = "/cliente";
      break;
    default:
      rota = "#";
}

  if (rota !== "#") {
     url = rota.concat(page);
  } else {
    url = "#";
  }

  // useEffect(() => {
  //   if (user) {
  //     const userFetching = async () => {
  //       const token = await user.getIdToken();
  //       console.log("token", token);

  //       const userData = await userFetch(user.uid, token);
  //       setDados(userData);
  //     };
  //     userFetching();
  //   }
  // }, [user]);

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4 rounded-lg hover:bg-green-950/60 dark:hover:bg-green-950/70 transition-colors p-2"
        href="#"
      >
        <span className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          <img
            src={user?.photoURL || "/images/user/user-01.png"}
            alt="User"
            className="h-full w-full object-cover"
          />
        </span>

        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-white">
            {user?.displayName || 'Usuário'}
          </span>
          <span className="block text-xs text-gray-300">
            {user?.role || 'Usuário'}
          </span>
        </span>

        <svg
          className="fill-current text-white"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.293 3.293L6 7.586L1.707 3.293C1.316 2.902 0.684 2.902 0.293 3.293C-0.098 3.684 -0.098 4.316 0.293 4.707L5.293 9.707C5.684 10.098 6.316 10.098 6.707 9.707L11.707 4.707C12.098 4.316 12.098 3.684 11.707 3.293C11.316 2.902 10.684 2.902 10.293 3.293Z"
            fill="currentColor"
          />
        </svg>
      </Link>

      {/* <!-- Dropdown Start --> */}
      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-lg border shadow-lg ${
            theme.palette.mode === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          <ul className="flex flex-col gap-2 px-4 py-3">
            <li>
              <Link
                href= {url}
                className={`flex items-center gap-3.5 px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                  theme.palette.mode === 'dark' 
                    ? 'text-gray-200 hover:bg-gray-700 hover:text-primary-400' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                <svg
                  className="fill-current"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 9.62499C8.42188 9.62499 6.35938 7.59687 6.35938 5.12187C6.35938 2.64687 8.42188 0.618744 11 0.618744C13.5781 0.618744 15.6406 2.64687 15.6406 5.12187C15.6406 7.59687 13.5781 9.62499 11 9.62499ZM11 2.16562C9.28125 2.16562 7.90625 3.50624 7.90625 5.12187C7.90625 6.73749 9.28125 8.07812 11 8.07812C12.7188 8.07812 14.0938 6.73749 14.0938 5.12187C14.0938 3.50624 12.7188 2.16562 11 2.16562Z"
                    fill={theme.palette.mode === 'dark' ? '#fff' : '#374151'}
                  />
                  <path
                    d="M17.7719 21.4156H4.2281C3.5406 21.4156 2.9906 20.8656 2.9906 20.1781V17.0844C2.9906 13.7156 5.7406 10.9656 9.10935 10.9656H12.925C16.2937 10.9656 19.0437 13.7156 19.0437 17.0844V20.1781C19.0094 20.8312 18.4594 21.4156 17.7719 21.4156ZM4.53748 19.8687H17.4969V17.0844C17.4969 14.575 15.4344 12.5125 12.925 12.5125H9.07498C6.5656 12.5125 4.5031 14.575 4.5031 17.0844V19.8687H4.53748Z"
                    fill={theme.palette.mode === 'dark' ? '#fff' : '#374151'}
                  />
                </svg>
                Meu Perfil
              </Link>
            </li>
           
          </ul>
          <div className={`px-4 py-2 border-t ${theme.palette.mode === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={logout}
              className={`flex items-center gap-3.5 w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                theme.palette.mode === 'dark' 
                  ? 'text-gray-200 hover:bg-gray-700 hover:text-red-400' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
              }`}
            >
              <svg
                className="fill-current"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                  fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.5375 0.618744H11.6531C10.7594 0.618744 10.0031 1.37499 10.0031 2.26874V4.64062C10.0031 5.53437 10.7594 6.29062 11.6531 6.29062H15.5375C16.4313 6.29062 17.1875 5.53437 17.1875 4.64062V2.26874C17.1875 1.37499 16.4313 0.618744 15.5375 0.618744Z"
                  fill={theme.palette.mode === 'dark' ? '#fff' : '#374151'}
                />
                <path
                  d="M15.5375 8.09375H11.6531C10.7594 8.09375 10.0031 8.85 10.0031 9.74375V12.1156C10.0031 13.0094 10.7594 13.7656 11.6531 13.7656H15.5375C16.4313 13.7656 17.1875 13.0094 17.1875 12.1156V9.74375C17.1875 8.85 16.4313 8.09375 15.5375 8.09375Z"
                  fill={theme.palette.mode === 'dark' ? '#fff' : '#374151'}
                />
                <path
                  d="M15.5375 15.5687H11.6531C10.7594 15.5687 10.0031 16.325 10.0031 17.2187V19.5906C10.0031 20.4844 10.7594 21.2406 11.6531 21.2406H15.5375C16.4313 21.2406 17.1875 20.4844 17.1875 19.5906V17.2187C17.1875 16.325 16.4313 15.5687 15.5375 15.5687Z"
                  fill={theme.palette.mode === 'dark' ? '#fff' : '#374151'}
                />
                <path
                  d="M4.3125 0.618744H0.428125C0.190625 0.618744 0 0.809369 0 1.04687V4.64062C0 4.87812 0.190625 5.06874 0.428125 5.06874H4.3125C4.55 5.06874 4.74063 4.87812 4.74063 4.64062V1.04687C4.74063 0.809369 4.55 0.618744 4.3125 0.618744Z"
                  fill={theme.palette.mode === 'dark' ? '#fff' : '#374151'}
                />
                <path
                  d="M4.3125 8.09375H0.428125C0.190625 8.09375 0 8.28437 0 8.52187V12.1156C0 12.3531 0.190625 12.5437 0.428125 12.5437H4.3125C4.55 12.5437 4.74063 12.3531 4.74063 12.1156V8.52187C4.74063 8.28437 4.55 8.09375 4.3125 8.09375Z"
                  fill={theme.palette.mode === 'dark' ? '#fff' : '#374151'}
                />
                <path
                  d="M4.3125 15.5687H0.428125C0.190625 15.5687 0 15.7594 0 15.9969V19.5906C0 19.8281 0.190625 20.0187 0.428125 20.0187H4.3125C4.55 20.0187 4.74063 19.8281 4.74063 19.5906V15.9969C4.74063 15.7594 4.55 15.5687 4.3125 15.5687Z"
                  fill={theme.palette.mode === 'dark' ? '#fff' : '#374151'}
                />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}
      {/* <!-- Dropdown End --> */}
    </ClickOutside>
  );
};

export default DropdownUser;
