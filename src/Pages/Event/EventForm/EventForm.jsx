import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import moment from "moment/moment";
import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch"; // Import the FormSelect component
import FormToggleSwitch from "../../../components/Common/FormComponents/FormToggleSwitch"; // Import the FormToggleSwitch component
import { getAllCompetitionOptions } from "../../Competition/competitionService";
import { addEvent, getEventDetailByID, updateEvent } from "../eventService";

export default function EventForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state ? location.state.id : "";

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [competitionList, setCompetitionList] = useState([]);
  const [competitionLoading, setCompetitionLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      competitionId: "",
      sportId: "",
      name: "",
      matchDate: "",
      matchTime: "",
      betDelay: 0,
      oddsLimit: 0,
      volumeLimit: 0,
      maxStake: 0,
      minStake: 0,
      minStakeSession: 0,
      maxStakeSession: 0,
      isActive: false,
      completed: false,
      betDeleted: false,
      betLock: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      competitionId: Yup.string().required("Competition is required"),
      matchDate: Yup.string().required("Date is required"),
      matchTime: Yup.string().required("Time is required"),
      oddsLimit: Yup.number(),
      volumeLimit: Yup.number(),
      maxStake: Yup.number().when("minStake", (minStake, schema) =>
        schema.test({
          test: (maxStake) => !maxStake || maxStake >= minStake,
          message: "Max stake must be greater than or equal to min stake",
        })
      ),
      minStake: Yup.number().min(0, "Min stake must be greater than or equal to 0"),
      minStakeSession: Yup.number(),
      maxStakeSession: Yup.number().when("minStakeSession", (minStakeSession, schema) =>
        schema.test({
          test: (maxStakeSession) => !maxStakeSession || maxStakeSession >= minStakeSession,
          message: "Max stake session must be greater than or equal to min stake session",
        })
      ),
      betDelay: Yup.number(),
    }),
    onSubmit: async (values) => {
      setServerError(null);
      setLoading(true);
      try {
        let response = null;
        const body = {
          ...values,
          oddsLimit: values.oddsLimit || 0,
          volumeLimit: values.volumeLimit || 0,
          maxStake: values.maxStake || 0,
          minStake: values.minStake || 0,
          minStakeSession: values.minStakeSession || 0,
          maxStakeSession: values.maxStakeSession || 0,
          betDelay: values.betDelay || 0,
        };
        if (id) {
          body._id = id;
          response = await updateEvent(body);
        } else {
          response = await addEvent(body);
        }
        if (response.success) {
          navigate("/event-list/");
        } else {
          setServerError(response.message);
        }
      } catch (error) {
        //console.log(error);
        if (error.response && error.response.status === 500) {
          // Server-side error occurred
          setServerError(error.response.data.message); // Set the server error message
        } else {
          // Handle other errors
        }
      } finally {
        setLoading(false); // Set loading state to false
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const competitionBody = { fields: { name: 1, sportId: 1 }, sortBy: "name", direction: "asc", status: true };
      if (id) {
        const result = await getEventDetailByID(id);

        formik.setValues((prevValues) => ({
          ...prevValues,
          name: result.name || "",
          competitionId: result.competitionId || "",
          sportId: result.sportId || "",
          matchDate: result.matchDate ? moment(result.matchDate).format("YYYY-MM-DD") : "",
          matchTime: result.matchTime || "",
          minStake: result.minStake,
          maxStake: result.maxStake,
          volumeLimit: result.volumeLimit,
          oddsLimit: result.oddsLimit,
          minStakeSession: result.minStakeSession,
          maxStakeSession: result.maxStakeSession,
          isActive: result.isActive || false,
          completed: result.completed || false,
          betDeleted: result.betDeleted || false,
          betDelay: result.betDelay,
          betLock: result.betLock || false,
        }));

        competitionBody.competitionId = result.competitionId;
      }

      setCompetitionLoading(true);
      const competitionData = await getAllCompetitionOptions(competitionBody);
      const dropdownOptions = competitionData.records.map((option) => ({
        value: option._id,
        label: option.name,
        sportId: option.sportId,
      }));
      setCompetitionList(dropdownOptions);
      setCompetitionLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCompetitionChange = (name, selectedValue) => {
    formik.setFieldValue(name, selectedValue);
    const selectedCompetition = competitionList.find((competition) => competition.value === selectedValue);
    if (selectedCompetition) {
      formik.setFieldValue("sportId", selectedCompetition.sportId);
    } else {
      formik.setFieldValue("sportId", "");
    }
  };

  const formTitle = id ? "UPDATE EVENT" : "CREATE EVENT";

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
            <Card.Body>
              <CForm className="needs-validation" onSubmit={formik.handleSubmit}>
                {serverError && <p className="text-red">{serverError}</p>}

                <Row>
                  <FormSelectWithSearch
                    isLoading={competitionLoading}
                    placeholder={competitionLoading ? "Loading Competition..." : "Select Competition"}
                    label="Competition"
                    name="competitionId"
                    value={formik.values.competitionId}
                    onChange={handleCompetitionChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.competitionId && formik.errors.competitionId}
                    isRequired="true"
                    width={6}
                    options={competitionList}
                  />

                  <FormInput
                    label="Name"
                    name="name"
                    type="text"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && formik.errors.name}
                    width={6}
                    isRequired="true"
                  />
                </Row>

                <Row>
                  <FormInput
                    className="mt-3"
                    label="Match Date"
                    name="matchDate"
                    type="date"
                    value={formik.values.matchDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.matchDate && formik.errors.matchDate}
                    width={3}
                    isRequired="true"
                  />

                  <FormInput
                    className="mt-3"
                    label="Match Time"
                    name="matchTime"
                    type="time"
                    value={formik.values.matchTime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.matchTime && formik.errors.matchTime}
                    width={3}
                    isRequired="true"
                  />
                </Row>

                <Row>
                  <FormInput
                    className="mt-3"
                    label="Min Stake"
                    name="minStake"
                    min="0"
                    type="number"
                    value={formik.values.minStake}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.minStake && formik.errors.minStake}
                    width={3}
                  />

                  <FormInput
                    className="mt-3"
                    label="Max Stake"
                    name="maxStake"
                    type="number"
                    min="0"
                    value={formik.values.maxStake}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.maxStake && formik.errors.maxStake}
                    width={3}
                  />

                  <FormInput
                    className="mt-3"
                    label="Odds Limit"
                    name="oddsLimit"
                    type="number"
                    min="0"
                    value={formik.values.oddsLimit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.oddsLimit && formik.errors.oddsLimit}
                    width={3}
                  />

                  <FormInput
                    className="mt-3"
                    label="Volume Limit"
                    name="volumeLimit"
                    type="number"
                    min="0"
                    value={formik.values.volumeLimit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.volumeLimit && formik.errors.volumeLimit}
                    width={3}
                  />

                  <FormInput
                    className="mt-3"
                    label="Min Stake Session"
                    name="minStakeSession"
                    type="number"
                    min="0"
                    value={formik.values.minStakeSession}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.minStakeSession && formik.errors.minStakeSession}
                    width={3}
                  />

                  <FormInput
                    className="mt-3"
                    label="Max Stake Session"
                    name="maxStakeSession"
                    type="number"
                    min="0"
                    value={formik.values.maxStakeSession}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.maxStakeSession && formik.errors.maxStakeSession}
                    width={3}
                  />

                  <FormInput
                    className="mt-3"
                    label="Bet Delay"
                    name="betDelay"
                    type="number"
                    min="0"
                    value={formik.values.betDelay}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.betDelay && formik.errors.betDelay}
                    width={3}
                  />
                </Row>

                <Row className="pt-4 pb-3">
                  <CCol sm="4" md="2" lg="1">
                    <CFormLabel htmlFor="isActive">Active</CFormLabel>
                    <FormToggleSwitch
                      id="isActive"
                      name="isActive"
                      checked={formik.values.isActive}
                      onChange={() => {
                        formik.setFieldValue("isActive", !formik.values.isActive);
                      }}
                    />
                  </CCol>

                  {id && (
                    <>
                      <CCol sm="4" md="2" lg="1">
                        <CFormLabel htmlFor="completed">Completed</CFormLabel>
                        <FormToggleSwitch
                          id="completed"
                          name="completed"
                          checked={formik.values.completed}
                          onChange={() => {
                            formik.setFieldValue("completed", !formik.values.completed);
                          }}
                        />
                      </CCol>
                      <CCol sm="4" md="2" lg="1">
                        <CFormLabel htmlFor="betDeleted">Bet Delete</CFormLabel>
                        <FormToggleSwitch
                          id="betDeleted"
                          name="betDeleted"
                          checked={formik.values.betDeleted}
                          onChange={() => {
                            formik.setFieldValue("betDeleted", !formik.values.betDeleted);
                          }}
                        />
                      </CCol>
                      <CCol sm="4" md="2" lg="1">
                        <CFormLabel htmlFor="betLock">Bet Lock</CFormLabel>
                        <FormToggleSwitch
                          id="betLock"
                          name="betLock"
                          checked={formik.values.betLock}
                          onChange={() => {
                            formik.setFieldValue("betLock", !formik.values.betLock);
                          }}
                        />
                      </CCol>
                    </>
                  )}
                </Row>

                <div className="mt-5">
                  <CButton color="primary" type="submit" className="me-2">
                    {loading ? <CSpinner size="sm" /> : "Save"}
                  </CButton>

                  <Link to={`${process.env.PUBLIC_URL}/event-list`} className="btn btn-danger btn-icon text-white">
                    Cancel
                  </Link>
                </div>
              </CForm>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
