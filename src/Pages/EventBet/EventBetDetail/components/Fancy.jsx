/* eslint-disable no-nested-ternary */
/* eslint-disable no-plusplus */
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import "../../eventBetDetail.css";
import { io } from "socket.io-client";
import shortNumber from "../../../../helper/number";
import { Spinner } from "react-bootstrap";

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

function Fancy({ market }) {
  const socket = useMemo(() => io(marketUrl, { autoConnect: false }), []);
  const [runnerOdds, setRunnerOdds] = useState(emptyOdds);
  const [fancyRunners, setFancyRunners] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(!runnerOdds?.length);
    socket.on("connect", () => {
      socket.emit("join:market", {
        id: market.apiEventId,
        type: "fancy",
      });
    });

    socket.on(`market:data:${market.apiEventId}`, (data) => {
      if (Object.keys(data).length > 0) {
        setLoading(false);
        const teamData = data?.map((item) => ({
          runnerId: item?.runnerId,
          back: { price: item.BackPrice1, size: item.BackSize1 },
          lay: { price: item.LayPrice1, size: item.LaySize1 },
        }));
        setRunnerOdds(teamData);
        setFancyRunners(data);
      }
      setLoading(false);
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
            <TableCell className="odds w-65"></TableCell>
            <TableCell align="right" className="odds w-5"></TableCell>
            <TableCell align="right" className="odds w-10">
              <div className="grey-box lay2">No</div>
            </TableCell>
            <TableCell align="right" className="odds w-10">
              <div className="grey-box back2">Yes</div>
            </TableCell>
            <TableCell align="right" className="odds w-10"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell className="odds w-65" colSpan={5}>
                <div className="col-md-12 text-center p-4">
                  <Spinner animation="border" />
                </div>
              </TableCell>
            </TableRow>
          ) : fancyRunners?.length ? (
            fancyRunners?.map((runner) => {
              const odds = runnerOdds?.length ? runnerOdds?.find((item) => item?.runnerId === runner?.runnerId) : {};
              return (
                <TableRow
                  key={runner.runnerId}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  className="odds"
                >
                  <TableCell component="th" scope="row" className="odds">
                    <span className="table-span">
                      {runner?.RunnerName || ""}
                      <br />0
                    </span>
                  </TableCell>
                  <TableCell className="odds"></TableCell>
                  <TableCell
                    align="right"
                    className={`odds ${runner?.GameStatus === "SUSPENDED" ? "suspendedtext" : ""} ${
                      runner?.GameStatus === "Ball Running" ? "suspendedtext" : ""
                    }`}
                    data-title={runner?.GameStatus}
                  >
                    <div className="grey-box lay2">
                      {odds?.lay?.price && odds?.lay?.price !== 0 ? (
                        <>
                          <span className="d-block odds">
                            {odds?.lay?.price ? parseFloat(odds?.lay?.price.toFixed(2)) : "-"}
                          </span>
                          <span className="d-block">{odds?.lay?.size ? shortNumber(odds?.lay?.size, 2) : 0}</span>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                    {runner?.LayPrice2 && runner?.LayPrice2 !== 0 && runner?.BackPrice2 && runner?.BackPrice2 !== 0 ? (
                      <div className="grey-box lay2">
                        {runner?.LayPrice2 && runner?.LayPrice2 !== 0 ? (
                          <>
                            <span className="d-block odds">
                              {runner?.LayPrice2 && runner?.LayPrice2
                                ? parseFloat(runner?.LayPrice2 && runner?.LayPrice2.toFixed(2))
                                : "-"}
                            </span>
                            <span className="d-block">{runner?.LaySize2 ? shortNumber(runner?.LaySize2, 2) : 0}</span>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                    {runner?.LayPrice3 && runner?.LayPrice3 !== 0 && runner?.BackPrice3 && runner?.BackPrice3 !== 0 ? (
                      <div className="grey-box lay2">
                        {runner?.LayPrice3 && runner?.LayPrice3 !== 0 ? (
                          <>
                            <span className="d-block odds">
                              {runner?.LayPrice3 && runner?.LayPrice3
                                ? parseFloat(runner?.LayPrice3 && runner?.LayPrice3.toFixed(2))
                                : "-"}
                            </span>
                            <span className="d-block">{runner?.LaySize2 ? shortNumber(runner?.LaySize2, 2) : 0}</span>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                  </TableCell>
                  <TableCell
                    align="right"
                    className={`odds ${runner?.GameStatus === "SUSPENDED" ? "suspendedtext" : ""} ${
                      runner?.GameStatus === "Ball Running" ? "suspendedtext" : ""
                    }`}
                    data-title={runner?.GameStatus}
                  >
                    <div className="grey-box back2">
                      {odds?.back?.price && odds?.back?.price !== 0 ? (
                        <>
                          <span className="d-block odds">
                            {odds?.back?.price ? parseFloat(odds?.back?.price?.toFixed(2)) : "-"}
                          </span>
                          <span className="d-block">{odds?.back?.size ? shortNumber(odds.back?.size, 2) : 0}</span>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                    {runner?.LayPrice2 && runner?.LayPrice2 !== 0 && runner?.BackPrice2 && runner?.BackPrice2 !== 0 ? (
                      <div className="grey-box back2">
                        {runner?.BackPrice2 && runner?.BackPrice2 !== 0 ? (
                          <>
                            <span className="d-block odds">
                              {runner?.BackPrice2 ? parseFloat(runner?.BackPrice2?.toFixed(2)) : "-"}
                            </span>
                            <span className="d-block">{runner?.BackSize2 ? shortNumber(runner?.BackSize2, 2) : 0}</span>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                    {runner?.LayPrice3 && runner?.LayPrice3 !== 0 && runner?.BackPrice3 && runner?.BackPrice3 !== 0 ? (
                      <div className="grey-box back2">
                        {runner?.BackPrice3 && runner?.BackPrice3 !== 0 ? (
                          <>
                            <span className="d-block odds">
                              {runner?.BackPrice3 ? parseFloat(runner?.BackPrice3?.toFixed(2)) : "-"}
                            </span>
                            <span className="d-block">{runner?.BackSize2 ? shortNumber(runner?.BackSize2, 2) : 0}</span>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                  </TableCell>
                  <TableCell align="right" className="odds">
                    <div>
                      <span title={`Min:${shortNumber(runner.min, 0)}`}>
                        Min:<span>{shortNumber(runner.min, 0)}</span>
                      </span>
                    </div>
                    <div>
                      <span className="ps-2" title={`Max:${shortNumber(runner.max, 0)}`}>
                        Max:<span>{shortNumber(runner.max, 0)}</span>
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell className="odds w-100" colSpan={5}>
                <div className="grey-box">No Data</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Fancy;
