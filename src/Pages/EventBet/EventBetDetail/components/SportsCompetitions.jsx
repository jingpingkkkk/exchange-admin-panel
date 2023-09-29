import React, { useEffect, useState } from "react";
import { Accordion, Spinner } from "react-bootstrap";
import { getAllActiveCompetitionEvents } from "../../eventBetService";
import moment from "moment";

function SportsCompetitions({ onClick }) {
  const [sportsList, setSportsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const sportData = await getAllActiveCompetitionEvents();
      setSportsList(sportData);
      setLoading(false);
    };

    fetchData();
  }, []);
  const formatMatchDate = (event) => {
    const time = event?.matchTime
      ? moment(event.matchTime, "HH:mm").format("hh:mm A")
      : moment(event.matchDate).format("hh:mm A");
    const datetime = event.matchDate ? moment(event.matchDate).format("DD-MM-YYYY") + " " + time || "" : "";
    return datetime;
  };
  return (
    <>
      {loading ? (
        <div className="col-md-12 text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Accordion defaultActiveKey="0">
          {sportsList.map((sport, index) => (
            <Accordion.Item key={sport._id} eventKey={sport._id} className="mb-1">
              <Accordion.Header className="panel-heading1 style3">{sport.name}</Accordion.Header>

              <Accordion.Body className="border">
                <Accordion defaultActiveKey="0">
                  {sport.competitions.map(
                    (competition, competition_index) =>
                      competition.isActive === true && (
                        <Accordion.Item key={competition._id} eventKey={competition._id} className="mb-1">
                          <Accordion.Header className="panel-heading1 style3">{competition.name}</Accordion.Header>

                          <Accordion.Body className="border">
                            <div className="">
                              <ul className="list-group">
                                {competition.events.map(
                                  (event, event_index) =>
                                    event.isActive && (
                                      <li
                                        onClick={() => onClick(event._id)}
                                        className="listunorder"
                                        key={event._id + "_list"}
                                        style={{ cursor: "pointer" }}
                                      >
                                        {event.name} - ({formatMatchDate(event)})
                                      </li>
                                    )
                                )}
                              </ul>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      )
                  )}
                </Accordion>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </>
  );
}

export default SportsCompetitions;
