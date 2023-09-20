import React, { Fragment, useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import { Link, NavLink } from "react-router-dom";
import { activeSessionKeys } from "../../lib/user-permissions";
import menuItems from "./menuItems";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState(menuItems[0].path);
  const [mainmenu, setMainMenu] = useState([]);

  useEffect(() => {
    const userPermissions = activeSessionKeys();
    const allowedMenuItems = [];
    for (const item of menuItems) {
      let itemObj = {};
      const children = [];
      if (item?.children?.length) {
        item.children.forEach((child) => {
          if (userPermissions.includes(child.id)) {
            children.push(child);
          }
        });
      }
      if (item?.children?.length && !children.length) {
        continue;
      }
      if (userPermissions.includes(item.id)) {
        itemObj = { ...item, children };
      }
      if (Object.keys(itemObj).length) {
        allowedMenuItems.push(itemObj);
      }
    }
    setMainMenu(allowedMenuItems);
  }, []);

  return (
    <div className="sticky">
      <div className="app-sidebar__overlay" />

      <aside className="app-sidebar">
        <Scrollbars>
          <div className="header side-header">
            <Link to={`${process.env.PUBLIC_URL}/dashboard/`} className="header-brand1">
              <img
                src={require("../../assets/images/brand/logo.png")}
                className="header-brand-img desktop-logo"
                alt="logo"
              />
              <img
                src={require("../../assets/images/brand/logo-1.png")}
                className="header-brand-img toggle-logo"
                alt="logo-1"
              />
              <img
                src={require("../../assets/images/brand/logo-2.png")}
                className="header-brand-img light-logo"
                alt="logo-2"
              />
              <img
                src={require("../../assets/images/brand/logo.png")}
                className="header-brand-img light-logo1"
                alt="logo-3"
              />
            </Link>
          </div>

          <div className="main-sidemenu">
            <div className="slide-left disabled" id="slide-left">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24" height="24" viewBox="0 0 24 24">
                <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" />
              </svg>
            </div>
            <div className="slide-leftRTL disabled" id="slide-leftRTL">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24" height="24" viewBox="0 0 24 24">
                <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" />
              </svg>
            </div>

            <ul className="side-menu" id="sidebar-main">
              {mainmenu.map((item) => (
                <Fragment key={item.id || Math.round(Math.random() * 1e10)}>
                  <li className="sub-category">
                    <h3>{item.title}</h3>
                  </li>

                  <li className={`slide ${activeItem === item.path ? "is-expanded" : ""}`}>
                    {item.children?.length ? (
                      <NavLink
                        to={item.path + "/"}
                        className={`side-menu__item ${activeItem === item.path ? "active" : ""}`}
                        onClick={(event) => {
                          event.preventDefault();
                          setActiveItem((prev) => (prev === item.path ? null : item.path));
                        }}
                      >
                        <i className={`side-menu__icon fe fe-${item.icon}`}></i>
                        <span className="side-menu__label">{item.title}</span>
                        {item.badge ? <label className={`${item.badge} side-badge`}>{item.badgetxt}</label> : null}
                        <i className={`${item.background} fa angle fa-angle-right `}></i>
                      </NavLink>
                    ) : (
                      <NavLink
                        to={item.path + "/"}
                        className={`side-menu__item ${activeItem === item.path ? "active" : ""}`}
                        onClick={() => {
                          setActiveItem(item.path);
                        }}
                      >
                        <i className={`side-menu__icon fe fe-${item.icon}`}></i>
                        <span className="side-menu__label">{item.title}</span>
                        {item.badge ? <label className={`${item.badge} side-badge`}>{item.badgetxt}</label> : ""}
                      </NavLink>
                    )}

                    {item.children?.length ? (
                      <ul
                        className="slide-menu"
                        style={
                          activeItem === item.path
                            ? {
                                opacity: 1,
                                transition: "opacity 500ms ease-in",
                                display: "block",
                              }
                            : { display: "none" }
                        }
                      >
                        {item.children.map((child) => {
                          return (
                            <li key={child.path}>
                              <NavLink
                                to={child.path + "/"}
                                className="slide-item"
                                onClick={() => setActiveItem(item.path)}
                              >
                                <span className="sub-side-menu__label">{child.title}</span>
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                </Fragment>
              ))}
            </ul>

            <div className="slide-right" id="slide-right">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24" height="24" viewBox="0 0 24 24">
                <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z" />
              </svg>
            </div>
            <div className="slide-rightRTL" id="slide-rightRTL">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24" height="24" viewBox="0 0 24 24">
                <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z" />
              </svg>
            </div>
          </div>
        </Scrollbars>
      </aside>
    </div>
  );
};

export default Sidebar;
