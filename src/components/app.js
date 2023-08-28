import React, { Fragment, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Switcherdata from "../data/Switcher/Switcherdata";
import Footer from "../layouts/Footer/Footer";
import Header from "../layouts/Header/Header";
import RightSidebar from "../layouts/RightSidebar/RightSidebar";
import Sidebar from "../layouts/SideBar/SideBar";
import Switcher from "../layouts/Switcher/Switcher";
import TabToTop from "../layouts/TabToTop/TabToTop";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard");
  }, []);
  return (
    <Fragment>
      <div className="horizontalMenucontainer">
        <TabToTop />
        <div className="page">
          <div className="page-main">
            <Header />
            <Sidebar />
            <div className="main-content app-content ">
              <div className="side-app">
                <div
                  className="main-container container-fluid"
                  onClick={() => {
                    Switcherdata.responsiveSidebarclose();
                    Switcherdata.Horizontalmenudefultclose();
                  }}
                >
                  <ToastContainer />
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
          <RightSidebar />
          <Switcher />
          <Footer />
        </div>
      </div>
    </Fragment>
  );
}
