import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Accordion, Card, Row, Col } from "react-bootstrap";
import { getAllCompetionByEvent, activeAllEvent, activeAllCompetition } from "../eventService";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import { CCol, CFormLabel, CButton, CSpinner } from "@coreui/react";

export default function EventForm() {
  const navigate = useNavigate();
  const location = useLocation();
  //id get from state
  const id = location.state ? location.state.id : '';
  //id get from url
  //const { id } = useParams();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null); // State to hold the server error message
  const [serverSuccess, setServerSuccess] = useState(null); // State to hold the server error message
  const [sportList, setSportList] = useState([]);

  const [selectedSport, setSelectedSport] = useState(null);
  const [addedCompetitionIds, setAddedCompetitionIds] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [addedEventIds, setAddedEventIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [eventSettingData, setEventSettingData] = useState(null);

  const toggleCompetitionStatus = (competition) => {
    const updatedCompetitions = addedCompetitionIds.includes(competition._id)
      ? addedCompetitionIds.filter((id) => id !== competition._id)
      : [...addedCompetitionIds, competition._id];
    setAddedCompetitionIds(updatedCompetitions);
  };

  const toggleEventStatus = (event) => {
    const updatedEvents = addedEventIds.includes(event._id)
      ? addedEventIds.filter(id => id !== event._id)
      : [...addedEventIds, event._id];
    setAddedEventIds(updatedEvents);
  };

  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleEventEditClick = (event) => {
    console.log(event)
    //setEventSettingData(event)
    //setSelectedSport(null); // Hide the selectedSport when the event is edited
    //setSelectedCompetition(null); // Hide the selectedCompetition when the event is edited
  };

  const updateCompetition = async (e) => {

    // API here
    const response = await activeAllCompetition({
      competitionIds: addedCompetitionIds,
      sportId: selectedSport._id
    });
    if (response.success) {
      setServerSuccess('Updated Successfully');
    } else {
      setServerError(response.message);
    }
  }

  const updateEvent = async (e) => {

    const response = await activeAllEvent({
      eventIds: addedEventIds,
      competitionId: selectedCompetition._id
    });
    if (response.success) {
      setServerSuccess('Updated Successfully');
    } else {
      setServerError(response.message);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const sportData = await getAllCompetionByEvent();
      setSportList(sportData);

      const addedEvents = sportData.reduce((acc, sport) => {
        const events = sport.competitions.flatMap(comp => comp.events);
        const addedIds = events.filter(event => event.isActive).map(event => event._id);
        return [...acc, ...addedIds];
      }, []);

      setAddedEventIds(addedEvents);
    };
    fetchData();
  }, [id]);


  return (
    <div>
      <Row className="mt-5">
        <Col md={12} lg={12}>
          <Card>
            <Card.Header>
              <h3 className="card-title">Match</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <CCol lg={4}>
                  <Accordion defaultActiveKey="0">
                    {sportList.map((sport, index) => (
                      <Accordion.Item key={sport._id} eventKey={sport._id} className="mb-1">
                        <Accordion.Header className="panel-heading1 style3" onClick={() => {
                          setSelectedCompetition(null); // Make selectedCompetition blank on sport click
                          setEventSettingData(null)
                          setSelectedSport(sport);
                          setAddedCompetitionIds(
                            sport.competitions.filter((comp) => comp.isActive).map((comp) => comp._id)
                          );
                        }}>
                          {sport.name}
                        </Accordion.Header>
                        <Accordion.Body className="border">
                          <Accordion defaultActiveKey="0">
                            {sport.competitions.map((competition, competition_index) => (

                              competition.isActive === true && (
                                < Accordion.Item key={competition._id} eventKey={competition._id} className="mb-1" >
                                  <Accordion.Header className="panel-heading1 style3" onClick={() => {
                                    setSelectedCompetition(competition); // Make selectedCompetition blank on sport click
                                    setSelectedSport(null);
                                    setEventSettingData(null);
                                    setAddedEventIds(
                                      competition.events.filter((ev) => ev.isActive).map((ev) => ev._id)
                                    );
                                  }}>
                                    {competition.name}
                                    {/* <Link to={`${process.env.PUBLIC_URL}/competition-form`} state={{ id: competition._id }}>
                                      <span className=" rounded-pill ">
                                        <i className="fa fa-edit"></i>
                                      </span>
                                    </Link> */}

                                  </Accordion.Header>
                                  <Accordion.Body className="border">
                                    <div className="">
                                      <ul className="list-group">
                                        {competition.events.map((event, event_index) => (
                                          event.isActive == true &&
                                          <div key={event._id}>
                                            <Link to={`${process.env.PUBLIC_URL}/event-form`} state={{ id: event._id }} >
                                              <li className="listunorder" key={event._id + '_list'}>{event.name}
                                                <span className="badgetext badge bg-default rounded-pill">
                                                  <i className="fa fa-edit"></i>
                                                </span>
                                              </li>
                                            </Link>
                                          </div>
                                        ))}
                                      </ul>
                                    </div>
                                  </Accordion.Body>
                                </Accordion.Item>
                              )
                            ))}
                          </Accordion>

                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </CCol>
                <CCol lg={8}>
                  {serverError && <p className="text-red">{serverError}</p>}
                  {serverSuccess && <p className="text-green">{serverSuccess}</p>}
                  {/* Display server error message */}

                  {selectedSport && (
                    <Row>
                      <div>
                        <h4>{selectedSport.name}</h4>
                        {/* Display other competition data here */}
                      </div>

                      <FormInput
                        label="Search"
                        name="searchText"
                        type="text"
                        value={searchText}
                        onChange={handleSearchTextChange}
                        width={3}
                      />

                      <Row className="mt-5">
                        <CCol lg={2}>
                          Already Added :
                        </CCol>
                        <CCol lg={10}>
                          <div className="">
                            <ul className="list-group">
                              {selectedSport.competitions.map((competition, competition_index) =>
                                addedCompetitionIds.includes(competition._id) ? (
                                  <li className="listunorder" key={competition._id + '_already_added'} onClick={() => toggleCompetitionStatus(competition)} style={{ cursor: "pointer" }} >
                                    {competition.name}
                                  </li>
                                ) : null
                              )}
                            </ul>
                          </div>
                        </CCol>
                      </Row>
                      <hr className="mt-5"></hr>
                      <Row className="mt-5">
                        <CCol lg={2}>
                          All :
                        </CCol>
                        <CCol lg={10}>
                          <div className="">
                            <ul className="list-group">
                              {selectedSport.competitions.map((competition, competition_index) => {
                                const eventName = competition.name.toLowerCase();
                                const searchQuery = searchText.toLowerCase();
                                if (!addedCompetitionIds.includes(competition._id) && eventName.includes(searchQuery)) {
                                  return (
                                    <li className="listunorder" key={competition._id + '_all'} onClick={() => toggleCompetitionStatus(competition)} style={{ cursor: "pointer" }}>
                                      {competition.name}
                                    </li>
                                  );
                                }
                                return null;
                              })}

                            </ul>
                          </div>
                        </CCol>
                      </Row>
                      <CCol xs={12}>
                        <div className="d-grid gap-2 d-md-block">
                          <CButton color="primary" type="button" className="me-3" onClick={() => {
                            updateCompetition()
                          }}>
                            {loading ? <CSpinner size="sm" /> : "Save"}
                          </CButton>

                        </div>
                      </CCol>

                    </Row>
                  )}

                  {selectedCompetition && (
                    <Row>

                      <div>
                        <h4>{selectedCompetition.name}</h4>
                        {/* Display other competition data here */}
                      </div>

                      <FormInput
                        label="Search"
                        name="searchText"
                        type="text"
                        value={searchText}
                        onChange={handleSearchTextChange}
                        width={3}
                      />

                      <Row className="mt-5">
                        <CCol lg={4}>
                          Already Added :
                        </CCol>
                        <CCol lg={8}>
                          <div className="">
                            <ul className="list-group">
                              {selectedCompetition.events.map((event, event_index) =>
                                addedEventIds.includes(event._id) ? (
                                  <li className="listunorder" key={event._id + '_already__added'} onClick={() => toggleEventStatus(event)} style={{ cursor: "pointer" }} >
                                    {event.name}
                                  </li>
                                ) : null
                              )}
                            </ul>
                          </div>
                        </CCol>
                      </Row>
                      <hr className="mt-5"></hr>
                      <Row className="mt-5">
                        <CCol lg={4}>
                          All :
                        </CCol>
                        <CCol lg={8}>
                          <div className="">
                            <ul className="list-group">
                              {selectedCompetition.events.map((event, event_index) => {
                                const eventName = event.name.toLowerCase();
                                const searchQuery = searchText.toLowerCase();
                                if (!addedEventIds.includes(event._id) && eventName.includes(searchQuery)) {
                                  return (
                                    <li className="listunorder" key={event._id + '_all'} onClick={() => toggleEventStatus(event)} style={{ cursor: "pointer" }}>
                                      {event.name}
                                    </li>
                                  );
                                }
                                return null;
                              })}

                            </ul>
                          </div>
                        </CCol>
                      </Row>
                      <CCol xs={12}>
                        <div className="d-grid gap-2 d-md-block">
                          <CButton color="primary" type="button" className="me-3" onClick={() => {
                            updateEvent()
                          }}>
                            {loading ? <CSpinner size="sm" /> : "Save"}
                          </CButton>

                        </div>
                      </CCol>

                    </Row>
                  )}

                  {eventSettingData && (
                    <Row>

                      <div>
                        <h4>{eventSettingData.name}</h4>
                        {/* Display other competition data here */}
                      </div>

                      <Row>
                        <CCol xs={12} md={6} lg={3} >
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id=""
                              name=""
                              checked={false}
                            // onChange={(e) =>
                            //   formik.setFieldValue(match_odds, e.target.checked)
                            // }
                            />
                            <CFormLabel className="form-check-label">
                              Match Odds
                            </CFormLabel>
                          </div>
                        </CCol>

                        <CCol xs={12} md={6} lg={3} >
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id=""
                              name=""
                              checked={false}
                            // onChange={(e) =>
                            //   formik.setFieldValue(match_odds, e.target.checked)
                            // }
                            />
                            <CFormLabel className="form-check-label">
                              Visible to player
                            </CFormLabel>
                          </div>
                        </CCol>

                        <CCol xs={12} md={6} lg={3} >
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id=""
                              name=""
                              checked={false}
                            // onChange={(e) =>
                            //   formik.setFieldValue(match_odds, e.target.checked)
                            // }
                            />
                            <CFormLabel className="form-check-label">
                              Can bet
                            </CFormLabel>
                          </div>
                        </CCol>

                      </Row>

                      <Row>
                        <CCol xs={12} md={6} lg={3} >
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id=""
                              name=""
                              checked={false}
                            // onChange={(e) =>
                            //   formik.setFieldValue(match_odds, e.target.checked)
                            // }
                            />
                            <CFormLabel className="form-check-label">
                              Match Odds
                            </CFormLabel>
                          </div>
                        </CCol>

                        <CCol xs={12} md={6} lg={3} >
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id=""
                              name=""
                              checked={false}
                            // onChange={(e) =>
                            //   formik.setFieldValue(match_odds, e.target.checked)
                            // }
                            />
                            <CFormLabel className="form-check-label">
                              Visible to player
                            </CFormLabel>
                          </div>
                        </CCol>

                        <CCol xs={12} md={6} lg={3} >
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id=""
                              name=""
                              checked={false}
                            // onChange={(e) =>
                            //   formik.setFieldValue(match_odds, e.target.checked)
                            // }
                            />
                            <CFormLabel className="form-check-label">
                              Can bet
                            </CFormLabel>
                          </div>
                        </CCol>

                      </Row>

                      <CCol xs={12}>
                        <div className="d-grid gap-2 d-md-block">
                          <CButton color="primary" type="button" className="me-3" onClick={() => {
                            updateEvent()
                          }}>
                            {loading ? <CSpinner size="sm" /> : "Save"}
                          </CButton>

                        </div>
                      </CCol>

                    </Row>
                  )}
                </CCol>
              </Row>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div >
  );
}
