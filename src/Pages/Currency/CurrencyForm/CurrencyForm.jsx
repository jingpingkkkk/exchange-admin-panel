import { CButton, CCol, CForm, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput"; // Import the FormInput component
import { Notify } from "../../../utils/notify";
import { addCurrency, getCurrencyDetailByID, updateCurrency } from "../currencyService";

export default function CurrencyForm() {
  const navigate = useNavigate();
  const location = useLocation();
  //id get from state
  const id = location.state ? location.state.id : null;
  const editMode = !!id;
  //id get from url
  //const { id } = useParams();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null); // State to hold the server error message

  const formik = useFormik({
    initialValues: {
      name: "",
      multiplier: "",
      countryName:"",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      multiplier: Yup.number().min(0).required("Conversion Rate must be a number"),
      countryName: Yup.string().required("Country Name is required"),
    }),
    onSubmit: async (values) => {
      // Perform form submission logic
      setServerError(null); // Reset server error state
      setLoading(true); // Set loading state to true
      try {
        let response = null;
        if (editMode) {
          response = await updateCurrency({
            _id: id,
            name: values.name,
            multiplier: values.multiplier,
            countryName:values.countryName,
          });
        } else {
          response = await addCurrency({
            name: values.name,
            multiplier: values.multiplier,
            countryName:values.countryName,
          });
        }
        if (response.success) {
          let msg = editMode ? "Currency Updated Successfully" : "Currency added Successfully";
          Notify.success(msg);
          navigate("/currency-list/");
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
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const result = await getCurrencyDetailByID(id);
        formik.setValues((prevValues) => ({
          ...prevValues,
          name: result.name || "",
          multiplier: result.multiplier || "",
          countryName:result.countryName || "",
        }));
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formTitle = id ? "UPDATE CURRENCY" : "CREATE CURRENCY";

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
                {serverError && <p className="text-red">{serverError}</p>}
                {/* Display server error message */}
                <FormInput
                  label="Currency"
                  name="name"
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && formik.errors.name}
                  width={3}
                  isRequired="true"
                />

                <FormInput
                  label="Conversion rate (INR)"
                  name="multiplier"
                  type="number"
                  value={formik.values.multiplier}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.multiplier && formik.errors.multiplier}
                  width={3}
                  isRequired="true"
                />
                 <FormInput
                  label="Country Name"
                  name="countryName"
                  type="text"
                  value={formik.values.countryName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.countryName && formik.errors.countryName}
                  width={3}
                  isRequired="true"
                />

                <CCol xs={12}>
                  <div className="d-grid gap-2 d-md-block">
                    <CButton color="primary" type="submit" className="me-3">
                      {loading ? <CSpinner size="sm" /> : "Save"}
                    </CButton>
                    <Link
                      to={`${process.env.PUBLIC_URL}/currency-list`}
                      className="btn btn-danger btn-icon text-white "
                    >
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
