import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import FormToggleSwitch from "../../../components/Common/FormComponents/FormToggleSwitch"; // Import the FormToggleSwitch component
import { Notify } from "../../../utils/notify";
import { getAllActiveSport } from "../../Sport/sportService";
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
      betDelay: 0,
      isActive: true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      sportId: Yup.string().required("Sport is required"),
      betDelay: Yup.number().min(0).nullable(true),
      isActive: Yup.boolean().required("Status is required"),
      startDate: Yup.date()
        .required("Start Date is required")
        .min(new Date(), "Start date must be today or a future date")
        .test("is-start-date-less", "Start date must be less than the end date", function (startDate) {
          const endDate = this.parent.endDate;
          if (!startDate || !endDate) {
            return true;
          }
          return new Date(startDate) < new Date(endDate);
        }),
      endDate: Yup.date()
        .required("End Date is required")
        .test("is-end-date-greater", "End date must be greater than the start date", function (endDate) {
          const startDate = this.parent.startDate;
          if (!startDate || !endDate) {
            return true;
          }
          return endDate > startDate;
        }),
    }),
    onSubmit: async (values) => {
      // Perform form submission logic
      setServerError(null); // Reset server error state
      setLoading(true); // Set loading state to true
      try {
        let response = null;

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
          betDelay: result.betDelay || 0,
          isActive: result.isActive === true,
        }));
      }
      setSportLoading(true);
      const sportData = await getAllActiveSport();
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
                  isRequired="true"
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
                  isRequired="true"
                />

                <FormInput
                  label="Bet Delay"
                  name="betDelay"
                  type="number"
                  value={formik.values.betDelay}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.betDelay && formik.errors.betDelay}
                  isRequired="false"
                  width={3}
                />

                <CCol md={12} className="ps-4 pb-2">
                  <CFormLabel htmlFor="isActive">Is Active</CFormLabel>
                  <FormToggleSwitch
                    id="isActive"
                    name="isActive"
                    checked={formik.values.isActive}
                    onChange={() => formik.setFieldValue("isActive", !formik.values.isActive)}
                  />
                </CCol>

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
