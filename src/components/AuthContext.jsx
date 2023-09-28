// AuthContext.js
import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postData as postDataWithAuth } from "../utils/fetch-services";
import { postData } from "../utils/fetch-services-without-token";
import { ipDetails } from "../utils/ip-details";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const BaseURL = process.env.REACT_APP_BASE_URL;

  // const ipAddressDetail = fetch("https://api.ipdata.co")
  //     .then(response => {
  //         return response.json();
  //     }, "jsonp")
  //     .then(res => {
  //         console.log(res.ip)
  //     })
  //     .catch(err => console.log(err))

  // console.log(ipAddressDetail);

  const fetchAppModules = async (token = null) => {
    if (!token) logout();
    const result = await postDataWithAuth("permission/getAppModulesList", {}, token);
    if (result.success) {
      localStorage.setItem(process.env.REACT_APP_PERMISSIONS_AMLS_KEY, JSON.stringify(result.data));
    }
  };

  const fetchUserPermissions = async (userId, token = null) => {
    if (!token) logout();
    const result = await postDataWithAuth("permission/getUserActivePermissions", { userId }, token);
    if (result.success) {
      localStorage.setItem(process.env.REACT_APP_PERMISSIONS_UPLS_KEY, JSON.stringify(result.data));
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    const ipData = await ipDetails();
    const result = await postData("auth/login", {
      username: username,
      password: password,
      ipAddress: ipData.ip,
      city: ipData.city,
      country: ipData.country,
    });
    if (result.success) {
      const jwtToken = result.data.token;

      await Promise.all([fetchAppModules(jwtToken), fetchUserPermissions(result.data.user._id, jwtToken)]);

      if (result.data.user.forcePasswordChange) {
        setLoginError("");
        navigate("/reset-password", {
          state: {
            id: result.data.user._id,
            token: jwtToken,
            isForceChangePassword: true,
          },
        });
      } else {
        localStorage.setItem("user_info", JSON.stringify(result.data.user));
        localStorage.setItem("jws_token", jwtToken);
        setIsAuthenticated(true);
        setLoginError("");
        navigate("/dashboard");
        window.location.reload();
      }
    } else {
      setLoginError(result.message);
    }
    setLoading(false);
  };

  const resetPassword = async (request, token) => {
    setLoading(true);

    const result = await postDataWithAuth("auth/resetPassword", request, token);
    if (result.success) {
      localStorage.setItem("user_info", JSON.stringify(result.data));
      localStorage.setItem("jws_token", token);
      setIsAuthenticated(true);
      setLoginError("");
      navigate("/dashboard", { state: { newUser: true, user: result.data } });
    } else {
      setLoginError(result.message);
    }
    setLoading(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    const drf = localStorage.getItem("dfr_buf");
    const frr = localStorage.getItem("frr_buf");
    localStorage.clear();
    localStorage.setItem("dfr_buf", drf);
    localStorage.setItem("frr_buf", frr);
    window.location.reload();
  };

  const values = {
    loading,
    isAuthenticated,
    login,
    logout,
    loginError,
    resetPassword,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
