import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import "react-data-table-component-extensions/dist/index.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import { Notify } from "../../../utils/notify";
import { createCloneUser, getDetailByID, getUserPermissions, updateData } from "../accountService";
import MultiLoginListing from "./MultiLoginListing";

const multiLoginCreateSchema = Yup.object({
  username: Yup.string()
    .required("Username is required")
    .test("no-spaces", "Spaces are not allowed in the username", (value) => {
      if (value) {
        return !/\s/.test(value);
      }
      return true;
    }),
  fullName: Yup.string().required("Full name is required"),
  password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters long"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  moduleIds: Yup.array(),
  transactionCode: Yup.string().required("Transaction Code is required"),
});

const multiLoginUpdateSchema = Yup.object({
  username: Yup.string()
    .required("Username is required")
    .test("no-spaces", "Spaces are not allowed in the username", (value) => {
      if (value) {
        return !/\s/.test(value);
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
  moduleIds: Yup.array(),
  transactionCode: Yup.string().required("Transaction Code is required"),
});

export default function MultiLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state ? location.state.id : "";
  const reset = location.state ? location.state.reset : "";

  const [loading, setLoading] = useState(false);
  const [defaultPermissionLoading, setDefaultPermissionLoading] = useState(false);

  const [moduleList, setModuleList] = useState([]);
  const [serverError, setServerError] = useState(null);

  const formik = useFormik({
    initialValues: {
      username: "",
      fullName: "",
      password: "",
      confirmPassword: "",
      moduleIds: [],
      transactionCode: "",
    },
    validationSchema: id ? multiLoginUpdateSchema : multiLoginCreateSchema,
    onSubmit: async (values) => {
      setServerError(null);
      setLoading(true);
      try {
        const body = values;
        let response = null;

        if (id) {
          body._id = id;
          response = await updateData({
            ...body,
            isTransactionCode: true,
            isMultiLoginUser: true,
          });
        } else {
          response = await createCloneUser(body);
        }

        if (response.success) {
          formik.resetForm();
          Notify.success("User updated.");
          navigate("/multi-login", {});
          window.location.reload();
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        Notify.error(error.message);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    setDefaultPermissionLoading(true);
    Promise.all([getDetailByID(id), getUserPermissions(id)])
      .then(([user, permissions]) => {
        setDefaultPermissionLoading(false);

        if (user) {
          formik.setValues((prev) => ({
            ...user,
            ...prev,
            username: user.username,
            fullName: user.fullName,
            password: "",
          }));
        }

        setModuleList(permissions);

        if (permissions.length) {
          const moduleIds = [];
          permissions.forEach((permission) => {
            if (permission.isActive) {
              moduleIds.push(permission._id);
            }
            if (permission.subModules?.length) {
              permission.subModules.forEach((subModule) => {
                if (subModule.isActive) {
                  moduleIds.push(subModule._id);
                }
              });
            }
          });
          formik.setFieldValue("moduleIds", moduleIds);
        }
      })
      .catch((e) => {
        console.log(e);
      });

    return () => {
      formik.resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reset]);

  const handleModuleChange = (id, checked) => {
    const currentList = formik.values.moduleIds;
    const existing = currentList.includes(id);
    if (checked && !existing) {
      currentList.push(id);
    } else {
      const index = currentList.indexOf(id);
      if (index > -1) {
        currentList.splice(index, 1);
      }
    }
    formik.setFieldValue("moduleIds", currentList);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{id ? "UPDATE" : "CREATE"} MULTI LOGIN</h1>
        </div>
      </div>

      <Row>
        <Col md={12} lg={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">General Information</h3>
            </Card.Header>

            <Card.Body>
              <CForm className="row g-3 needs-validation" noValidate onSubmit={formik.handleSubmit}>
                {serverError && <p className="text-red">{serverError}</p>}
                <FormInput
                  disabled={!!id}
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

                {defaultPermissionLoading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "150px" }}>
                    <CSpinner />
                  </div>
                ) : (
                  <Row className="mt-5">
                    <CCol xs={12}>
                      <CFormLabel>Privileges</CFormLabel>
                    </CCol>

                    {moduleList.map((module) => (
                      <CCol xs={12} sm={6} md={4} lg={2} key={module.key} className="pb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={module.key}
                            name="moduleIds"
                            checked={formik.values.moduleIds.includes(module._id)}
                            onChange={(e) => handleModuleChange(module._id, e.target.checked)}
                          />
                          <CFormLabel className="form-check-label fw-bold">{module.name}</CFormLabel>

                          {module.subModules?.length ? (
                            <div className="ms-2">
                              {module.subModules.map((subModule) => (
                                <div className="form-check" key={subModule.moduleId}>
                                  <input
                                    disabled={!formik.values.moduleIds.includes(module._id)}
                                    type="checkbox"
                                    className="form-check-input"
                                    id={subModule._id}
                                    name="moduleIds"
                                    checked={formik.values.moduleIds.includes(subModule._id)}
                                    onChange={(e) => handleModuleChange(subModule._id, e.target.checked)}
                                  />
                                  <CFormLabel className="form-check-label fw-normal">{subModule.name}</CFormLabel>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </CCol>
                    ))}
                  </Row>
                )}

                <FormInput
                  className="mt-5"
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

                <CCol xs={12} className="mt-5">
                  <div className="d-grid gap-2 d-md-block">
                    <CButton color="primary" type="submit" className="me-3">
                      {loading ? <CSpinner size="sm" /> : "Save"}
                    </CButton>
                    <Link
                      to={`${process.env.PUBLIC_URL}/multi-login`}
                      state={{ id, reset: Math.random() }}
                      className="btn btn-danger btn-icon text-white"
                    >
                      Reset
                    </Link>
                  </div>
                </CCol>
              </CForm>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <MultiLoginListing parentLoading={defaultPermissionLoading} id={id} />
    </div>
  );
}
