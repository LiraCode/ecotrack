const menuGroups = [
  {
    name: " ",
    menuItems: [
      // ################################ USUÁRIO NÃO LOGADO ################################

      {
        icon: (
          <i
            className="fa-solid fa-shield-keyhole"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Acesso Cliente",
        route: "/cliente/login",
        role: "not-logged",
        pos: 8,
      },
      {
        icon: (
          <i
            className="fa-solid fa-handshake-simple"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Acesso Parceiros",
        route: "/parceiro/login",
        role: "not-logged",
        pos: 9,
      },

      // ####################################################################################

      // ################################ USUÁRIO  ##########################################
      {
        icon: (
          <i
            className="fa-duotone fa-solid fa-house"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Início",
        route: "/",
        role: ["User", "not-logged"],
        pos: 1,
      },
      {
        icon: (
          <i
            className="fa-solid fa-calendar-plus"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Agendar",
        route: "/cliente/agendamento",
        role: "User",
        pos: 2,
      },
      {
        icon: (
          <i
            className="fa-solid fa-user"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Perfil",
        route: "/cliente/perfil",
        role: ["User"],
        pos: 3,
      },
      {
        icon: (
          <i
            className="fa-solid fa-gamepad-modern"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Games",
        route: "/cliente/metas",
        role: "User",
        pos: 4,
      },

      {
        icon: (
          <i
            className="fa-solid fa-books"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Blog",
        route: "/posts",
        role: ["User", "not-logged"],
        pos: 5,
      },

      // ####################################################################################

      // ################################ RESPONSÁVEL #######################################

      {
        icon: (
          <i
            className="fa-solid fa-gear"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Gerenciamento",
        route: "/parceiro/perfil/",
        role: "Responsável",
        pos: 1,
      },
      {
        icon: (
          <i
            className="fa-solid fa-calendar-plus"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Agendamentos",
        route: "/parceiro/agendamentos",
        role: "Responsável",
        pos: 2,
      },
      {
        icon: (
          <i
            className="fa-sharp fa-solid fa-recycle"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Eco Pontos",
        route: "/locais",
        role: ["User", "not-logged", "Responsável"],
        pos: 3,
      },

      // ####################################################################################

      // ################################ ADMINISTRADOR #####################################
      {
        icon: (
          <i
            className="fa-solid fa-calendar-plus"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Agendamentos",
        route: "/administracao/agendamento",
        role: "Administrador",
        pos: 1,
      },
      {
        icon: (
          <i
            className="fa-solid fa-bell"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Notificações",
        route: "/administracao/notificacoes",
        role: "Administrador",
        pos: 2,
      },
      {
        icon: (
          <i
            className="fa-solid fa-trophy-star"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Metas",
        route: "/administracao/metas",
        role: "Administrador",
        pos: 3,
      },
      {
        icon: (
          <i
            className="fa-solid fa-handshake-simple"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Parceiros",
        route: "/administracao/parceiro",
        role: "Administrador",
        pos: 4,
      },
      {
        icon: (
          <i
            className="fa-sharp fa-solid fa-recycle"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Gerenciar Eco Pontos",
        route: "/administracao/ecopontos/",
        role: "Administrador",
        pos: 5,
      },
      {
        icon: (
          <i
            className="fa-solid fa-trash-can-plus"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Tipos de Resíduos",
        route: "/administracao/residuos/",
        role: "Administrador",
        pos: 6,
      },
      {
        icon: (
          <i
            className="fa-solid fa-user-plus"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Administradores & Funcionários",
        route: "/administracao/funcionario",
        role: "Administrador",
        pos: 7,
      },
      {
        icon: (
          <i
            className="fa-solid fa-user"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Perfil",
        route: "/administracao/perfil",
        role: "Administrador",
        pos: 8,
      },
      {
        icon: (
          <i
            className="fa-solid fa-message-smile"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Gerenciar Postagens",
        route: "/administracao/posts",
        role: "Administrador",
        pos: 9,
      },
      // #######################################################################################
    ],
  },
];
export default menuGroups;