import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tab, Tabs } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../../components/Common/FormComponents/FormInput"; // Import the FormInput component
import FormToggleSwitch from "../../../components/Common/FormComponents/FormToggleSwitch"; // Import the FormToggleSwitch component
import { Notify } from "../../../utils/notify";
import { getDetailByID, updateData } from "../accountService";

import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import * as Yup from "yup";

export default function UserEditForm() {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null); // State to hold the server error message
  const [activeTab, setActiveTab] = useState("tab5");
  const { id } = useParams();

  const profileValidationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .test("no-spaces", "Spaces are not allowed in the username", (value) => {
        if (value) {
          return !/\s/.test(value);
        }
        return true;
      }),
    fullName: Yup.string().required("Full name is required"),
    mobileNumber: Yup.string()
      .required("Mobile number is required")
      .matches(/^\d{10}$/, "Mobile number must be 10 digits"),
    city: Yup.string(),
    transactionCode: Yup.string().required("Transaction code is required"),
  });

  const passwordValidationSchema = Yup.object({
    password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters long"),
    confirmPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
    transactionCode: Yup.string().required("Transaction code is required"),
  });

  const userLockValidationSchema = Yup.object({
    // Define validation schema for User Lock tab (if needed)
    transactionCode: Yup.string().required("Transaction code is required"),
  });

  const userSettingValidationSchema = Yup.object({
    // Define validation schema for User Setting tab (if needed)

    exposureLimit: Yup.number().when("role", (role, schema) => {
      if (Array.isArray(role) && role.includes("user")) {
        return schema.required("Exposure Limit is required");
      }
      return schema;
    }),
    exposurePercentage: Yup.number()
      .required("Exposure Percentage is required")
      .max(100, "Exposure Percentage cannot exceed 100"),
    stakeLimit: Yup.number().when("role", (role, schema) => {
      if (Array.isArray(role) && role.includes("user")) {
        return schema.required("Stake Limit is required");
      }
      return schema;
    }),
    maxProfit: Yup.number().when("role", (role, schema) => {
      if (Array.isArray(role) && role.includes("user")) {
        return schema.required("Max Profit Limit is required");
      }
      return schema;
    }),
    maxLoss: Yup.number().when("role", (role, schema) => {
      if (Array.isArray(role) && role.includes("user")) {
        return schema.required("Max Loss Limit is required");
      }
      return schema;
    }),
    bonus: Yup.number().when("role", (role, schema) => {
      if (Array.isArray(role) && role.includes("user")) {
        return schema.required("Bonus Limit is required");
      }
      return schema;
    }),
    maxStake: Yup.number().when("role", (role, schema) => {
      if (Array.isArray(role) && role.includes("user")) {
        return schema.required("Max Stake Limit is required");
      }
      return schema;
    }),
    transactionCode: Yup.string().required("Transaction code is required"),
  });

  const initialUserValue = {
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    city: "",
    mobileNumber: "",
    creditPoints: "",
    role: "user",
    isBetLock: false,
    isActive: false,
    forcePasswordChange: true,
    exposureLimit: "",
    exposurePercentage: "",
    stakeLimit: "",
    maxProfit: "",
    maxLoss: "",
    bonus: "",
    maxStake: "",
    transactionCode: "",
  };

  const submitForm = async (values) => {
    setServerError(null); // Reset server error state
    setLoading(true); // Set loading state to true
    try {
      let response = null;
      if (!values.password) {
        delete values.password;
      }
      response = await updateData({
        _id: id,
        ...values,
        isTransactionCode: true,
      });
      if (response.success) {
        Notify.success("User updated successfully.");
        navigate("/user-list/");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      // Handle error
      Notify.error(error.message);
      setServerError(error.message);
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  const [validationSchema, setValidationSchema] = useState(profileValidationSchema);
  const formik = useFormik({
    initialValues: initialUserValue,
    validationSchema: validationSchema,
    onSubmit: submitForm,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const result = await getDetailByID(id);

        formik.setValues((prevValues) => ({
          ...prevValues,
          username: result.username || "",
          fullName: result.fullName || "",
          password: "",
          city: result.city || "",
          mobileNumber: result.mobileNumber || "",
          creditPoints: result.creditPoints || "",
          role: result.role || "",
          isBetLock: result.isBetLock || false,
          isActive: result.isActive || false,
          forcePasswordChange: result.forcePasswordChange || false,
          exposureLimit: result.exposureLimit || 0,
          exposurePercentage: result.exposurePercentage || 0,
          stakeLimit: result.stakeLimit || 0,
          maxProfit: result.maxProfit || 0,
          maxLoss: result.maxLoss || 0,
          bonus: result.bonus || 0,
          maxStake: result.maxStake || 0,
        }));
      }
    };
    fetchData();
  }, [id, getDetailByID]);

  const formTitle = id ? "UPDATE USER" : "CREATE USER";

  // Handle tab selection and set validation schema accordingly
  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === "tab5") {
      setValidationSchema(profileValidationSchema);
    } else if (tabKey === "tab6") {
      setValidationSchema(passwordValidationSchema);
    } else if (tabKey === "tab7") {
      setValidationSchema(userLockValidationSchema);
    } else if (tabKey === "tab8") {
      setValidationSchema(userSettingValidationSchema);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"> {formTitle}</h1>
        </div>
      </div>

      <Row>
        <Col md={12} lg={12}>
          <Card>
            {/* <Card.Header>
              <h3 className="card-title">User Information</h3>
            </Card.Header> */}
            <Card.Body className="p-6">
              <div className="panel panel-primary">
                <div className="tab-menu-heading border">
                  <div className="tabs-menu ">
                    <Tabs
                      className=" nav panel-tabs"
                      variant="pills"
                      //defaultActiveKey="tab5"
                      activeKey={activeTab}
                      onSelect={handleTabSelect}
                    >
                      <Tab eventKey="tab5" className="me-1 " title="Edit profile">
                        <hr />
                        <Card>
                          {/* <Card.Header>
                            <h3 className="card-title">General Information</h3>
                          </Card.Header> */}
                          <Card.Body>
                            <CForm
                              className="row g-3 needs-validation"
                              noValidate
                              validated={validated}
                              onSubmit={formik.handleSubmit}
                            >
                              {serverError && <p className="text-danger">{serverError}</p>}
                              <FormInput
                                disabled={true}
                                label="Username"
                                name="username"
                                type="text"
                                value={formik.values.username}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.username && formik.errors.username}
                                isRequired="false"
                                width={3}
                              />

                              <FormInput
                                label="Full Name"
                                name="fullName"
                                type="text"
                                value={formik.values.fullName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.fullName && formik.errors.fullName}
                                isRequired="true"
                                width={3}
                              />

                              <FormInput
                                label="City"
                                name="city"
                                type="text"
                                value={formik.values.city}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.city && formik.errors.city}
                                isRequired="false"
                                width={3}
                              />

                              <FormInput
                                label="Mobile Number"
                                name="mobileNumber"
                                type="text"
                                value={formik.values.mobileNumber}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.mobileNumber && formik.errors.mobileNumber}
                                isRequired="true"
                                width={3}
                              />

                              <FormInput
                                label="Transaction Code"
                                name="transactionCode"
                                type="password"
                                value={formik.values.transactionCode}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.transactionCode && formik.errors.transactionCode}
                                isRequired="true"
                                width={3}
                              />

                              <CCol xs={12} className="pt-3">
                                <div className="d-grid gap-2 d-md-block">
                                  <CButton
                                    color="primary"
                                    type="submit"
                                    className="me-3"
                                    disabled={!formik.isValid || loading}
                                  >
                                    {loading ? <CSpinner size="sm" /> : "Save"}
                                  </CButton>
                                  <Link
                                    to={`${process.env.PUBLIC_URL}/user-list`}
                                    className="btn btn-danger btn-icon text-white "
                                  >
                                    Cancel
                                  </Link>
                                </div>
                              </CCol>
                            </CForm>
                          </Card.Body>
                        </Card>
                      </Tab>
                      &nbsp;
                      <Tab eventKey="tab6" className="  me-1" title="Change Password">
                        <hr />
                        <Card>
                          {/* <Card.Header>
                            <h3 className="card-title">General Information</h3>
                          </Card.Header> */}
                          <Card.Body>
                            <CForm
                              className="row g-3 needs-validation"
                              noValidate
                              validated={validated}
                              onSubmit={formik.handleSubmit}
                            >
                              {serverError && <p className="text-danger">{serverError}</p>}
                              <FormInput
                                label="Password"
                                name="password"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.password && formik.errors.password}
                                isRequired="false"
                                width={3}
                              />

                              <FormInput
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                isRequired="false"
                                width={3}
                              />

                              <Row className="pt-3">
                                <FormInput
                                  label="Transaction Code"
                                  name="transactionCode"
                                  type="password"
                                  value={formik.values.transactionCode}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={formik.touched.transactionCode && formik.errors.transactionCode}
                                  isRequired="true"
                                  width={3}
                                />
                              </Row>

                              <CCol xs={12} className="pt-3">
                                <div className="d-grid gap-2 d-md-block">
                                  <CButton
                                    color="primary"
                                    type="submit"
                                    className="me-3"
                                    disabled={!formik.isValid || loading}
                                  >
                                    {loading ? <CSpinner size="sm" /> : "Save"}
                                  </CButton>
                                  <Link
                                    to={`${process.env.PUBLIC_URL}/user-list`}
                                    className="btn btn-danger btn-icon text-white "
                                  >
                                    Cancel
                                  </Link>
                                </div>
                              </CCol>
                            </CForm>
                          </Card.Body>
                        </Card>
                      </Tab>
                      &nbsp;
                      <Tab eventKey="tab7" className="me-1" title="User Lock">
                        <hr />
                        <Card>
                          <Card.Body>
                            <CForm
                              className="row g-3 needs-validation"
                              noValidate
                              validated={validated}
                              onSubmit={formik.handleSubmit}
                            >
                              {serverError && <p className="text-danger">{serverError}</p>}
                              <CCol md="1">
                                <CFormLabel htmlFor="isBetLock">Bet Lock</CFormLabel>
                                <FormToggleSwitch
                                  id="isBetLock"
                                  name="isBetLock"
                                  checked={formik.values.isBetLock}
                                  onChange={() => {
                                    formik.setFieldValue("isBetLock", !formik.values.isBetLock);
                                  }}
                                />
                              </CCol>

                              <CCol md="1">
                                <CFormLabel htmlFor="isActive">User Lock</CFormLabel>
                                <FormToggleSwitch
                                  id="isActive"
                                  name="isActive"
                                  checked={formik.values.isActive}
                                  onChange={() => {
                                    formik.setFieldValue("isActive", !formik.values.isActive);
                                  }}
                                />
                              </CCol>

                              <Row className="pt-3">
                                <FormInput
                                  label="Transaction Code"
                                  name="transactionCode"
                                  type="password"
                                  value={formik.values.transactionCode}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={formik.touched.transactionCode && formik.errors.transactionCode}
                                  isRequired="true"
                                  width={3}
                                />
                              </Row>

                              <CCol xs={12} className="pt-3">
                                <div className="d-grid gap-2 d-md-block">
                                  <CButton
                                    color="primary"
                                    type="submit"
                                    className="me-3"
                                    disabled={!formik.isValid || loading}
                                  >
                                    {loading ? <CSpinner size="sm" /> : "Save"}
                                  </CButton>
                                  <Link
                                    to={`${process.env.PUBLIC_URL}/user-list`}
                                    className="btn btn-danger btn-icon text-white "
                                  >
                                    Cancel
                                  </Link>
                                </div>
                              </CCol>
                            </CForm>
                          </Card.Body>
                        </Card>
                      </Tab>
                      &nbsp;
                      <Tab eventKey="tab8" title="User Setting">
                        <hr />
                        <Card>
                          <Card.Body>
                            <CForm
                              className="row g-3 needs-validation"
                              noValidate
                              validated={validated}
                              onSubmit={formik.handleSubmit}
                            >
                              {serverError && <p className="text-danger">{serverError}</p>}
                              <CCol md="12">
                                <CFormLabel htmlFor="forcePasswordChange">Force Password change</CFormLabel>
                                <FormToggleSwitch
                                  id="forcePasswordChange"
                                  name="forcePasswordChange"
                                  checked={formik.values.forcePasswordChange}
                                  onChange={() => {
                                    formik.setFieldValue("forcePasswordChange", !formik.values.forcePasswordChange);
                                  }}
                                />
                              </CCol>

                              <FormInput
                                label="Exposure Limit"
                                name="exposureLimit"
                                type="text"
                                value={formik.values.exposureLimit}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.exposureLimit && formik.errors.exposureLimit}
                                isRequired="false"
                                width={2}
                              />

                              <FormInput
                                label="Exposure Percentage"
                                name="exposurePercentage"
                                type="text"
                                value={formik.values.exposurePercentage}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.exposurePercentage && formik.errors.exposurePercentage}
                                isRequired="false"
                                width={2}
                              />

                              <FormInput
                                label="Stake Limit"
                                name="stakeLimit"
                                type="text"
                                value={formik.values.stakeLimit}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.stakeLimit && formik.errors.stakeLimit}
                                isRequired="false"
                                width={2}
                              />

                              <FormInput
                                label="Max Stake"
                                name="maxStake"
                                type="text"
                                value={formik.values.maxStake}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.maxStake && formik.errors.maxStake}
                                isRequired="false"
                                width={2}
                              />

                              <Row className="mt-3">
                                <FormInput
                                  label="Max Profit"
                                  name="maxProfit"
                                  type="text"
                                  value={formik.values.maxProfit}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={formik.touched.maxProfit && formik.errors.maxProfit}
                                  isRequired="false"
                                  width={2}
                                />

                                <FormInput
                                  label="Max Loss"
                                  name="maxLoss"
                                  type="text"
                                  value={formik.values.maxLoss}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={formik.touched.maxLoss && formik.errors.maxLoss}
                                  isRequired="false"
                                  width={2}
                                />

                                <FormInput
                                  label="Bonus"
                                  name="bonus"
                                  type="text"
                                  value={formik.values.bonus}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={formik.touched.bonus && formik.errors.bonus}
                                  isRequired="false"
                                  width={2}
                                />
                              </Row>

                              <FormInput
                                label="Transaction Code"
                                name="transactionCode"
                                type="password"
                                value={formik.values.transactionCode}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.transactionCode && formik.errors.transactionCode}
                                isRequired="true"
                                width={3}
                              />

                              <CCol xs={12} className="pt-3">
                                <div className="d-grid gap-2 d-md-block">
                                  <CButton
                                    color="primary"
                                    type="submit"
                                    className="me-3"
                                    disabled={!formik.isValid || loading}
                                  >
                                    {loading ? <CSpinner size="sm" /> : "Save"}
                                  </CButton>
                                  <Link
                                    to={`${process.env.PUBLIC_URL}/user-list`}
                                    className="btn btn-danger btn-icon text-white "
                                  >
                                    Cancel
                                  </Link>
                                </div>
                              </CCol>
                            </CForm>
                          </Card.Body>
                        </Card>
                      </Tab>
                    </Tabs>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
