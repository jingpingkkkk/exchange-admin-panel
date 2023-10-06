import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput"; // Import the FormInput component
import FormSelect from "../../../components/Common/FormComponents/FormSelect";
import FormToggleSwitch from "../../../components/Common/FormComponents/FormToggleSwitch"; // Import the FormToggleSwitch component
import { Notify } from "../../../utils/notify";
import { getAllCurrency } from "../../Currency/currencyService";
import { addData, getUserDetails } from "../accountService";

const validationSchemaForCreate = Yup.object({
  username: Yup.string()
    .required("Username is required")
    .test("no-spaces", "Spaces are not allowed in the username", (value) => {
      if (value) {
        return !/\s/.test(value); // Check if there are no spaces in the username
      }
      return true;
    }),
  fullName: Yup.string().required("Full name is required"),
  password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters long"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  mobileNumber: Yup.string()
    .matches(/^\d{10}$/, "Mobile number must be 10 digits")
    .required("Mobile number is required"),
  creditPoints: Yup.number()
    .required("Credit amount is required")
    .test("creditPoints", "Credit amount exceeds available balance", function (value) {
      // Access the user's role and creditPoints
      const user = JSON.parse(localStorage.getItem("user_info"));
      const creditPoints = user?.balance || 0;

      // Check if the user's role is not 'system_owner' and credit amount exceeds creditPoints
      if (user?.role !== "system_owner" && Number(value) > creditPoints) {
        return false; // Validation failed
      }
      return true; // Validation passed
    }),
  exposureLimit: Yup.number(),
  exposurePercentage: Yup.number(),
  stakeLimit: Yup.number(),
  maxProfit: Yup.number(),
  maxLoss: Yup.number(),
  bonus: Yup.number(),
  maxStake: Yup.number(),
  transactionCode: Yup.string().test("transactionCode", "Transaction code is required", function (value) {
    const user = JSON.parse(localStorage.getItem("user_info"));
    if (user?.role !== "system_owner" && value==undefined) {
      return false; // Validation failed
    }
    return true; // Validation passed
  }),
  currencyId: Yup.string().required("Currency is required"),
});

export default function UserForm() {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null); // State to hold the server error message
  const [currencyList, setCurrencyList] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({}); // State to hold the logged in user details

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
    exposureLimit: 0,
    exposurePercentage: 0,
    stakeLimit: 0,
    maxProfit: 0,
    maxLoss: 0,
    bonus: 0,
    maxStake: 0,
    currencyId: "",
    transactionCode: "",
  };

  const submitForm = async (values) => {
    setServerError(null); // Reset server error state
    setLoading(true); // Set loading state to true
    try {
      let response = null;
      const body = {
        ...values,
        exposureLimit: values.exposureLimit || 0,
        exposurePercentage: values.exposurePercentage || 0,
        stakeLimit: values.stakeLimit || 0,
        maxProfit: values.maxProfit || 0,
        maxLoss: values.maxLoss || 0,
        bonus: values.bonus || 0,
        maxStake: values.maxStake || 0,
        currencyId: values.currencyId || null,
        transactionCode: values.transactionCode || "",
        isTransactionCode: true,
      };
      if (loggedInUser.role === "system_owner") {
        delete body.transactionCode;
        delete body.isTransactionCode;
      }
      response = await addData(body);
      if (response.success) {
        Notify.success("User added successfully.");
        navigate("/user-list/");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      // Handle error
      // Notify.error(error.message);
      setServerError(error.message);
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  const formik = useFormik({
    initialValues: initialUserValue,
    validationSchema: validationSchemaForCreate,
    onSubmit: submitForm,
  });

  const formTitle = "CREATE USER";

  useEffect(() => {
    const fetchCurrencyList = async () => {
      const { records = [] } = await getAllCurrency(0);
      setCurrencyList(records.sort((a, b) => a.name.localeCompare(b.name)));
    };
    const fetchUserData = async () => {
      const user = await getUserDetails({ role: 1 });
      setLoggedInUser(user);
    };
    Promise.all([fetchCurrencyList(), fetchUserData()]);
  }, []);

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
                  label="Username"
                  name="username"
                  type="text"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && formik.errors.username}
                  isRequired="true"
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
                  label="Password"
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && formik.errors.password}
                  isRequired="true"
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
                  isRequired="true"
                  width={3}
                />

                <FormInput
                  label="Credit Amount"
                  name="creditPoints"
                  type="text"
                  value={formik.values.creditPoints}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.creditPoints && formik.errors.creditPoints}
                  isRequired="true"
                  width={3}
                />

                <FormSelect
                  label="Currency"
                  name="currencyId"
                  value={formik.values.currencyId}
                  onChange={(event) => formik.setFieldValue("currencyId", event.target.value)}
                  onBlur={formik.handleBlur}
                  error={formik.touched.currencyId && formik.errors.currencyId}
                  isRequired="true"
                  width={3}
                >
                  <option value="">Select Currency</option>
                  {currencyList.map((currency, index) => (
                    <option key={currency._id} value={currency._id}>
                      {currency.name.toUpperCase()}
                    </option>
                  ))}
                </FormSelect>

                <input type="hidden" name="role" value={formik.values.role} />

                <hr className="my-5" />

                <h4 className="mb-4">User Setting </h4>

                <Row className="mt-2">
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

                  <CCol md="2">
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
                </Row>

                <Row className="mt-3">
                  <FormInput
                    label="Exposure Limit"
                    name="exposureLimit"
                    type="number"
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
                    type="number"
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
                    type="number"
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
                    type="number"
                    value={formik.values.maxStake}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.maxStake && formik.errors.maxStake}
                    isRequired="false"
                    width={2}
                  />
                </Row>

                <Row className="mt-3">
                  <FormInput
                    label="Max Profit"
                    name="maxProfit"
                    type="number"
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
                    type="number"
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
                    type="number"
                    value={formik.values.bonus}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.bonus && formik.errors.bonus}
                    isRequired="false"
                    width={2}
                  />
                </Row>

                {loggedInUser.role !== "system_owner" ? (
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
                ) : null}

                <Row>
                  <CCol className="pt-5">
                    <div className="d-grid gap-2 d-md-block">
                      <CButton color="primary" type="submit" className="me-3">
                        {loading ? <CSpinner size="sm" /> : "Save"}
                      </CButton>

                      <Link to={`${process.env.PUBLIC_URL}/user-list`} className="btn btn-danger btn-icon text-white ">
                        Cancel
                      </Link>
                    </div>
                  </CCol>
                </Row>
              </CForm>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
