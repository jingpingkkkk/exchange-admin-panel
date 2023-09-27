import React, { useContext, useEffect, useState } from "react";
import { Container, Dropdown, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/AuthContext";
import { userSocket } from "../../lib/socket";

export function Header() {
  //full screen
  // function Fullscreen() {
  //   if (
  //     (document.fullScreenElement && document.fullScreenElement === null) ||
  //     (!document.mozFullScreen && !document.webkitIsFullScreen)
  //   ) {
  //     if (document.documentElement.requestFullScreen) {
  //       document.documentElement.requestFullScreen();
  //     } else if (document.documentElement.mozRequestFullScreen) {
  //       document.documentElement.mozRequestFullScreen();
  //     } else if (document.documentElement.webkitRequestFullScreen) {
  //       document.documentElement.webkitRequestFullScreen(
  //         Element.ALLOW_KEYBOARD_INPUT
  //       );
  //     }
  //   } else {
  //     if (document.cancelFullScreen) {
  //       document.cancelFullScreen();
  //     } else if (document.mozCancelFullScreen) {
  //       document.mozCancelFullScreen();
  //     } else if (document.webkitCancelFullScreen) {
  //       document.webkitCancelFullScreen();
  //     }
  //   }
  // }
  //dark-mode
  const Darkmode = () => {
    document.querySelector(".app").classList.toggle("dark-mode");
  };
  //leftsidemenu
  const openCloseSidebar = () => {
    document.querySelector(".app").classList.toggle("sidenav-toggled");
  };

  // responsivesearch
  const responsivesearch = () => {
    document.querySelector(".header-search").classList.toggle("show");
  };
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const user = JSON.parse(localStorage.getItem("user_info"));
  const [userBalance, setUserBalance] = useState("");

  const signout = (e) => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    userSocket.on("disconnect", (data) => {
      console.log("disconnected");
    });

    userSocket.on("connect_error", (err) => {
      console.log(err.message);
    });

    userSocket.on("server_error", (message) => {
      console.log(message);
    });

    userSocket.on(`user:${user._id}`, (data) => {
      //console.log("innn 1");
      //console.log(data.balance);
      setUserBalance(data.balance);
    });

    return () => {
      userSocket.off("disconnect");
      userSocket.off("connect_error");
      userSocket.off("server_error");
      userSocket.off(`user:${user._id}`);
    };
  }, []);

  useEffect(() => {
    userSocket.auth = { token: localStorage.getItem("jws_token") };
    userSocket.connect();
    return () => {
      userSocket.disconnect();
    };
  }, []);

  // useEffect(() => {
  //   const rehydrateUser = async () => {
  //     if (!user) {
  //       signout();
  //     }
  //     const result = await postData("users/rehydrateUser", { _id: user._id });
  //     if (result.success) {
  //       localStorage.setItem("user_info", JSON.stringify(result.data.details));
  //       if (result.data.details.scKey) {
  //         localStorage.setItem(process.env.REACT_APP_PERMISSIONS_UPLS_KEY, JSON.stringify(result.data.details.scKey));
  //       } else {
  //         signout();
  //       }
  //     }
  //   };

  //   const interval = setInterval(() => {
  //     rehydrateUser();
  //   }, 60 * 1000 * 1); // 1 minute

  //   rehydrateUser();
  //   return () => clearInterval(interval);
  // });

  return (
    <Navbar expand="md" className="app-header header sticky">
      <Container fluid className="main-container">
        <div className="d-flex align-items-center">
          <Link
            aria-label="Hide Sidebar"
            className="app-sidebar__toggle"
            to="#"
            onClick={() => openCloseSidebar()}
          ></Link>
          <div className="responsive-logo">
            <Link to={`${process.env.PUBLIC_URL}/dashboard/`} className="header-logo">
              <div className="d-block" style={{ width: "175px" }}>
                <img
                  src={require("../../assets/images/brand/logo.png")}
                  className="mobile-logo logo-1"
                  alt="logo"
                  width="120px"
                  height="auto"
                  style={{ objectFit: "contain" }}
                />
                <img
                  src={require("../../assets/images/brand/logo.png")}
                  className="mobile-logo dark-logo-1"
                  alt="logo"
                  width="120px"
                  height="auto"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Link>
          </div>
          <Link className="logo-horizontal " to={`${process.env.PUBLIC_URL}/dashboard/`}>
            <div className="d-block" style={{ width: "175px" }}>
              <img
                src={require("../../assets/images/brand/logo.png")}
                className="header-brand-img desktop-logo"
                alt="logo"
                style={{ objectFit: "contain" }}
              />
              <img
                src={require("../../assets/images/brand/logo.png")}
                className="header-brand-img light-logo1"
                alt="logo"
                style={{ objectFit: "contain" }}
              />
            </div>
          </Link>

          <div className="d-flex order-lg-2 ms-auto header-right-icons">
            <Navbar.Toggle
              aria-controls="navbarScroll"
              className="navresponsive-toggler d-lg-none ms-auto"
              type="button"
            >
              <span className="navbar-toggler-icon fe fe-more-vertical text-dark"></span>
            </Navbar.Toggle>

            <div className="navbar navbar-collapse responsive-navbar p-0">
              <Navbar.Collapse className="navbar-collapse" id="navbarSupportedContent-4">
                <div className="d-flex order-lg-2">
                  <div className="dropdown d-block d-lg-none">
                    <Link to="#" className="nav-link icon" onClick={() => responsivesearch()}>
                      <i className="fe fe-search"></i>
                    </Link>
                    <div className="dropdown-menu header-search dropdown-menu-start">
                      <div className="input-group w-100 p-2 border">
                        <input type="text" className="form-control" placeholder="Search...." />
                        <div className="input-group-text btn btn-primary">
                          <i className="fa fa-search" aria-hidden="true"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className="dropdown d-md-flex">
                    <Link
                      to="#"
                      className="nav-link icon theme-layout nav-link-bg layout-setting"
                      onClick={() => Darkmode()}
                    >
                      <span className="dark-layout">
                        <i className={`fe ${"fe-moon"}`}></i>
                      </span>
                      <span className="light-layout">
                        <i className={`fe ${"fe-sun"}`}></i>
                      </span>
                    </Link>
                  </div> */}
                  {user.role !== "system_owner" && (
                    <div className="dropdown d-md-flex mx-4">
                      <div className="theme-layout nav-link-bg layout-setting pt-1">
                        <span className="dark-layout fw-semibold">PTS: {userBalance}</span>
                        <span className="light-layout fw-semibold text-light">PTS: {userBalance}</span>
                      </div>
                    </div>
                  )}

                  <Dropdown className=" d-md-flex profile-1">
                    <Dropdown.Toggle className="nav-link profile leading-none d-flex px-1 pt-2" variant="">
                      <span className="dark-layout h6 mb-0">
                        {user.username} <i className=" fe fe-chevron-down"></i>
                      </span>
                      <span className="light-layout text-light h6 mb-0">
                        {user.username} <i className=" fe fe-chevron-down"></i>
                      </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu-end dropdown-menu-arrow" style={{ margin: 0 }}>
                      <div className="drop-heading">
                        <div className="text-center">
                          <h5 className="text-dark mb-0">{user.username}</h5>
                          <small className="text-muted">{user.role}</small>
                        </div>
                      </div>
                      <div className="dropdown-divider m-0"></div>
                      {/* <Dropdown.Item href={`${process.env.PUBLIC_URL}/pages/profile/`}>
                        <i className="dropdown-icon fe fe-user"></i> Profile
                      </Dropdown.Item>

                      <Dropdown.Item href={`${process.env.PUBLIC_URL}/pages/mailCompose/`}>
                        <i className="dropdown-icon fe fe-settings"></i>
                        Settings
                      </Dropdown.Item> */}
                      {/* <Dropdown.Item
                        href={`${process.env.PUBLIC_URL}/pages/faqs/`}
                      >
                        <i className="dropdown-icon fe fe-alert-triangle"></i>
                        Need help?p??
                      </Dropdown.Item> */}
                      <Dropdown.Item onClick={() => signout()}>
                        <i className="dropdown-icon fe fe-alert-circle"></i>
                        Sign out
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Navbar.Collapse>
            </div>
            {/* <div
              className="demo-icon nav-link icon border-0"
              onClick={() => swichermainright()}
            >
              <i className="fe fe-settings fa-spin"></i>
            </div> */}
          </div>
        </div>
      </Container>
    </Navbar>
  );
}

export default Header;
