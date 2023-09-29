import { CSpinner } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { getDetailByID } from "./accountService";

const fetchUserBalance = async (id = null) => {
  if (!id) return {};
  const user = await getDetailByID(id, { balance: 1, exposure: 1 });
  return user;
};

const TransactionModal = ({ show, onHide, handleTransactionSubmit, rowData, transactionType }) => {
  const modalHeaderClass = transactionType === "credit" ? "bg-success" : "bg-danger";
  const transactionText = transactionType === "credit" ? "Deposit" : "Withdraw";

  const [parentBalance, setParentBalance] = useState(0);
  const [parentNewBalance, setParentNewBalance] = useState(0);
  const [clickedUserBalance, setClickedUserBalance] = useState(0);
  const [clickedUserNewBalance, setClickedUserNewBalance] = useState(0);
  const [withdrawCapacity, setWithdrawCapacity] = useState(0);

  const [amount, setAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [transactionCode, setTransactionCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ amount: "", remarks: "", transactionCode: "" });

  const resetForm = () => {
    setTransactionCode("");
    setWithdrawCapacity(0);
    setClickedUserBalance(0);
    setClickedUserNewBalance(0);
    setParentBalance(0);
    setParentNewBalance(0);
    setAmount("");
    setRemarks("");
    setTransactionCode("");
    setErrors({ amount: "", remarks: "", transactionCode: "" });
  };

  const handleModalClose = () => {
    resetForm();
    onHide();
  };

  useEffect(() => {
    if (rowData) {
      setLoading(true);
      Promise.all([fetchUserBalance(rowData?.parentId), fetchUserBalance(rowData?._id)])
        .then(([parent, user]) => {
          setParentBalance(parent.balance);
          setClickedUserBalance(user.balance);
          setWithdrawCapacity(Number(user.balance) - Number(user.exposure));
        })
        .finally(() => setLoading(false));
    }
    return () => {
      resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData._id, transactionType, onHide]);

  const handleAmountChange = (event) => {
    const amount = event.target.value ? Number(event.target.value) : "";
    setAmount(amount);
    if (amount === "") {
      return;
    }
    let newParentBalance = 0;
    let clickedUserNewBalance = 0;
    if (transactionType === "credit") {
      newParentBalance = Number(parentBalance) - amount;
      clickedUserNewBalance = Number(clickedUserBalance) + amount;
    } else {
      newParentBalance = Number(parentBalance) + amount;
      clickedUserNewBalance = Number(clickedUserBalance) - amount;
      if (amount > withdrawCapacity) {
        setErrors({ ...errors, amount: `Amount cannot be greater than ${withdrawCapacity}` });
      }
    }
    setParentNewBalance(newParentBalance);
    setClickedUserNewBalance(clickedUserNewBalance);
  };

  const validateForm = () => {
    let hasErrors = false;
    const currentErrors = { ...errors };
    if (!amount) {
      currentErrors.amount = "Amount is required";
      hasErrors = true;
    } else {
      currentErrors.amount = "";
    }
    if (!remarks) {
      currentErrors.remarks = "Remarks is required";
      hasErrors = true;
    } else {
      currentErrors.remarks = "";
    }
    if (!transactionCode) {
      currentErrors.transactionCode = "Transaction Code is required";
      hasErrors = true;
    } else {
      currentErrors.transactionCode = "";
    }
    setErrors(currentErrors);
    return hasErrors;
  };

  const handleSubmit = () => {
    const hasErrors = validateForm();
    if (hasErrors) {
      return;
    }
    handleTransactionSubmit(amount, remarks, transactionCode, transactionType, rowData._id);
  };

  return (
    <Modal size="md" show={show} onHide={onHide}>
      <Modal.Header closeButton className={`text-white ${modalHeaderClass}`}>
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
              <Form.Label htmlFor="inputName" className="col-md-4 form-label fw-semibold text-end">
                {rowData?.parentUser?.username}
              </Form.Label>
              <div className="col-md-4">
                <Form.Control type="number" value={parentBalance} readOnly />
              </div>
              <div className="col-md-4">
                <Form.Control type="number" value={parentNewBalance} readOnly />
              </div>
            </div>

            <div className="row mb-4">
              <Form.Label htmlFor="inputName" className="col-md-4 form-label fw-semibold text-end">
                {rowData?.username}
              </Form.Label>
              <div className="col-md-4">
                <Form.Control type="number" value={clickedUserBalance} readOnly />
              </div>
              <div className="col-md-4">
                <Form.Control type="number" value={clickedUserNewBalance} readOnly />
              </div>
            </div>

            {transactionType === "debit" ? (
              <div className="row mb-4">
                <Form.Label htmlFor="inputName" className="col-md-4 form-label text-end">
                  Withdraw Capacity
                </Form.Label>
                <div className="col-md-8">
                  <Form.Control type="number" value={withdrawCapacity} readOnly />
                </div>
              </div>
            ) : null}

            <div className="row mb-4">
              <Form.Label htmlFor="inputName" className="col-md-4 form-label text-end">
                Amount <span className="text-danger">*</span>
              </Form.Label>
              <div className="col-md-8">
                <Form.Control type="number" value={amount} onChange={handleAmountChange} />
                {errors.amount && <p className="text-danger">{errors.amount}</p>}
              </div>
            </div>

            <div className="row mb-4">
              <Form.Label htmlFor="inputName" className="col-md-4 form-label text-end">
                Remarks <span className="text-danger">*</span>
              </Form.Label>
              <div className="col-md-8">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ resize: "none" }}
                />
                {errors.remarks && <p className="text-danger">{errors.remarks}</p>}
              </div>
            </div>

            <div className="row mb-4">
              <Form.Label htmlFor="inputName" className="col-md-4 form-label text-end">
                Transaction Code <span className="text-danger">*</span>
              </Form.Label>
              <div className="col-md-8">
                <Form.Control
                  type="password"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  autoComplete="off"
                />
                {errors.transactionCode && <p className="text-danger">{errors.transactionCode}</p>}
              </div>
            </div>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleModalClose()}>
          Close
        </Button>
        <Button variant="primary" onClick={() => handleSubmit()}>
          {transactionText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionModal;
