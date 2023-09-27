import { React, useEffect, useState } from "react";
import { ExpandMore } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import { Card, Row, Table } from "react-bootstrap";
import { io } from "socket.io-client";
import BetBox from "../../../../components/Common/BetComponents/BetBox";
import "../../eventBetDetail.css";
import { Button } from "react-bootstrap";

import { TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
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
const formatSize = (size) => {
  if (!size) return;
  if (size >= 100000) {
    return `${(size / 100000).toFixed(1)}L`;
  } else if (size >= 1000) {
    return `${(size / 1000).toFixed(1)}k`;
  } else {
    return size.toString();
  }
};
const socketUrl = process.env.REACT_APP_SOCKET_URL;
const marketUrl = `${socketUrl}/market`;

function MatchOdds({ marketId, selectedEvent }) {
  const socket = io(marketUrl);

  const [show, setShow] = useState(true);
  const [teamOneLayData, setTeamOneLayData] = useState([]);
  const [teamOneBackData, setTeamOneBackData] = useState([]);
  const [teamTwoLayData, setTeamTwoLayData] = useState([]);
  const [teamTwoBackData, setTeamTwoBackData] = useState([]);
  // const [expanded, setExpanded] = (React.useState < string) | (false > "panel1");

  const [expanded, setExpanded] = useState("panel1");

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("join:market", {
        id: marketId,
        type: "match_odds",
      });
    });

    socket.on(`market:data:${marketId}`, (data) => {
      if (data) {
        const { matchOdds } = data;
        const [teamOne, teamTwo] = matchOdds;

        const teamOneData = { back: [], lay: [] };
        const teamTwoData = { back: [], lay: [] };

        for (let i = 0; i < 3; i++) {
          teamOneData.back.push(teamOne.back[i] || {});
          teamOneData.lay.push(teamOne.lay[i] || {});
          teamTwoData.back.push(teamTwo.back[i] || {});
          teamTwoData.lay.push(teamTwo.lay[i] || {});
        }

        setTeamOneBackData(teamOneData.back);
        setTeamOneLayData(teamOneData.lay);
        setTeamTwoBackData(teamTwoData.back);
        setTeamTwoLayData(teamTwoData.lay);
      }
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off(`market:data:${marketId}`);
      socket.disconnect();
    };
  }, [marketId, selectedEvent]);

  return (
    <Card className="card">
      {" "}
      <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
        <div className="accordtion-header">
          <AccordionSummary className="accortion-card" aria-controls="panel1d-content" id="panel1d-header">
            <Typography>Match_ODDS</Typography>
          </AccordionSummary>
        </div>
        <AccordionDetails>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="right">
                    {" "}
                    <span className="tableSpan"> 1.3L </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="grey-box back2">Back</div>
                  </TableCell>
                  <TableCell align="right">
                    <div className="grey-box lay2">Lay</div>
                  </TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right"></TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* {rows.map((row) => ( */}

                <TableRow
                  // key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <span className="table-span">
                      {" "}
                      {"Bangladesh"}
                      <br />0{" "}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="grey-box back2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    {" "}
                    <div className="grey-box lay2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    {" "}
                    <div className="grey-box lay2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <div className="grey-box back2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    {" "}
                    <div className="grey-box lay2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <div className="grey-box back2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow
                  // key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <span className="table-span">
                      {" "}
                      {"New Zealand"}
                      <br />0{" "}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="grey-box back2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    {" "}
                    <div className="grey-box lay2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    {" "}
                    <div className="grey-box lay2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <div className="grey-box back2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    {" "}
                    <div className="grey-box lay2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <div className="grey-box back2">
                      2.34 <br />
                      10.38k
                    </div>
                  </TableCell>
                </TableRow>
                {/* ))}  */}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
      <div className="rtlcards">
        <ExpandMore
          expand={expanded.toString()}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="show more"
        ></ExpandMore>
      </div>
      <div className="mt-3">
        <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
          <div className="accordtion-header">
            <AccordionSummary className="accortion-card" aria-controls="panel1d-content" id="panel1d-header">
              <Typography>Bookmaker</Typography>
            </AccordionSummary>
          </div>
          <AccordionDetails>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="right">
                      {" "}
                      <span className="tableSpan"> Min:100 Max:29L22 </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">Back</div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box lay2">Lay</div>
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {rows.map((row) => ( */}

                  <TableRow
                    // key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <span className="table-span">
                        {" "}
                        {"Bangladesh"}
                        <br />0{" "}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    // key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <span className="table-span">
                        {" "}
                        {"New Zealand"}
                        <br />0{" "}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        2.34 <br />
                        10.38k
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* ))}  */}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <div className="rtlcards">
          <ExpandMore
            expand={expanded.toString()}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          ></ExpandMore>
        </div>
      </div>
      <Row>
        <div className="col-6 mt-3">
          <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
            <div className="accordtion-header">
              <AccordionSummary className="accortion-card" aria-controls="panel1d-content" id="panel1d-header">
                <Typography>Bookmaker 2</Typography>
              </AccordionSummary>
            </div>
            <AccordionDetails>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">
                        {" "}
                        <span className="tableSpan"> Min:100 Max:29L22 </span>
                      </TableCell>
                      <TableCell align="right">
                        <div className="grey-box back2">Back</div>
                      </TableCell>
                      <TableCell align="right">
                        <div className="grey-box lay2">Lay</div>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* {rows.map((row) => ( */}

                    <TableRow
                      // key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <span className="table-span">
                          {" "}
                          {"Bangladesh"}
                          <br />0{" "}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <div className="grey-box back2">
                          2.34 <br />
                          10.38k
                        </div>
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <div className="grey-box lay2">
                          2.34 <br />
                          10.38k
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow
                      // key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <span className="table-span">
                          {" "}
                          {"New Zealand"}
                          <br />0{" "}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <div className="grey-box back2">
                          2.34 <br />
                          10.38k
                        </div>
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <div className="grey-box lay2">
                          2.34 <br />
                          10.38k
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* ))}  */}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
          <div className="rtlcards">
            <ExpandMore
              expand={expanded.toString()}
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            ></ExpandMore>
          </div>
        </div>
        <div className="col-6 mt-3">
          <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
            <div className="accordtion-header">
              <AccordionSummary className="accortion-card" aria-controls="panel1d-content" id="panel1d-header">
                <Typography>Tied Match</Typography>
              </AccordionSummary>
            </div>
            <AccordionDetails>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell align="right">
                        {" "}
                        <span className="tableSpan"> Min:100 Max:29L22 </span>
                      </TableCell>
                      <TableCell align="right">
                        <div className="grey-box back2">Back</div>
                      </TableCell>
                      <TableCell align="right">
                        <div className="grey-box lay2">Lay</div>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* {rows.map((row) => ( */}

                    <TableRow
                      // key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <span className="table-span">
                          {" "}
                          {"Bangladesh"}
                          <br />0{" "}
                        </span>
                      </TableCell>
                      <TableCell></TableCell>

                      <TableCell align="right">
                        <div className="grey-box back2">
                          2.34 <br />
                          10.38k
                        </div>
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <div className="grey-box lay2">
                          2.34 <br />
                          10.38k
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow
                      // key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <span className="table-span">
                          {" "}
                          {"New Zealand"}
                          <br />0{" "}
                        </span>
                      </TableCell>
                      <TableCell></TableCell>

                      <TableCell align="right">
                        <div className="grey-box back2">
                          2.34 <br />
                          10.38k
                        </div>
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        <div className="grey-box lay2">
                          2.34 <br />
                          10.38k
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* ))}  */}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
          <div className="rtlcards">
            <ExpandMore
              expand={expanded.toString()}
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            ></ExpandMore>
          </div>
        </div>
      </Row>
      <div className="mt-3">
        <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
          <div className="accordtion-header">
            <AccordionSummary className="accortion-card" aria-controls="panel1d-content" id="panel1d-header">
              <Typography>Normal</Typography>
            </AccordionSummary>
          </div>
          <AccordionDetails>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">No</div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box lay2">Yes</div>
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {rows.map((row) => ( */}

                  <TableRow
                    // key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <span className="table-span">
                        {" "}
                        {"10 over runs AUS(IND vs AUS)adv"}
                        <br />0{" "}
                      </span>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        56 <br />
                        100
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        58 <br />
                        100
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      Min:100 <br />
                      Max65k
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <div className="rtlcards">
          <ExpandMore
            expand={expanded.toString()}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          ></ExpandMore>
        </div>
      </div>
      <div className="mt-3">
        <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
          <div className="accordtion-header">
            <AccordionSummary className="accortion-card" aria-controls="panel1d-content" id="panel1d-header">
              <Typography>fancy</Typography>
            </AccordionSummary>
          </div>
          <AccordionDetails>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">Back</div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box lay2">lay</div>
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {rows.map((row) => ( */}

                  <TableRow
                    // key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <span className="table-span">
                        {" "}
                        {"10 over runs AUS(IND vs AUS)adv"}
                        <br />0{" "}
                      </span>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        197 <br />
                        5L
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        58 <br />
                        100
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      Min:100 <br />
                      Max65k
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <div className="rtlcards">
          <ExpandMore
            expand={expanded.toString()}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          ></ExpandMore>
        </div>
      </div>
      <div className="mt-3">
        <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
          <div className="accordtion-header">
            <AccordionSummary className="accortion-card" aria-controls="panel1d-content" id="panel1d-header">
              <Typography>Khado</Typography>
            </AccordionSummary>
          </div>
          <AccordionDetails>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">Back</div>
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {rows.map((row) => ( */}

                  <TableRow
                    // key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <span className="table-span">
                        {" "}
                        {"10 over runs AUS(IND vs AUS)adv"}
                        <br />0{" "}
                      </span>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        58 <br />
                        100
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      Min:100 <br />
                      Max65k
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <div className="rtlcards">
          <ExpandMore
            expand={expanded.toString()}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          ></ExpandMore>
        </div>
      </div>
      <div className="mt-3">
        <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
          <div className="accordtion-header">
            <AccordionSummary className="accortion-card" aria-controls="panel1d-content" id="panel1d-header">
              <Typography>meter</Typography>
            </AccordionSummary>
          </div>
          <AccordionDetails>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">No</div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box lay2">Yes</div>
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {rows.map((row) => ( */}

                  <TableRow
                    // key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <span className="table-span">
                        {" "}
                        {"10 over runs AUS(IND vs AUS)adv"}
                        <br />0{" "}
                      </span>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        197 <br />
                        5L
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        58 <br />
                        100
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      Min:100 <br />
                      Max65k
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <div className="rtlcards">
          <ExpandMore
            expand={expanded.toString()}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          ></ExpandMore>
        </div>
      </div>
      <div className="mt-3">
        <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
          <div className="accordtion-header">
            <AccordionSummary className="accortion-card" aria-controls="panel1d-content" id="panel1d-header">
              <Typography>oddeven</Typography>
            </AccordionSummary>
          </div>
          <AccordionDetails>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">No</div>
                    </TableCell>
                    <TableCell align="right">
                      <div className="grey-box lay2">Yes</div>
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* {rows.map((row) => ( */}

                  <TableRow
                    // key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <span className="table-span">
                        {" "}
                        {"10 over runs AUS(IND vs AUS)adv"}
                        <br />0{" "}
                      </span>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right">
                      <div className="grey-box back2">
                        197 <br />
                        5L
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      <div className="grey-box lay2">
                        58 <br />
                        100
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      {" "}
                      Min:100 <br />
                      Max65k
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <div className="rtlcards">
          <ExpandMore
            expand={expanded.toString()}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          ></ExpandMore>
        </div>
      </div>
    </Card>
  );
}

export default MatchOdds;
