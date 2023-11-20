import { ExpandMore } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CardActions, Collapse, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import BetLockModal from "../../BetLockModal";
import { getAllBet } from "../../eventBetService";
import "./userbets.css";

function UserBets({ eventId }) {
  const [betList, setBetList] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [show, setShow] = useState(true);
  const [showBetLockModal, setShowBetLockModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const betData = await getAllBet(eventId);
      setBetList(betData);
      setLoading(false);
    };

    const interval = setInterval(async () => {
      await fetchData();
    }, 1000 * 10);
    return () => {
      clearInterval(interval);
    };
  }, [eventId]);

  return (
    <Card className="card ms-2">
      <BetLockModal show={showBetLockModal} onHide={() => setShowBetLockModal(false)} betList={betList} />
      <CardActions className="card-header bg-primary br-tr-3 br-tl-3">
        <h3 className="card-title text-white">MY BETS</h3>

        <div className="rtlcards ">
          <Button variant="success" onClick={() => setShowBetLockModal(true)} className="btn" title="Deposit">
            View More
          </Button>

          <ExpandMore
            expand={expanded.toString()}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
            className=" text-white"
            style={{ cursor: "pointer" }}
          >
            <ExpandMoreIcon className=" text-white" />
          </ExpandMore>

          {/* <IconButton
            size="small"
            edge="start"
            color="inherit"
            onClick={() => setShow(false)}
            aria-label="close"
          ></IconButton> */}
        </div>
      </CardActions>

      <Collapse in={expanded} timeout="auto">
        <div className="card-body coupon-table-card">
          <div className="table-responsive">
            <table className="table coupon-table mb-0">
              <thead>
                <tr>
                  <th>UserName</th>
                  <th>Type</th>
                  <th>Nation</th>
                  <th className="text-end">Rate</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} align="center">
                      <Spinner animation="border" />
                    </td>
                  </tr>
                ) : !betList?.length ? (
                  <tr>
                    <td colSpan={5} align="center">
                      No Data
                    </td>
                  </tr>
                ) : (
                  betList.map((bet, bet_index) => (
                    <tr key={bet_index} className={`${bet.isBack ? "back2" : "lay2"}`}>
                      <td className="text-cente">{bet.userName}</td>
                      <td className="text-cente">{bet.marketName}</td>
                      <td className="text-cente">{bet.runnerName}</td>
                      <td className="text-end">{bet.odds}</td>
                      <td className="text-end">{bet.stake}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Collapse>
    </Card>
  );
}

export default UserBets;
