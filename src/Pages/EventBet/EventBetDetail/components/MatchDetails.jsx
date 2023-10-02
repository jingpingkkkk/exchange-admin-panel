import { CCol } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Row, Spinner } from "react-bootstrap";
import { getEventMatchData, getMatchWinLoss } from "../../eventBetService";
import UserBets from "./UserBets";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { Typography } from "@mui/material";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Market from "./Market";

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

function MatchDetails({ eventId }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [marketId, setMarketId] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchWinLoss, setMatchWinLoss] = useState([]);

  const handleChange = (panel, isExpanded) => {
    setExpanded((prevExpanded) =>
      isExpanded ? [...prevExpanded, panel] : prevExpanded.filter((item) => item !== panel)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await getMatchWinLoss(eventId);
      setMatchWinLoss(result);
    };
    fetchData();
  }, [eventId]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const eventData = await getEventMatchData(eventId);
      setSelectedEvent(eventData);
      setMarketId(eventData.marketId);
      setExpanded(eventData.market.map((mkt) => mkt._id));
      setLoading(false);
    };

    fetchData();

    return () => {
      setSelectedEvent(null);
      setMarketId(null);
    };
  }, [eventId]);

  return (
    <div>
      {loading ? (
        <div className="col-md-12 text-center">
          <Spinner animation="border" />
        </div>
      ) : selectedEvent ? (
        <Row>
          <h4>
            {selectedEvent?.competitionName} {" > "} {selectedEvent?.name}
          </h4>

          <CCol md={8}>
            {selectedEvent && selectedEvent?.market?.length
              ? selectedEvent.market.map((market) => (
                  <Accordion
                    expanded={expanded?.includes(market?._id)}
                    key={market?._id}
                    onChange={(e, isExpanded) => handleChange(market?._id, isExpanded)}
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
                      <Market market={market} matchWinLoss={matchWinLoss} />
                    </AccordionDetails>
                  </Accordion>
                ))
              : ""}
            {/* {selectedEvent && selectedEvent.market
              ? selectedEvent.market.map((marketItem) => {
                  if (marketItem.name === "Match Odds") {
                    return <MatchOdds key={marketItem.id} marketId={marketItem.marketId} selectedEvent={marketItem} />;
                  }
                  return null;
                })
              : null} */}

            {/* {marketId ? (
              <>
                <MatchOdds marketId={marketId} selectedEvent={selectedEvent} />
              </>
            ) : null} */}
          </CCol>

          <CCol md={4}>
            <UserBets eventId={eventId} />
          </CCol>
        </Row>
      ) : null}
    </div>
  );
}

export default MatchDetails;
