import { ExpandMore } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import React, { useState } from "react";
import { Card, Row } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

import { CardActions, IconButton } from "@mui/material";
import FormToggleSwitch from "../../../components/Common/FormComponents/FormToggleSwitch";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addEvent, updateEvent } from "../../Event/eventService";
function EventBetMetchods() {
  const [show, setShow] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state ? location.state.id : "";
  const cancel_redirect = location.state ? location.state.liveEvent : false;

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [competitionList, setCompetitionList] = useState([]);
  const [competitionLoading, setCompetitionLoading] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [expanded, setExpanded] = useState(true);
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
      isBallRunning: false,
      isSuspended: false,
      isMarketVoid: false,
      isVisibleToPlayer: false,
      isSettleMatch: false,
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
      if ((values.minStake || values.maxStake) && values.minStake > values.maxStake) {
        formik.setFieldError("maxStake", "Max stake must be greater than Min Stake");
        return;
      }
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
  const handleCompetitionChange = (name, selectedValue) => {
    formik.setFieldValue(name, selectedValue);
    const selectedCompetition = competitionList.find((competition) => competition.value === selectedValue);
    if (selectedCompetition) {
      formik.setFieldValue("sportId", selectedCompetition.sportId);
    } else {
      formik.setFieldValue("sportId", "");
    }
  };

  return (
    <div className="mt-5">
      <Card>
        <Card.Header>
          <h3 className="card-title">Matchods</h3>
        </Card.Header>

        <Card.Body>
          <Row>
            <h4>One Day Internationals {">"} England v Ireland</h4>
            <CardActions className="card-header bg-primary br-tr-3 br-tl-3">
              <h3 className="card-title text-white">MATCH_ODDS</h3>

              <div className="rtlcards ">
                <ExpandMore
                  expand={expanded.toString()}
                  onClick={() => setExpanded(!expanded)}
                  aria-expanded={expanded}
                  aria-label="show more"
                >
                  <ExpandMoreIcon className=" text-white" />
                </ExpandMore>

                <IconButton
                  size="small"
                  edge="start"
                  color="inherit"
                  onClick={() => setShow(false)}
                  aria-label="close"
                ></IconButton>
              </div>
            </CardActions>
            <CForm className="needs-validation" onSubmit={formik.handleSubmit}>
              {serverError && <p className="text-red">{serverError}</p>}

              <Row>
                <FormSelectWithSearch
                  label="Category"
                  isLoading={competitionLoading}
                  placeholder={competitionLoading ? "Loading Competition..." : "Select Competition"}
                  name="competitionId"
                  value={formik.values.competitionId}
                  onChange={handleCompetitionChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.competitionId && formik.errors.competitionId}
                  isRequired="true"
                  options={competitionList}
                  width={3}
                />

                <FormInput
                  label="Market Name"
                  isLoading={competitionLoading}
                  name="competitionId"
                  value={formik.values.competitionId}
                  onChange={handleCompetitionChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.competitionId && formik.errors.competitionId}
                  isRequired="true"
                  options={competitionList}
                  width={3}
                />
                <FormSelectWithSearch
                  label="Min Bet"
                  isLoading={competitionLoading}
                  name="competitionId"
                  value={formik.values.competitionId}
                  onChange={handleCompetitionChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.competitionId && formik.errors.competitionId}
                  isRequired="true"
                  options={competitionList}
                  width={2}
                />

                <FormSelectWithSearch
                  label="Max Bet"
                  isLoading={competitionLoading}
                  name="competitionId"
                  value={formik.values.competitionId}
                  onChange={handleCompetitionChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.competitionId && formik.errors.competitionId}
                  isRequired="true"
                  options={competitionList}
                  width={2}
                />
                <FormSelectWithSearch
                  label="Bet Delay"
                  isLoading={competitionLoading}
                  name="competitionId"
                  value={formik.values.competitionId}
                  onChange={handleCompetitionChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.competitionId && formik.errors.competitionId}
                  isRequired="true"
                  options={competitionList}
                  width={2}
                />
              </Row>
              <Row className="mt-3">
                <FormSelectWithSearch
                  className="mt-3"
                  label="Max Mkt"
                  isLoading={competitionLoading}
                  name="competitionId"
                  value={formik.values.competitionId}
                  onChange={handleCompetitionChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.competitionId && formik.errors.competitionId}
                  isRequired="true"
                  options={competitionList}
                  width={2}
                />

                <FormInput
                  label="Position Index"
                  name="maxStake"
                  type="number"
                  min="0"
                  value={formik.values.competitionId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.maxStake && formik.errors.maxStake}
                  width={2}
                />

                <FormSelectWithSearch
                  className="mt-3"
                  label="Assign Trader"
                  isLoading={competitionLoading}
                  name="competitionId"
                  value={formik.values.competitionId}
                  onChange={handleCompetitionChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.competitionId && formik.errors.competitionId}
                  isRequired="true"
                  options={competitionList}
                  width={2}
                />

                <CCol sm="4" md="2" lg="2">
                  <CFormLabel htmlFor="isBallRunning">Ball Running</CFormLabel>
                  <FormToggleSwitch
                    id="isBallRunning"
                    name="isBallRunning"
                    checked={formik.values.isBallRunning}
                    onChange={() => {
                      formik.setFieldValue("isBallRunning", !formik.values.isBallRunning);
                    }}
                  />
                </CCol>
                <CCol sm="4" md="4" lg="2">
                  <CFormLabel htmlFor="isSuspended">Suspended</CFormLabel>
                  <FormToggleSwitch
                    id="isSuspended"
                    name="isSuspended"
                    checked={formik.values.isSuspended}
                    onChange={() => {
                      formik.setFieldValue("isSuspended", !formik.values.isSuspended);
                    }}
                  />
                </CCol>
                <CCol sm="4" md="2" lg="2">
                  <CFormLabel htmlFor="isVisibleToPlayer">Visible To Player</CFormLabel>
                  <FormToggleSwitch
                    id="isVisibleToPlayer"
                    name="isVisibleToPlayer"
                    checked={formik.values.isVisibleToPlayer}
                    onChange={() => {
                      formik.setFieldValue("isVisibleToPlayer", !formik.values.isVisibleToPlayer);
                    }}
                  />
                </CCol>
              </Row>
              <Row className="mt-3">
                <CCol sm="4" md="2" lg="2">
                  <CFormLabel htmlFor="isMarketVoid">Market Void</CFormLabel>
                  <FormToggleSwitch
                    id="isMarketVoid"
                    name="isMarketVoid"
                    checked={formik.values.isMarketVoid}
                    onChange={() => {
                      formik.setFieldValue("isMarketVoid", !formik.values.isMarketVoid);
                    }}
                  />
                </CCol>

                <CCol sm="4" md="2" lg="2">
                  <CFormLabel htmlFor="isSettleMatch">Settle Match</CFormLabel>
                  <FormToggleSwitch
                    id="isSettleMatch"
                    name="isSettleMatch"
                    checked={formik.values.isSettleMatch}
                    onChange={() => {
                      formik.setFieldValue("isSettleMatch", !formik.values.isSettleMatch);
                    }}
                  />
                </CCol>
                <FormSelectWithSearch
                  isLoading={competitionLoading}
                  label="Country"
                  name="competitionId"
                  value={formik.values.competitionId}
                  onChange={handleCompetitionChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.competitionId && formik.errors.competitionId}
                  isRequired="true"
                  width={3}
                  options={competitionList}
                />
              </Row>
              <Row className="pt-4 pb-3">
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
                  {loading ? <CSpinner size="sm" /> : "Update"}
                </CButton>
                {cancel_redirect && (
                  <Link to={`${process.env.PUBLIC_URL}/api-event-list`} className="btn btn-danger btn-icon text-white">
                    Cancel
                  </Link>
                )}
                {!cancel_redirect && (
                  <Link to={`${process.env.PUBLIC_URL}/event-list`} className="btn btn-danger btn-icon text-white">
                    Cancel
                  </Link>
                )}
              </div>
            </CForm>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default EventBetMetchods;
