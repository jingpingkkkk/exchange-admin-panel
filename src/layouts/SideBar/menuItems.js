import { appModules } from "../../lib/user-permissions";

const activeModules = appModules();

const menuItems = [
  {
    id: activeModules?.DASHBOARD,
    title: "Dashboard",
    path: `${process.env.PUBLIC_URL}/dashboard`,
    icon: "home",
  },
  {
    id: activeModules?.ACCOUNT_MODULE,
    title: "Accounts",
    path: `${process.env.PUBLIC_URL}/account-list`,
    icon: "users",
  },
  {
    id: activeModules?.USER_MODULE,
    title: "Users",
    path: `${process.env.PUBLIC_URL}/user-list`,
    icon: "user",
  },
  {
    id: activeModules?.MULTI_LOGIN,
    title: "Multi Login",
    path: `${process.env.PUBLIC_URL}/multi-login`,
    icon: "user",
  },

  {
    id: activeModules?.CURRENCIES,
    title: "Currencies",
    path: `${process.env.PUBLIC_URL}/currency-list`,
    icon: "dollar-sign",
  },
  {
    id: activeModules?.SPORTS,
    title: "Sports",
    path: `${process.env.PUBLIC_URL}/sport-list`,
    icon: "grid",
  },
  {
    id: activeModules?.COMPETITIONS,
    title: "Competitions",
    path: `${process.env.PUBLIC_URL}/competition-list`,
    icon: "globe",
  },
  {
    id: activeModules?.EVENTS,
    title: "Events",
    path: `${process.env.PUBLIC_URL}/event-list`,
    icon: "layers",
  },
  {
    id: activeModules?.ADD_EVENT,
    title: "Live Events",
    path: `${process.env.PUBLIC_URL}/api-event-list`,
    icon: "layers",
  },
  {
    id: activeModules?.EVENT_BET_MODULE,
    title: "Event Bet",
    path: `${process.env.PUBLIC_URL}/event-bet-detail`,
    icon: "layers",
  },
  {
    id: activeModules?.CASINO,
    title: "Casino",
    path: `${process.env.PUBLIC_URL}/casino-list`,
    icon: "grid",
  },
  {
    id: activeModules?.CASINO_GAME,
    title: "Casino Game",
    path: `${process.env.PUBLIC_URL}/casino-game-list`,
    icon: "grid",
  },

  {
    id: activeModules?.THEME_USER_MODULE,
    title: "Theme Users",
    path: `${process.env.PUBLIC_URL}/theme-user-list`,
    icon: "user",
  },
  {
    id: activeModules?.TRANSACTION_PANEL_USER_MODULE,
    title: "Transaction panel users",
    path: `${process.env.PUBLIC_URL}/transaction-panel-user-list`,
    icon: "users",
  },
  {
    id: activeModules?.BANK_MODULE,
    title: "Bank",
    path: `${process.env.PUBLIC_URL}/bank`,
    icon: "briefcase",
  },
  {
    id: activeModules?.REPORT_MODULE,
    title: "Reports",
    icon: "file-text",
    children: [
      {
        id: activeModules?.REPORT_ACCOUNT_STATEMENT,
        title: "Account statement",
        path: `${process.env.PUBLIC_URL}/account-statement`,
      },
      {
        id: activeModules?.REPORT_USER_HISTORY,
        title: "User history",
        path: `${process.env.PUBLIC_URL}/user-history`,
      },
    ],
  },
];

export default menuItems;
