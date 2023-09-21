import React, { Fragment, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import "./index.scss";
import { permission } from "./lib/user-permissions";
import { handshake } from "./utils/encryption";

//const Switcherlayout = React.lazy(() => import("./components/switcherlayout"));
//App
const App = React.lazy(() => import("./components/app"));

//Dashboard
const Dashboard = React.lazy(() => import("./Pages/Dashboard/Dashboard/Dashboard"));

//Sport module
const SportList = React.lazy(() => import("./Pages/Sport/SportList/SportList"));
const SportForm = React.lazy(() => import("./Pages/Sport/SportForm/SportForm"));
const BetCategoryListBySport = React.lazy(() => import("./Pages/Sport/BetCategoryList/BetCategoryList"));
const BetCategorySettingForm = React.lazy(() => import("./Pages/Sport/BetCategorySettingForm/BetCategorySettingForm"));

// Currency Module
const CurrencyList = React.lazy(() => import("./Pages/Currency/CurrencyList/CurrencyList"));
const CurrencyForm = React.lazy(() => import("./Pages/Currency/CurrencyForm/CurrencyForm"));

// Competition Module
const CompetitionList = React.lazy(() => import("./Pages/Competition/CompetitionList/CompetitionList"));
const CompetitionForm = React.lazy(() => import("./Pages/Competition/CompetitionForm/CompetitionForm"));

// Casino Module
const CasinoList = React.lazy(() => import("./Pages/Casino/CasinoList/CasinoList"));
const CasinoForm = React.lazy(() => import("./Pages/Casino/CasinoForm/CasinoForm"));

// Casino Module
const CasinoGameList = React.lazy(() => import("./Pages/CasinoGame/CasinoGameList/CasinoGameList"));
const CasinoGameForm = React.lazy(() => import("./Pages/CasinoGame/CasinoGameForm/CasinoGameForm"));

// Event Module
const EventList = React.lazy(() => import("./Pages/Event/EventList/EventList"));
const EventForm = React.lazy(() => import("./Pages/Event/EventForm/EventForm"));
const ApiEventForm = React.lazy(() => import("./Pages/Event/ApiEventForm/ApiEventForm"));

// Event Bet
const EventBetDetail = React.lazy(() => import("./Pages/EventBet/EventBetDetail"));

// Theme User
const ThemeUserList = React.lazy(() => import("./Pages/ThemeUser/ThemeUserList/ThemeUserList"));
const ThemeUserForm = React.lazy(() => import("./Pages/ThemeUser/ThemeUserForm/ThemeUserForm"));

// Transaction Panel User
const TransactionPanelUserList = React.lazy(() =>
  import("./Pages/TransactionPanelUser/TransactionPanelUserList/TransactionPanelUserList")
);
const TransactionPanelUserForm = React.lazy(() =>
  import("./Pages/TransactionPanelUser/TransactionPanelUserForm/TransactionPanelUserForm")
);

// All User Accounts
const AccountList = React.lazy(() => import("./Pages/Account/AccountList/AccountList"));
const SuperAdminForm = React.lazy(() => import("./Pages/Account/SuperAdminForm/SuperAdminForm"));
const AdminForm = React.lazy(() => import("./Pages/Account/AdminForm/AdminForm"));
const SuperMasterForm = React.lazy(() => import("./Pages/Account/SuperMasterForm/SuperMasterForm"));
const MasterForm = React.lazy(() => import("./Pages/Account/MasterForm/MasterForm"));
const AgentForm = React.lazy(() => import("./Pages/Account/AgentForm/AgentForm"));
const UserForm = React.lazy(() => import("./Pages/Account/UserForm/UserForm"));
const UserList = React.lazy(() => import("./Pages/Account/UserList/UserList"));
const UserEditForm = React.lazy(() => import("./Pages/Account/UserEditForm/UserEditForm"));
const MultiLogin = React.lazy(() => import("./Pages/Account/MultiLogin/"));

// Bank
const Bank = React.lazy(() => import("./Pages/Bank/Bank/Bank"));

// Report
const AccountStatement = React.lazy(() => import("./Pages/Report/AccountStatement/AccountStatement"));
const UserHistory = React.lazy(() => import("./Pages/Report/UserHistory/UserHistory"));

//custom Pages
const Login = React.lazy(() => import("./Pages/Login/Login"));
const ResetPassword = React.lazy(() => import("./Pages/ResetPassword/ResetPassword"));

//Errorpages
const Errorpage400 = React.lazy(() => import("./components/ErrorPages/ErrorPages/400/400"));
const Errorpage401 = React.lazy(() => import("./components/ErrorPages/ErrorPages/401/401"));
const Errorpage403 = React.lazy(() => import("./components/ErrorPages/ErrorPages/403/403"));
const Errorpage500 = React.lazy(() => import("./components/ErrorPages/ErrorPages/500/500"));
const Errorpage503 = React.lazy(() => import("./components/ErrorPages/ErrorPages/503/503"));

const ProtectedRoutes = React.lazy(() => import("./components/ProtectedRoutes"));
const PublicRoutes = React.lazy(() => import("./components/PublicRoutes"));

const Loaderimg = () => {
  return (
    <div id="global-loader">
      <img src={require("./assets/images/loader.svg").default} className="loader-img" alt="Loader" />
    </div>
  );
};

const Root = () => {
  useEffect(() => {
    //Switcherdata.localStorageBackUp();
    //Switcherdata.HorizontalHoverMenu();
    const interval = setInterval(async () => await handshake(), 1000 * 60 * 5);
    handshake();
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Fragment>
      <BrowserRouter>
        <React.Suspense fallback={Loaderimg()}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<ProtectedRoutes allowedRoles={true} />}>
                <Route path={`${process.env.PUBLIC_URL}/`} element={<App />}>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={true} />}>
                    <Route path={`${process.env.PUBLIC_URL}/dashboard`} element={<Dashboard />} />
                  </Route>
                  {/* Currency */}
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.CURRENCIES.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/currency-form`} element={<CurrencyForm />} />{" "}
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.CURRENCIES.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/currency-list`} element={<CurrencyList />} />
                  </Route>
                  {/* Sports route  */}
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.SPORTS.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/sport-form`} element={<SportForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.SPORTS.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/sport-list`} element={<SportList />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.SPORTS.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/bet-category-list`} element={<BetCategoryListBySport />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.SPORTS.ACTIVE} />}>
                    <Route
                      path={`${process.env.PUBLIC_URL}/bet-category-setting`}
                      element={<BetCategorySettingForm />}
                    />
                  </Route>
                  {/* Competition route  */}
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.COMPETITIONS.ACTIVE} />}>
                    {" "}
                    <Route path={`${process.env.PUBLIC_URL}/competition-form`} element={<CompetitionForm />} />{" "}
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.COMPETITIONS.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/competition-list`} element={<CompetitionList />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.COMPETITIONS.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/competition-event-list`} element={<EventList />} />
                  </Route>
                  {/* Casino route  */}
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.CASINO.ACTIVE} />}>
                    {" "}
                    <Route path={`${process.env.PUBLIC_URL}/casino-form`} element={<CasinoForm />} />{" "}
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.CASINO.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/casino-list`} element={<CasinoList />} />
                  </Route>
                  {/* Casino game route  */}
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.CASINO_GAME.ACTIVE} />}>
                    {" "}
                    <Route path={`${process.env.PUBLIC_URL}/casino-game-form`} element={<CasinoGameForm />} />{" "}
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.CASINO_GAME.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/casino-game-list`} element={<CasinoGameList />} />
                  </Route>
                  {/* Event route  */}
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.EVENTS.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/event-form`} element={<EventForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.EVENTS.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/event-list`} element={<EventList />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.EVENTS.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/api-event-list`} element={<ApiEventForm />} />
                  </Route>
                  {/* Event Bet  */}
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.EVENT_BET.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/event-bet-detail`} element={<EventBetDetail />} />
                  </Route>
                  {/* Theme User route  */}
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.THEME_USER_MODULE.CREATE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/theme-user-form`} element={<ThemeUserForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.THEME_USER_MODULE.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/theme-user-list`} element={<ThemeUserList />} />
                  </Route>
                  {/* Transaction Panel User route  */}
                  <Route
                    path="/"
                    element={<ProtectedRoutes allowedRoles={permission.TRANSACTION_PANEL_USER_MODULE.CREATE} />}
                  >
                    <Route
                      path={`${process.env.PUBLIC_URL}/transaction-panel-user-form`}
                      element={<TransactionPanelUserForm />}
                    />
                  </Route>
                  <Route
                    path="/"
                    element={<ProtectedRoutes allowedRoles={permission.TRANSACTION_PANEL_USER_MODULE.ACTIVE} />}
                  >
                    <Route
                      path={`${process.env.PUBLIC_URL}/transaction-panel-user-list`}
                      element={<TransactionPanelUserList />}
                    />
                  </Route>
                  {/* Accounts route  */}
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.ACCOUNT_MODULE.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/account-list`} element={<AccountList />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.ACCOUNT_MODULE.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/account-list/:id`} element={<AccountList />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.ACCOUNT_MODULE.CREATE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/super-admin-form`} element={<SuperAdminForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.ACCOUNT_MODULE.CREATE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/admin-form`} element={<AdminForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.ACCOUNT_MODULE.CREATE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/super-master-form`} element={<SuperMasterForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.ACCOUNT_MODULE.CREATE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/master-form`} element={<MasterForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.ACCOUNT_MODULE.CREATE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/agent-form`} element={<AgentForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.USER_MODULE.CREATE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/user-form`} element={<UserForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.USER_MODULE.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/user-list`} element={<UserList />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.USER_MODULE.UPDATE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/user-edit/:id`} element={<UserEditForm />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.MULTI_LOGIN.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/multi-login`} element={<MultiLogin />} />
                  </Route>
                  <Route
                    path="/"
                    element={<ProtectedRoutes allowedRoles={permission.REPORT_MODULE.ACCOUNT_STATEMENT} />}
                  >
                    <Route path={`${process.env.PUBLIC_URL}/account-statement`} element={<AccountStatement />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.REPORT_MODULE.USER_HISTORY} />}>
                    <Route path={`${process.env.PUBLIC_URL}/user-history`} element={<UserHistory />} />
                  </Route>
                  <Route path="/" element={<ProtectedRoutes allowedRoles={permission.BANK_MODULE.ACTIVE} />}>
                    <Route path={`${process.env.PUBLIC_URL}/bank`} element={<Bank />} />
                  </Route>
                </Route>
              </Route>

              <Route path="/" element={<PublicRoutes />}>
                <Route path={`${process.env.PUBLIC_URL}/login`} element={<Login />} />
                <Route path={`${process.env.PUBLIC_URL}/reset-password`} element={<ResetPassword />} />
                <Route path={`${process.env.PUBLIC_URL}/errorpage401`} element={<Errorpage401 />} />
                <Route path={`${process.env.PUBLIC_URL}/errorpage403`} element={<Errorpage403 />} />
                <Route path={`${process.env.PUBLIC_URL}/errorpage500`} element={<Errorpage500 />} />
                <Route path={`${process.env.PUBLIC_URL}/errorpage503`} element={<Errorpage503 />} />
              </Route>

              <Route path="*" element={<Errorpage400 />} />
            </Routes>
          </AuthProvider>
        </React.Suspense>
      </BrowserRouter>
    </Fragment>
  );
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
