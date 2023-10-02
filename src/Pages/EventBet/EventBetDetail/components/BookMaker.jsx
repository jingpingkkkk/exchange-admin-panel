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
};

const socketUrl = process.env.REACT_APP_SOCKET_URL;
const marketUrl = `${socketUrl}/market`;

function BookMaker({ market, matchWinLoss }) {
  const socket = useMemo(() => io(marketUrl, { autoConnect: false }), []);
  const [runnerOdds, setRunnerOdds] = useState(emptyOdds);
  const [min, setMin] = useState(market.minStake);
  const [max, setMax] = useState(market.maxStake);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("join:market", {
        id: market.marketId,
        type: "bookamkers",
      });
    });
    socket.on(`market:data:${market.marketId}`, (data) => {
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
        setRunnerOdds({ 0: teamOneData, 1: teamTwoData });
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
            <TableCell className="odds w-40"></TableCell>
            <TableCell align="right" className="odds w-10">
              <span title={`Min:${shortNumber(min)}`}>
                Min:<span>{shortNumber(min)}</span>
              </span>
            </TableCell>
            <TableCell align="right" className="odds w-10">
              <span className="tableSpan">
                <span className="max-bet">
                  <span className="ps-2" title={`Max:${shortNumber(max)}`}>
                    Max:<span>{shortNumber(max)}</span>
                  </span>
                </span>
              </span>
            </TableCell>
            <TableCell align="right" className="odds w-10">
              <div className="grey-box back2">Back</div>
            </TableCell>
            <TableCell align="right" className="odds w-10">
              <div className="grey-box lay2">Lay</div>
            </TableCell>
            <TableCell align="right" className="odds w-10"></TableCell>
            <TableCell align="right" className="odds w-10"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {market?.market_runner?.map((runner, index) => {
            const totalWin =
              matchWinLoss
                ?.find((match) => match?._id === market?._id)
                ?.market_runner?.find((market_runer) => market_runer?._id === runner?._id)?.totalWin || 0;
            return (
              <TableRow key={runner._id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row" className="odds">
                  <span className="table-span">
                    {runner?.runnerName}
                    <br />
                    <span className="text-success">{totalWin}</span>
                  </span>
                </TableCell>
                {runnerOdds[index]?.back
                  ?.map((odd, i) => (
                    <TableCell
                      align="right"
                      className={`odds ${runner?.matchOdds?.status === "SUSPENDED" ? "suspendedtext" : ""}`}
                      key={i}
                      data-title={runner?.matchOdds?.status}
                    >
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
                    <TableCell
                      align="right"
                      className={`odds ${runner?.matchOdds?.status === "SUSPENDED" ? "suspendedtext" : ""}`}
                      key={i}
                      data-title={runner?.matchOdds?.status}
                    >
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default BookMaker;
