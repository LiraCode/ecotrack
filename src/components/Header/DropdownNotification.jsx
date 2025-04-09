'use client';
import { useState } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
// import { useAuthContext } from "@/libs/context/AuthContext";

const DropdownNotification = () => {
  // const { userAuth } = useAuthContext();
  // const uid = userAuth?.uid;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const userFetch = async (id, token) => {
    const user = await fetch(`/api/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const userData = await user.json();
    return userData;
  };

  const notificationFetch = async (id, token) => {
    const notificationsResponse = await fetch(`/api/notifications/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return notificationsResponse;
  };

  // useEffect(() => {
  //   const fetchNotificationsAndUser = async () => {
  //     if (!uid) {
  //       setLoading(false);
  //       return;
  //     }
  //     try {
  //       const token = await userAuth?.getIdToken();
  //       const notificationsResponse = await notificationFetch(uid, token);
  //       const notificationsData = await notificationsResponse.json();
  //       const userData = await userFetch(uid, token);

  //       if (notificationsData.message === "No unread notifications") {
  //         setNotifying(false);
  //         setNotifications([
  //           { _id: "0", title: "Sem Novas Notificações", content: "", createdAt: new Date().toISOString() }
  //         ]);
  //         return;
  //       } else {
  //         setNotifications(notificationsData);
  //       }
  //       setReadNotifications(userData.readded || []);

  //       const hasUnreadNotifications = notificationsData.some(
  //         (notification) => !userData.readded.includes(notification._id)
  //       );
  //       setNotifying(hasUnreadNotifications);
  //     } catch (error) {
  //       console.error("Erro ao buscar notificações e dados do usuário:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchNotificationsAndUser();
  // }, [uid, userAuth]);

  // const convertDate = (date) => {
  //   const options = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
  //   return new Date(date).toLocaleDateString("pt-BR", options);
  // };

  // const markAsRead = async () => {
  //   try {
  //     if (uid) {
  //       await fetch(`/api/notifications/readded/${uid}`, { method: "POST" });
  //       setNotifying(false);
  //     }
  //   } catch (error) {
  //     console.error("Erro ao marcar notificações como lidas:", error);
  //   }
  // };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        <Link
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            if (!loading) {
              if (notifying) {
                markAsRead();
              }
            }
          }}
          href="#"
          className={`relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white ${
            loading ? "cursor-wait" : ""
          }`}
        >
          <span
            className={`absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1 ${
              notifying === false ? "hidden" : "inline"
            }`}
          >
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
          </span>

          <svg
            className="fill-current duration-300 ease-in-out"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343Z"
              fill=""
            />
          </svg>
        </Link>
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
