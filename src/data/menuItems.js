const menuGroups = [
  {
    name: " ",
    menuItems: [
      {
        icon: (
          <i
            className="fa-duotone fa-solid fa-house"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Início",
        route: "/",
        role: "all",
      },
      {
        icon: (
          <i
            className="fa-solid fa-calendar-plus"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Agendar",
        route: "/agendamento",
        role: "User",
      },
      {
        icon: (
          <i
            className="fa-solid fa-calendar-plus"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Agendamentos",
        route: "/administracao/agendamentos",
        role: "Administrador",
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
        role: "all",
      },
      {
        icon: (
          <i
            className="fa-sharp fa-solid fa-recycle"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Eco Pontos",
        route: "/administracao/ecopontos/",
        role: "Administrador",
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
        role: "User",
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
        role: "all",
      },
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
      },
      {
        icon: (
          <i
            className="fa-solid fa-user-plus"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "Add Admin / Funcionário",
        route: "administracao/cadastro",
        role: "Administrador",
      },
      {
        icon: (
          <i
            className="fa-solid fa-trash-can-plus"
            style={{ fontSize: "32px", color: "#08B75B" }}
          />
        ),
        label: "add tipos de resíduos",
        route: "/administracao/residuos/",
        role: "Administrador",
      },
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
      },
    ],
  },
];
export default menuGroups;