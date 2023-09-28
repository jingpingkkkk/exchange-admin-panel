import { CButton, CCol, CForm, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormMultiSelect from "../../../components/Common/FormComponents/FormMultiSelect";
import { getAllBetCategory } from "../../BetCategory/betcategoryService";
import { Notify } from "../../../utils/notify";
import { addSport, getSportDetailByID, updateSport } from "../sportService";

export default function SportForm() {
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
  const [betCategoryList, setBetCategoryList] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      apiSportId: "",
      betCategory: [],
      positionIndex: null
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      betCategory: Yup.array()
        .min(1, "At least one option must be selected")
        .required("At least one option must be selected"),
    }),
    onSubmit: async (values) => {
      // Perform form submission logic
      setServerError(null); // Reset server error state
      setLoading(true); // Set loading state to true
      try {
        let response = null;
        const { name, betCategory, apiSportId,positionIndex } = values;
        if (editMode) {
          response = await updateSport({
            _id: id,
            ...values,
          });
        } else {
          response = await addSport({
            ...values,
          });
        }
        if (response.success) {
          let msg = editMode ? "Sport Updated Successfully" : "Sport added Successfully";
          Notify.success(msg);
          navigate("/sport-list");
        } else {
          throw new Error(response.message);
        }
      } catch (error) {

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
        const result = await getSportDetailByID(id);

        formik.setValues((prevValues) => ({
          ...prevValues,
          name: result.name || "",
          apiSportId: result.apiSportId || "",
          betCategory: result.betCategory || [],
          positionIndex: result.positionIndex || "",
        }));
      }

      const betCategoryData = await getAllBetCategory();
      const dropdownOptions = betCategoryData.records.map((option) => ({
        value: option._id,
        label: option.name,
      }));
      setBetCategoryList(dropdownOptions);
    };
    fetchData();
  }, [id]);

  const formTitle = id ? "UPDATE SPORT" : "CREATE SPORT";

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
                  label="Name"
                  name="name"
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && formik.errors.name}
                  width={2}
                  isRequired="true"
                />

                <FormInput
                  label="Sport API Code"
                  name="apiSportId"
                  type="text"
                  value={formik.values.apiSportId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.apiSportId && formik.errors.apiSportId}
                  width={3}
                />

                <FormMultiSelect
                  label="Bet Category"
                  name="betCategory"
                  value={formik.values.betCategory}
                  onChange={formik.setFieldValue}
                  onBlur={formik.handleBlur}
                  options={betCategoryList}
                  error={formik.touched.betCategory && formik.errors.betCategory}
                  width={3}
                  isRequired="true"
                />

                <FormInput
                  label="Position Index"
                  name="positionIndex"
                  type="number"
                  value={formik.values.positionIndex}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.positionIndex && formik.errors.positionIndex}
                  width={3}
                />

                <CCol xs={12}>
                  <div className="d-grid gap-2 d-md-block">
                    <CButton color="primary" type="submit" className="me-3">
                      {loading ? <CSpinner size="sm" /> : "Save"}
                    </CButton>
                    <Link to={`${process.env.PUBLIC_URL}/sport-list`} className="btn btn-danger btn-icon text-white ">
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
