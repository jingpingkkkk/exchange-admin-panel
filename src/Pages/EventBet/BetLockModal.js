import { CSpinner } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { getAllBet } from "./eventBetService";

const BetLockModal = ({ show, onHide, betList }) => {
  const [userId, setUserId] = useState();

  const [loading, setLoading] = useState(false);
  const transactionText = "All Bet";
  console.log("nnnn");
  console.log(betList);

  return (
    <Modal size="xl" show={show} onHide={onHide} aria-labelledby="example-modal-sizes-title-lg">
      <Modal.Header closeButton>
        <Modal.Title className="mb-0">{transactionText}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="w-100 d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
            <CSpinner />
          </div>
        ) : (
          <Form className="form-horizontal">
            <div className="row mb-4">
              <div className="table-responsive">
                <table className="table coupon-table mb-0">
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>UserName</th>
                      <th>Type</th>
                      <th>Nation</th>
                      <th className="text-right">Rate</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Date</th>
                      <th className="text-right">IP</th>
                      <th className="text-right">B Detail</th>
                      {/* <th className="text-right">B Detail</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {betList.map((bet, bet_index) => (
                      <tr key={bet_index} className={`${bet.isBack ? "back0" : "lay2"}`}>
                        <td className="text-right">{bet_index + 1}</td>
                        <td className="text-right">{bet.userName}</td>
                        <td className="text-right">{bet.marketName}</td>
                        <td className="text-right">{bet.runnerName}</td>
                        <td className="text-right">{bet.odds}</td>
                        <td className="text-right">{bet.stake}</td>
                        <td className="text-right">{new Date(bet.createdAt).toLocaleString()}</td>
                        <td className="text-right">{bet.ipAddress}</td>
                        <td className="text-right">
                          <OverlayTrigger placement="top" overlay={<Tooltip>{bet.deviceInfo}</Tooltip>}>
                            <span>Detail</span>
                          </OverlayTrigger>
                        </td>

                        {/* <td className="text-right">{bet.stake}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Form>
        )}
      </Modal.Body>

      {/* <Modal.Footer>
        <Button variant="secondary" onClick={() => handleModalClose()}>
          Close
        </Button>
        <Button variant="primary" onClick={() => handleSubmit()}>
          {transactionText}
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
};

export default BetLockModal;
