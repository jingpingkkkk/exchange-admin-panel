import { ExpandMore } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect, useState } from "react";
import { Card, Row, Spinner } from "react-bootstrap";
import { CardActions, IconButton, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { getAllBetResultData } from "../../EventBetMatchods/marketService";
import MatchOddsForm from "./MatchOddsForm";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import "../../EventBet/eventBetDetail.css";

const Accordion = styled((props) => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, .05)" : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));
const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

function EventBetMetchods() {
  const location = useLocation();

  const eventId = location.state ? location.state.id : "";

  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fancyExpanded, setFancyExpanded] = useState([]);

  const handleChange = (panel, isExpanded) => {
    setExpanded((prevExpanded) =>
      isExpanded ? [...prevExpanded, panel] : prevExpanded.filter((item) => item !== panel)
    );
  };
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const eventData = await getAllBetResultData(eventId);
      console.log(eventId);
      setSelectedEvent(eventData);
      setExpanded(eventData?.market?.map((mkt) => mkt._id));
      console.log(eventData);
      const { market_runner } = eventData?.market?.filter((mrt) => mrt.name === "Normal")[0];
      setFancyExpanded(market_runner?.map((mkt) => mkt._id));
      setLoading(false);
    };

    fetchData();

    return () => {
      setSelectedEvent(null);
    };
  }, [eventId]);

  return (
    <div className="mt-5">
      <Card>
        <Card.Header>
          <h3 className="card-title">Matchods</h3>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <div className="col-md-12 text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <Row>
              <h4>
                {selectedEvent?.competitionName} {" > "} {selectedEvent?.name}
              </h4>
              {selectedEvent && selectedEvent?.market?.length
                ? selectedEvent.market.map((market) =>
                    market?.name === "Normal" ? (
                      market?.market_runner?.map((fancy) => (
                        <Accordion
                          expanded={fancyExpanded?.includes(fancy?._id)}
                          key={fancy?._id}
                          onChange={(e, isExpanded) => {
                            setFancyExpanded((prevExpanded) =>
                              isExpanded
                                ? [...prevExpanded, fancy?._id]
                                : prevExpanded.filter((item) => item !== fancy?._id)
                            );
                          }}
                          className="ps-0 pe-0"
                        >
                          <div className="accordtion-header">
                            <AccordionSummary
                              className="accortion-card"
                              aria-controls={`${fancy?._id}d-content`}
                              id={`${fancy?._id}d-header`}
                            >
                              <Typography>{fancy?.runnerName}</Typography>
                            </AccordionSummary>
                          </div>
                          <AccordionDetails>
                            <MatchOddsForm market={market} runnerId={fancy?._id} />
                          </AccordionDetails>
                        </Accordion>
                      ))
                    ) : (
                      <Accordion
                        expanded={expanded?.includes(market?._id)}
                        key={market?._id}
                        onChange={(e, isExpanded) => handleChange(market?._id, isExpanded)}
                        className="ps-0 pe-0"
                      >
                        <div className="accordtion-header">
                          <AccordionSummary
                            className="accortion-card"
                            aria-controls={`${market?._id}d-content`}
                            id={`${market?._id}d-header`}
                          >
                            <Typography>{market?.name}</Typography>
                          </AccordionSummary>
                        </div>
                        <AccordionDetails>
                          {market?.name === "Match Odds" ? <MatchOddsForm market={market} /> : ""}
                          {market?.name === "Bookmaker" ? <MatchOddsForm market={market} /> : ""}
                        </AccordionDetails>
                      </Accordion>
                    )
                  )
                : ""}
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default EventBetMetchods;
