/* eslint-disable no-nested-ternary */
/* eslint-disable no-plusplus */
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import "../../eventBetDetail.css";
import { io } from "socket.io-client";
import shortNumber from "../../../../helper/number";

const emptyOdds = {
  0: {
    back: [
      { price: 0, level: 0 },
      { price: 0, level: 1 },
      { price: 0, level: 2 },
    ],
    lay: [
      { price: 0, level: 0 },
      { price: 0, level: 1 },
      { price: 0, level: 2 },
    ],
  },
  1: {
    back: [
      { price: 0, level: 0 },
      { price: 0, level: 1 },
      { price: 0, level: 2 },
    ],
    lay: [
      { price: 0, level: 0 },
      { price: 0, level: 1 },
      { price: 0, level: 2 },
    ],
  },
  2: {
    back: [
      { price: 0, level: 0 },
      { price: 0, level: 1 },
      { price: 0, level: 2 },
    ],
    lay: [
      { price: 0, level: 0 },
      { price: 0, level: 1 },
      { price: 0, level: 2 },
    ],
  },
};

const socketUrl = process.env.REACT_APP_SOCKET_URL;
const marketUrl = `${socketUrl}/market`;

function MatchOdds({ market }) {
  const socket = useMemo(() => io(marketUrl, { autoConnect: false }), []);
  const [runnerOdds, setRunnerOdds] = useState(emptyOdds);
  const [min, setMin] = useState(market.minStake);
  const [max, setMax] = useState(market.maxStake);
  console.log(market);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connect");
      socket.emit("join:market", {
        id: market.apiMarketId,
        type: "match_odds",
      });
    });

    socket.on(`market:data:${market.apiMarketId}`, (data) => {
      console.log("data", data);
      if (data) {
        const { matchOdds } = data;
        const [teamOne, teamTwo, teamThree] = matchOdds;

        const teamOneData = { back: [], lay: [] };
        const teamTwoData = { back: [], lay: [] };
        const teamThreeData = { back: [], lay: [] };

        for (let i = 0; i < 3; i++) {
          teamOneData.back.push(teamOne.back[i] || {});
          teamOneData.lay.push(teamOne.lay[i] || {});
          teamTwoData.back.push(teamTwo.back[i] || {});
          teamTwoData.lay.push(teamTwo.lay[i] || {});
          teamThreeData.back.push(teamThree?.back[i] || {});
          teamThreeData.lay.push(teamThree?.lay[i] || {});
        }
        setRunnerOdds({ 0: teamOneData, 1: teamTwoData, 2: teamThreeData });
        setMin(data?.min || 0);
        setMax(data?.max || 0);
      }
    });

    socket.connect();
    return () => {
      socket.off("connect");
      socket.off(`market:data:${market.apiMarketId}`);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market]);

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="odds"></TableCell>
            <TableCell align="right" className="odds"></TableCell>
            <TableCell align="right" className="odds"></TableCell>
            <TableCell align="right" className="odds"></TableCell>
            <TableCell align="right" className="odds">
              <span className="tableSpan"> 1.3L </span>
            </TableCell>
            <TableCell align="right" className="odds">
              <div className="grey-box back2">Back</div>
            </TableCell>
            <TableCell align="right" className="odds">
              <div className="grey-box lay2">Lay</div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {market?.market_runner?.map((runner, index) => {
            return (
              <TableRow key={runner.runnerId} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  <span className="table-span">
                    {runner?.runnerName}
                    <br />0
                  </span>
                </TableCell>
                {runnerOdds[index]?.back
                  ?.map((odd, i) => (
                    <TableCell align="right" className="odds" key={i}>
                      <div className="grey-box back2">
                        {odd?.price && odd.price !== 0 ? (
                          <>
                            <span className="d-block odds">{odd?.price ? parseFloat(odd.price.toFixed(2)) : "-"}</span>
                            <span className="d-block">{odd?.size ? shortNumber(odd.size, 2) : 0}</span>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </TableCell>
                  ))
                  .reverse()}

                {runnerOdds[index]?.lay
                  ?.map((odd, i) => (
                    <TableCell align="right" className="odds" key={i}>
                      <div className="grey-box lay2">
                        {odd?.price && odd.price !== 0 ? (
                          <>
                            <span className="d-block odds">{odd?.price ? parseFloat(odd.price.toFixed(2)) : "-"}</span>
                            <span className="d-block">{odd?.size ? shortNumber(odd.size, 2) : 0}</span>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </TableCell>
                  ))
                  .reverse()}

                {/* <TableCell align="right" className="odds">
                  <div className="grey-box back2">
                    2.345 <br />
                    10.38k
                  </div>
                </TableCell> */}
              </TableRow>
            );
          })}

          {/* ))}  */}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MatchOdds;
