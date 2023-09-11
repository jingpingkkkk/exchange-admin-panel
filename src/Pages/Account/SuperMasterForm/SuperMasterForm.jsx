import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput"; // Import the FormInput component
import FormToggleSwitch from "../../../components/Common/FormComponents/FormToggleSwitch"; // Import the FormToggleSwitch component
import { Notify } from "../../../utils/notify";
import { addData, getDetailByID, updateData } from "../accountService";

export default function SuperMasterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  //id get from state
  const id = location.state ? location.state.id : null;
  const editMode = !!id;
  //id get from url
  //const { id } = useParams();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const loginUserDetail = JSON.parse(localStorage.getItem("user_info")) || {};
  const [loginUserData, setLoginUserData] = useState({});
  const [serverError, setServerError] = useState(null); // State to hold the server error message

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
    mobileNumber: Yup.string().matches(/^\d{10}$/, "Mobile number must be 10 digits"),
    creditPoints: Yup.string()
      .required("Credit amount is required")
      .test("is-number", "Credit amount must be a valid number", function (value) {
        return !isNaN(value);
      })
      .test("creditPoints", "Credit amount exceeds available balance " + loginUserData.balance, function (value) {
        const user = loginUserData;
        const creditPoints = user?.balance || 0;
        if (user?.role !== "system_owner" && value > creditPoints) {
          return false; // Validation failed
        }
        return true;
      }),
    rate: Yup.number()
      .required("Rate is required")
      .max(100, "Rate cannot exceed 100")
      .test("rate", "Rate exceeds available rate " + loginUserData.rate, function (value) {
        const user = loginUserData;
        const rate = user?.rate || 0;
        if (user?.role !== "system_owner" && value > rate) {
          return false; // Validation failed
        }
        return true; // Validation passed
      }),
  });

  const validationSchemaForUpdate = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .test("no-spaces", "Spaces are not allowed in the username", (value) => {
        if (value) {
          return !/\s/.test(value); // Check if there are no spaces in the username
        }
        return true;
      }),
    fullName: Yup.string().required("Full name is required"),
    password: Yup.string().nullable(true).min(6, "Password must be at least 6 characters long"),
    confirmPassword: Yup.string()
      .nullable(true)
      .test("passwords-match", "Passwords must match", function (value) {
        return this.parent.password === value;
      }),
    mobileNumber: Yup.string().matches(/^\d{10}$/, "Mobile number must be 10 digits"),
    creditPoints: Yup.string()
      .required("Credit amount is required")
      .test("is-number", "Credit amount must be a valid number", function (value) {
        return !isNaN(value);
      })
      .test("creditPoints", "Credit amount exceeds available balance " + loginUserData.balance, function (value) {
        const user = loginUserData;
        const creditPoints = user?.balance || 0;
        if (user?.role !== "system_owner" && value > creditPoints) {
          return false; // Validation failed
        }
        return true; // Validation passed
      }),
    rate: Yup.number()
      .required("Rate is required")
      .max(100, "Rate cannot exceed 100")
      .test("rate", "Rate exceeds available rate " + loginUserData.rate, function (value) {
        const user = loginUserData;
        const rate = user?.rate || 0;
        if (user?.role !== "system_owner" && value > rate) {
          return false; // Validation failed
        }
        return true; // Validation passed
      }),
  });
  const initialUserValue = {
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    city: "",
    mobileNumber: "",
    creditPoints: "",
    role: "super_master",
    rate: "",
    isBetLock: false,
    isActive: false,
    forcePasswordChange: true,
  };

  const submitForm = async (values) => {
    setServerError(null); // Reset server error state
    setLoading(true); // Set loading state to true
    try {
      let response = null;
      if (editMode) {
        response = await updateData({
          _id: id,
          ...values,
        });
      } else {
        response = await addData({
          ...values,
        });
      }
      if (response.success) {
        Notify.success(editMode ? "Super master updated successfully" : "Super master added successfully");
        navigate("/account-list/");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Notify.error(error.message);
      setServerError(error.message);
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  const formik = useFormik({
    initialValues: initialUserValue,
    validationSchema: editMode ? validationSchemaForUpdate : validationSchemaForCreate,
    onSubmit: submitForm,
  });

  useEffect(() => {
    Promise.all([getDetailByID(id), getDetailByID(loginUserDetail._id)])
      .then(([result, loginUserData]) => {
        if (result) {
          formik.setValues((prevValues) => ({
            ...prevValues,
            username: result.username || "",
            fullName: result.fullName || "",
            password: "",
            city: result.city || "",
            mobileNumber: result.mobileNumber || "",
            creditPoints: result.creditPoints || "",
            rate: result.rate || "",
            role: result.role || "",
            isBetLock: result.isBetLock || false,
            isActive: result.isActive || false,
            forcePasswordChange: result.forcePasswordChange || false,
          }));
        }
        setLoginUserData(loginUserData);
      })
      .catch((e) => {
        console.log(e);
      });

    return () => {
      formik.resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loginUserDetail._id]);

  const formTitle = id ? "UPDATE SUPER MASTER" : "CREATE SUPER MASTER";

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
                  isRequired={editMode ? "false" : "true"}
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
                  isRequired={editMode ? "false" : "true"}
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

                <input type="hidden" name="role" value={formik.values.role} />

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

                <Row>
                  <hr className="my-5" />
                  <h4 className="mb-4">Admin Setting </h4>

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

                <CCol xs={12}>
                  <div className="d-grid gap-2 d-md-block">
                    <CButton color="primary" type="submit" className="me-3">
                      {loading ? <CSpinner size="sm" /> : "Save"}
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
