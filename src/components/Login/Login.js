import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import { AuthContext } from "../AuthContext";
import {
  CForm,
  CCol,
  CFormLabel,
  CFormFeedback,
  CFormInput,
  CButton,
} from "@coreui/react";

export default function Login() {
  const [validated, setValidated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login, loginError } = useContext(AuthContext);

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity()) {
      // Perform login logic here, e.g., send login request to server
      login(username, password);
      // if (!isAuthenticated) {
      //   //setLoginError('Please check the credentails');
      // }
      // Redirect to dashboard page after successful login

    } else {
      setValidated(true);
    }
  };

  return (
    <div className="login-img">
      <div className="page">

        <div className="">
          <div className="col col-login mx-auto">
            <div className="text-center">
              <img
                src={require("../../assets/images/brand/logo.png")}
                className="header-brand-img"
                alt=""
              />
            </div>
          </div>
          <div className="container-login100">
            <div className="wrap-login100 p-0">
              <Card.Body>
                <CForm
                  className="login100-form validate-form"
                  noValidate
                  validated={validated}
                  onSubmit={handleSubmit}
                  method="post"
                >
                  <span className="login100-form-title">Login</span>

                  <div className="text-center pb-3"> <p className="text-danger mb-0">{loginError}</p></div>

                  <div className="wrap-input100 validate-input">
                    <CFormInput
                      className="input100"
                      type="text"
                      name="username"
                      id="validationCustom01"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <span className="focus-input100"></span>
                    <span className="symbol-input100">
                      <i className="zmdi zmdi-account" aria-hidden="true"></i>
                    </span>
                    <CFormFeedback invalid>Email is required field.</CFormFeedback>
                  </div>

                  <div className="wrap-input100 validate-input">
                    <CFormInput
                      className="input100"
                      type="password"
                      name="password"
                      id="validationCustom02"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                    <span className="focus-input100"></span>
                    <span className="symbol-input100">
                      <i className="zmdi zmdi-lock" aria-hidden="true"></i>
                    </span>
                    <CFormFeedback invalid>Password is required field.</CFormFeedback>
                  </div>

                  <div className="container-login100-form-btn">
                    <CButton color="primary" type="submit" className="login100-form-btn btn-primary">
                      Login
                    </CButton>
                  </div>
                </CForm>
              </Card.Body>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
