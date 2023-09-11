import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../../components/Common/FormComponents/FormInput"; // Import the FormInput component
import FormSelect from "../../../components/Common/FormComponents/FormSelect"; // Import the FormSelect component
import { getAllCurrency } from "../../Currency/currencyService";
import { addData, getDetailByID, updateData } from "../accountService";

import { CButton, CCol, CForm } from "@coreui/react";
import * as Yup from "yup";

export default function AccountForm() {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const { creditPoints, role, rate, _id } = JSON.parse(localStorage.getItem("user_info")) || {};
  const { id } = useParams();

  const roleHierarchy = {
    system_owner: ["super_admin", "admin", "super_master", "master", "agent", "user"],
    super_admin: ["admin", "super_master", "master", "agent", "user"],
    admin: ["super_master", "master", "agent", "user"],
    super_master: ["master", "agent", "user"],
    master: ["agent", "user"],
    agent: ["user"],
    user: [],
  };

  const allowedRoles = roleHierarchy[role] || [];

  const formik = useFormik({
    initialValues: {
      username: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      city: "",
      mobileNumber: "",
      creditPoints: "",
      currency: "",
      role: role !== "system_owner" ? "" : "super_admin",
      rate: "",
      exposureLimit: "",
      exposurePercentage: "",
      stakeLimit: "",
      maxProfit: "",
      maxLoss: "",
      bonus: "",
      maxStake: "",
    },
    validationSchema: Yup.object({
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

      currency: Yup.string().required("Currency is required"),
      role: Yup.string().required("User type is required"),
      mobileNumber: Yup.string().matches(/^\d{10}$/, "Mobile number must be 10 digits"),
      creditPoints: Yup.number()
        .required("Credit amount is required")
        .test("creditPoints", "Credit amount exceeds available balance", function (value) {
          // Access the user's role and creditPoints
          const user = JSON.parse(localStorage.getItem("user_info"));
          const creditPoints = user?.creditPoints || 0;

          // Check if the user's role is not 'system_owner' and credit amount exceeds creditPoints
          if (user?.role !== "system_owner" && value > creditPoints) {
            return false; // Validation failed
          }
          return true; // Validation passed
        }),
      rate: Yup.number()
        .required("Rate is required")
        .max(100, "Rate cannot exceed 100")
        .test("rate", "Rate exceeds available rate", function (value) {
          // Access the user's role and rate
          const user = JSON.parse(localStorage.getItem("user_info"));
          const rate = user?.rate || 0;

          // Check if the user's role is not 'system_owner' and credit amount exceeds creditPoints
          if (user?.role !== "system_owner" && value > rate) {
            return false; // Validation failed
          }
          return true; // Validation passed
        }),
      exposureLimit: Yup.number().when("role", (role, schema) => {
        if (Array.isArray(role) && role.includes("user")) {
          return schema.required("Exposure Limit is required");
        }
        return schema;
      }),
      exposurePercentage: Yup.number().when("role", (role, schema) => {
        if (Array.isArray(role) && role.includes("user")) {
          return schema.required("Exposure Percentage Limit is required");
        }
        return schema;
      }),
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
          return schema.required("max Stake Limit is required");
        }
        return schema;
      }),
    }),
    onSubmit: async (values) => {
      // Perform form submission logic
      try {
        if (id !== "" && id !== undefined) {
          await updateData({
            _id: id,
            username: values.username,
            fullName: values.fullName,
            city: values.city,
            mobileNumber: values.mobileNumber,
            creditPoints: values.creditPoints,
            password: values.password,
            confirmPassword: values.confirmPassword,
            currencyId: values.currency,
            role: values.role,
            rate: values.rate,
          });
        } else {
          await addData({
            username: values.username,
            fullName: values.fullName,
            city: values.city,
            mobileNumber: values.mobileNumber,
            creditPoints: values.creditPoints,
            password: values.password,
            confirmPassword: values.confirmPassword,
            currencyId: values.currency,
            role: values.role,
            rate: values.rate,
          });
        }

        navigate("/account-list");
      } catch (error) {
        // Handle error
      }
      console.log("Form submitted successfully:", values);
    },
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
          rate: result.rate || "",
          currency: result.currencyId || "",
          role: result.role || "",
        }));
        setSelectedCurrency(result.currencyId || "");
        setSelectedRole(result.role || "");
      }
      const allCurrency = await getAllCurrency(0);
      setCurrencyList(allCurrency.records);
    };
    fetchData();
  }, [id, getDetailByID]);

  const formTitle = id ? "UPDATE ACCOUNT" : "CREATE ACCOUNT";

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

                {role === "system_owner" && (
                  <FormSelect
                    label="Currency"
                    name="currency"
                    value={formik.values.currency}
                    onChange={(event) => {
                      formik.setFieldValue("currency", event.target.value);
                      setSelectedCurrency(event.target.value);
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.currency && formik.errors.currency}
                    isRequired="true"
                    width={3}
                  >
                    <option value="">Select Currency</option>
                    {currencyList.map((currency, index) => (
                      <option key={currency._id} value={currency._id}>
                        {currency.name}
                      </option>
                    ))}
                  </FormSelect>
                )}

                {role !== "system_owner" ? (
                  <FormSelect
                    label="User Type"
                    name="role"
                    value={formik.values.role}
                    onChange={(event) => {
                      formik.setFieldValue("role", event.target.value);
                      setSelectedRole(event.target.value);
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.role && formik.errors.role}
                    isRequired="true"
                    width={3}
                  >
                    <option value="">Select User Type</option>
                    {allowedRoles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))}
                  </FormSelect>
                ) : (
                  <>
                    <input type="hidden" name="role" value={formik.values.role} />
                  </>
                )}

                <FormInput
                  label="Partnership With No Return"
                  name="rate"
                  type="text"
                  value={formik.values.rate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.rate && formik.errors.rate}
                  isRequired="true"
                  width={3}
                />

                {formik.values.role === "user" && (
                  <Row>
                    <hr className="my-5" />

                    <h4 className="mb-4">User Setting </h4>
                    <FormInput
                      label="Exposure Limit"
                      name="exposureLimit"
                      type="text"
                      value={formik.values.exposureLimit}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.exposureLimit && formik.errors.exposureLimit}
                      isRequired="true"
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
                      isRequired="true"
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
                      isRequired="true"
                      width={2}
                    />

                    <FormInput
                      label="Max Profit"
                      name="maxProfit"
                      type="text"
                      value={formik.values.maxProfit}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.maxProfit && formik.errors.maxProfit}
                      isRequired="true"
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
                      isRequired="true"
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
                      isRequired="true"
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
                      isRequired="true"
                      width={2}
                    />
                  </Row>
                )}

                <CCol xs={12}>
                  <div className="d-grid gap-2 d-md-block">
                    <CButton color="primary" type="submit" className="me-3">
                      Save
                    </CButton>
                    <Link to={`${process.env.PUBLIC_URL}/account-list`} className="btn btn-danger btn-icon text-white ">
                      Cancel
                    </Link>
                  </div>
                </CCol>
              </CForm>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
