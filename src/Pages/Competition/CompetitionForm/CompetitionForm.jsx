import { CButton, CCol, CForm, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import { Notify } from "../../../utils/notify";
import { getAllSport } from "../../Sport/sportService";
import { addCompetition, getCompetitionDetailByID, updateCompetition } from "../competitionService";

export default function CompetitionForm() {
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
  const [sportList, setSportList] = useState([]);
  const [sportLoading, setSportLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      sportId: "",
      startDate: "",
      endDate: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      sportId: Yup.string().required("Sport is required"),
    }),
    onSubmit: async (values) => {
      // Perform form submission logic
      setServerError(null); // Reset server error state
      setLoading(true); // Set loading state to true
      try {
        let response = null;

        const { name, sportId } = values;
        if (editMode) {
          response = await updateCompetition({
            _id: id,
            ...values,
          });
        } else {
          response = await addCompetition({
            ...values,
          });
        }
        if (response.success) {
          let msg = editMode ? "Competition Updated Successfully" : "Competition added Successfully";
          Notify.success(msg);
          navigate("/competition-list/");
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        //console.log(error);
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
        const result = await getCompetitionDetailByID(id);

        const startDateObj = new Date(result.startDate);
        const startDateFormatted = startDateObj.toISOString().split("T")[0];

        const endDateObj = new Date(result.endDate);
        const endDateFormatted = endDateObj.toISOString().split("T")[0];

        formik.setValues((prevValues) => ({
          ...prevValues,
          name: result.name || "",
          sportId: result.sportId || "",
          startDate: startDateFormatted,
          endDate: endDateFormatted || "",
        }));
      }
      setSportLoading(true);
      const sportData = await getAllSport();
      const dropdownOptions = sportData.records.map((option) => ({
        value: option._id,
        label: option.name,
      }));
      setSportList(dropdownOptions);
      setSportLoading(false);
    };
    fetchData();
  }, [id]);

  const formTitle = id ? "UPDATE COMPETITION" : "CREATE COMPETITION";

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
                  isRequired="true"
                  width={3}
                />

                <FormSelectWithSearch
                  isLoading={sportLoading}
                  placeholder={sportLoading ? "Loading Sports..." : "Select Sport"}
                  label="Sport"
                  name="sportId"
                  value={formik.values.sportId}
                  onChange={(name, selectedValue) => {
                    formik.setFieldValue("sportId", selectedValue); // Use the 'name' argument here
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.sportId && formik.errors.sportId}
                  isRequired="true"
                  width={3}
                  options={sportList}
                />

                {/* <FormSelect
                  label="Sport"
                  name="sportId"
                  value={formik.values.sportId}
                  onChange={(event) => {
                    formik.setFieldValue('sportId', event.target.value);

                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.sportId && formik.errors.sportId}
                  isRequired="true"
                  width={3}
                >
                  <option value="">Select Sport</option>
                  {sportList.map((sport, index) => (
                    <option key={sport._id} value={sport._id}>
                      {sport.name}
                    </option>
                  ))}
                </FormSelect> */}

                <FormInput
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.startDate && formik.errors.startDate}
                  width={3}
                />

                <FormInput
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formik.values.endDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.endDate && formik.errors.endDate}
                  width={3}
                />

                <CCol xs={12}>
                  <div className="d-grid gap-2 d-md-block">
                    <CButton color="primary" type="submit" className="me-3">
                      {loading ? <CSpinner size="sm" /> : "Save"}
                    </CButton>
                    <Link
                      to={`${process.env.PUBLIC_URL}/competition-list`}
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
