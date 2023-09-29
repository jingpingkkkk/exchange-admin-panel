import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput"; // Import the FormInput component
import FormMultiSelect from "../../../components/Common/FormComponents/FormMultiSelect";
import FormSelect from "../../../components/Common/FormComponents/FormSelect"; // Import the FormSelect component
import FormToggleSwitch from "../../../components/Common/FormComponents/FormToggleSwitch"; // Import the FormToggleSwitch component
import { Notify } from "../../../utils/notify";
import { getAllCurrency } from "../../Currency/currencyService";
import { getAllSport } from "../../Sport/sportService";
import { addData, getDetailByID, updateData } from "../accountService";

const settlementDurationOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

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
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  currencyId: Yup.string().required("Currency is required"),
  mobileNumber: Yup.string()
    .matches(/^\d{10}$/, "Mobile number must be 10 digits")
    .required("Mobile number is required"),
  creditPoints: Yup.string()
    .required("Credit amount is required")
    .test("is-number", "Credit amount must be a valid number", function (value) {
      return !isNaN(value);
    }),
  rate: Yup.number()
    .required("Rate is required")
    .min(0, "Rate cannot be lower than 0")
    .max(100, "Rate cannot exceed 100"),
  domainUrl: Yup.string().url("Invalid URL format").required("Domain URL is required"),
  contactEmail: Yup.string().email("Invalid email format").required("Contact email is required"),
  availableSports: Yup.array()
    .min(1, "At least one option must be selected")
    .required("At least one option must be selected"),
  settlementDurationType: Yup.string().oneOf(["daily", "weekly", "monthly"], "Invalid option selected").nullable(true),
  settlementDate: Yup.number().nullable(true),
  settlementDay: Yup.string().oneOf(days, "Invalid option selected").nullable(true),
  settlementTime: Yup.string().nullable(true),
  // transactionCode: Yup.string().required("Transaction code is required"),
});

const validationSchemaForUpdate = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  password: Yup.string().nullable(true).min(6, "Password must be at least 6 characters long"),
  confirmPassword: Yup.string()
    .nullable(true)
    .test("passwords-match", "Passwords must match", function (value) {
      return this.parent.password === value;
    }),
  mobileNumber: Yup.string()
    .required("Mobile number is required")
    .matches(/^\d{10}$/, "Mobile number must be 10 digits"),
  creditPoints: Yup.string()
    .required("Credit amount is required")
    .test("is-number", "Credit amount must be a valid number", function (value) {
      return !isNaN(value);
    }),
  rate: Yup.number()
    .required("Rate is required")
    .min(0, "Rate cannot be lower than 0")
    .max(100, "Rate cannot exceed 100"),
  domainUrl: Yup.string().url("Invalid URL format"),
  contactEmail: Yup.string().email("Invalid email format"),
  availableSports: Yup.array()
    .min(1, "At least one option must be selected")
    .required("At least one option must be selected"),
  settlementDurationType: Yup.string().oneOf(["daily", "weekly", "monthly"], "Invalid option selected").nullable(true),
  settlementDate: Yup.number().nullable(true),
  settlementDay: Yup.string().oneOf(days, "Invalid option selected").nullable(true),
  settlementTime: Yup.string().nullable(true),
  // transactionCode: Yup.string().required("Transaction code is required"),
});

export default function SuperAdminForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state ? location.state.id : null;
  const editMode = !!id;

  const [loading, setLoading] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);
  const [moduleList, setmoduleList] = useState([]);
  const [serverError, setServerError] = useState(null);

  const user = {
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    city: "",
    mobileNumber: "",
    creditPoints: "",
    currencyId: "",
    role: "super_admin",
    rate: "",
    domainUrl: "",
    contactEmail: "",
    isBetLock: false,
    isActive: false,
    forcePasswordChange: true,
    availableSports: [],
    settlementDurationType: "",
    settlementDate: "",
    settlementDay: "",
    settlementTime: "",
    isCasinoAvailable: false,
    isAutoSettlement: false,
    // transactionCode: "",
  };

  const submitForm = async (values) => {
    setServerError(null);
    setLoading(true);

    try {
      let response = null;

      if (editMode) {
        response = await updateData({
          _id: id,
          ...values,
          isTransactionCode: true,
        });
      } else {
        response = await addData({
          ...values,
          isTransactionCode: true,
        });
      }

      if (response.success) {
        Notify.success(editMode ? "Super admin updated successfully" : "Super admin added successfully");
        navigate("/account-list/");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: user,
    validationSchema: editMode ? validationSchemaForUpdate : validationSchemaForCreate,
    onSubmit: submitForm,
  });

  useEffect(() => {
    const fetchData = async () => {
      // !!! IMPORTANT NOTE: The order of the promises in the array must match the order of the results in the results array
      setLoading(true);
      Promise.all([getDetailByID(id), getAllCurrency(0), getAllSport(0)])
        .then((results) => {
          const [fetchtedUser, fetchedCurrencies, fetchedModules] = results;

          if (fetchtedUser !== null) {
            const result = fetchtedUser;
            formik.setValues((prevValues) => ({
              ...prevValues,
              username: result.username || "",
              fullName: result.fullName || "",
              city: result.city || "",
              mobileNumber: result.mobileNumber || "",
              creditPoints: result.creditPoints || "",
              rate: result.rate || "",
              currencyId: result.currencyId || "",
              role: result.role || "",
              domainUrl: result.domainUrl || "",
              contactEmail: result.contactEmail || "",
              isBetLock: result.isBetLock || false,
              isActive: result.isActive || false,
              forcePasswordChange: result.forcePasswordChange || false,
              availableSports: result.availableSports || [],
              settlementDurationType: result.settlementDurationType || "",
              settlementDate: result.settlementDate || "",
              settlementDay: result.settlementDay || "",
              settlementTime: result.settlementTime || "",
              isCasinoAvailable: result.isCasinoAvailable || false,
              isAutoSettlement: result.isAutoSettlement || false,
            }));
          }

          setCurrencyList(fetchedCurrencies.records);

          setmoduleList(
            fetchedModules.records.map((option) => ({
              value: option._id,
              label: option.name,
            }))
          );
        })
        .finally(() => setLoading(false));
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formTitle = id ? "UPDATE SUPER ADMIN" : "CREATE SUPER ADMIN";

  const handleDurationChange = (event) => {
    formik.setFieldValue("settlementDurationType", event.target.value);
    formik.setFieldValue("settlementDate", "");
    formik.setFieldValue("settlementDay", "");
  };

  return (
    <div>
      <div className="page-header mb-3">
        <h1 className="page-title">{formTitle}</h1>
      </div>

      <Card>
        {/* <Card.Header>
          <h3 className="card-title">General Information</h3>
        </Card.Header> */}

        <Card.Body>
          {loading ? (
            <div className="w-100 d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
              <CSpinner />
            </div>
          ) : (
            <CForm className="row g-3 needs-validation" onSubmit={formik.handleSubmit}>
              {serverError ? <p className="text-red">{serverError}</p> : null}

              <FormInput
                disabled={editMode}
                label="Username"
                name="username"
                type="text"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && formik.errors.username}
                isRequired={editMode ? "false" : "true"}
                width={3}
                autoComplete={false}
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
                autoComplete={false}
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
                autoComplete={false}
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
                autoComplete={false}
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
                disabled={editMode}
              >
                <option value="">Select Currency</option>
                {currencyList.map((currency, index) => (
                  <option key={currency._id} value={currency._id}>
                    {currency.name.toUpperCase()}
                  </option>
                ))}
              </FormSelect>

              <input type="hidden" name="role" value={formik.values.role} />

              <FormInput
                label="Partnership (%)"
                name="rate"
                type="text"
                value={formik.values.rate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.rate && formik.errors.rate}
                isRequired="true"
                width={3}
              />

              <div className="mt-4 mb-1">
                <hr />
              </div>

              <Card.Title className="mb-3">
                <h4 className="mb-0 font-weight-bold">Settings</h4>
              </Card.Title>

              <div className="px-0">
                <FormMultiSelect
                  label="Available Sports"
                  name="availableSports"
                  value={formik.values.availableSports}
                  onChange={formik.setFieldValue}
                  onBlur={formik.handleBlur}
                  options={moduleList}
                  error={formik.touched.availableSports && formik.errors.availableSports}
                  isRequired="true"
                  width={12}
                />
              </div>

              <FormInput
                label="Domain URL"
                name="domainUrl"
                type="text"
                value={formik.values.domainUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.domainUrl && formik.errors.domainUrl}
                isRequired="true"
                width={3}
              />

              <FormInput
                label="Contact Email"
                name="contactEmail"
                type="text"
                value={formik.values.contactEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contactEmail && formik.errors.contactEmail}
                isRequired="true"
                width={3}
              />

              <CCol md="6" className="ps-md-5 pt-2 pt-md-0 d-flex align-items-start flex-wrap">
                <div className="pe-6">
                  <CFormLabel htmlFor="isBetLock">Bet Lock</CFormLabel>
                  <FormToggleSwitch
                    id="isBetLock"
                    name="isBetLock"
                    checked={formik.values.isBetLock}
                    onChange={() => formik.setFieldValue("isBetLock", !formik.values.isBetLock)}
                  />
                </div>

                <div className="pe-6">
                  <CFormLabel htmlFor="isActive">User Lock</CFormLabel>
                  <FormToggleSwitch
                    id="isActive"
                    name="isActive"
                    checked={!formik.values.isActive}
                    onChange={() => formik.setFieldValue("isActive", !formik.values.isActive)}
                  />
                </div>

                <div className="pe-6">
                  <CFormLabel htmlFor="forcePasswordChange">Force Password change</CFormLabel>
                  <FormToggleSwitch
                    id="forcePasswordChange"
                    name="forcePasswordChange"
                    checked={formik.values.forcePasswordChange}
                    onChange={() =>
                      formik.setFieldValue("forcePasswordChange", editMode ? !formik.values.forcePasswordChange : true)
                    }
                  />
                </div>

                <div className="pe-6">
                  <CFormLabel htmlFor="isCasinoAvailable">Casino Available</CFormLabel>
                  <FormToggleSwitch
                    id="isCasinoAvailable"
                    name="isCasinoAvailable"
                    checked={formik.values.isCasinoAvailable}
                    onChange={() => formik.setFieldValue("isCasinoAvailable", !formik.values.isCasinoAvailable)}
                  />
                </div>

                <div>
                  <CFormLabel htmlFor="isAutoSettlement">Auto Settlement</CFormLabel>
                  <FormToggleSwitch
                    id="isAutoSettlement"
                    name="isAutoSettlement"
                    checked={formik.values.isAutoSettlement}
                    onChange={() => formik.setFieldValue("isAutoSettlement", !formik.values.isAutoSettlement)}
                  />
                </div>
              </CCol>

              <FormSelect
                label="Settlement Duration"
                name="settlementDurationType"
                value={formik.values.settlementDurationType}
                onChange={(event) => handleDurationChange(event)}
                error={formik.touched.settlementDurationType && formik.errors.settlementDurationType}
                isRequired="false"
                width={3}
              >
                <option value="">Select duration</option>
                {settlementDurationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Settlement Date"
                name="settlementDate"
                value={formik.values.settlementDate}
                onChange={(event) => formik.setFieldValue("settlementDate", event.target.value)}
                error={formik.touched.settlementDate && formik.errors.settlementDate}
                width={3}
                disabled={!formik.values.settlementDurationType || formik.values.settlementDurationType !== "monthly"}
              >
                <option value="">Select date</option>
                {Array.from({ length: 31 }, (_, v) => ++v).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Settlement Day"
                name="settlementDay"
                value={formik.values.settlementDay}
                onChange={(event) => formik.setFieldValue("settlementDay", event.target.value)}
                error={formik.touched.settlementDay && formik.errors.settlementDay}
                width={3}
                disabled={!formik.values.settlementDurationType || formik.values.settlementDurationType !== "weekly"}
              >
                <option value="">Select day</option>
                {days.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </FormSelect>

              <FormInput
                label="Settlement Time"
                name="settlementTime"
                type="time"
                value={formik.values.settlementTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.settlementTime && formik.errors.settlementTime}
                isRequired="false"
                width={3}
              />

              {/* <FormInput
              label="Transaction Code"
              name="transactionCode"
              type="password"
              value={formik.values.transactionCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.transactionCode && formik.errors.transactionCode}
              isRequired="true"
              width={3}
            /> */}

              <CCol xs={12} className="pt-3">
                <div className="d-grid gap-2 d-md-block">
                  <CButton color="primary" type="submit" className="me-md-3">
                    {loading ? <CSpinner size="sm" /> : editMode ? "Update" : "Create"}
                  </CButton>

                  <Link to={`${process.env.PUBLIC_URL}/account-list`} className="btn btn-danger btn-icon text-white ">
                    Cancel
                  </Link>
                </div>
              </CCol>
            </CForm>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
