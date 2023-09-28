import { CSpinner } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { getDetailByID } from "./accountService";

const TransactionModal = ({ show, onHide, handleTransactionSubmit, rowData, transactionType }) => {
  const [userId, setUserId] = useState();

  const [parentName, setParentName] = useState();
  const [parentBalance, setParentBalance] = useState(0);
  const [parentNewBalance, setParentNewBalance] = useState(0);
  const [clickedUserName, setClickedUserName] = useState();
  const [clickedUserBalance, setClickedUserBalance] = useState(0);
  const [clickedUserNewBalance, setClickedUserNewBalance] = useState(0);
  const [clickedUserProfit, setClickedUserProfit] = useState(0);
  const [clickedUserNewProfit, setClickedUserNewProfit] = useState(0);
  const [transactionCode, setTransactionCode] = useState("");
  const [amount, setAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    amount: "",
    remarks: "",
    transactionCode: "",
  });

  const fetchParent = async () => {
    if (!rowData) return {};
    const user = await getDetailByID(rowData.parentId, { balance: 1 });
    return user;
  };

  const fetchUser = async () => {
    if (!rowData) return {};
    const user = await getDetailByID(rowData._id, { balance: 1 });
    return user;
  };

  useEffect(() => {
    if (rowData) {
      setParentName(rowData.parentUser.username);
      setClickedUserName(rowData.username);
      setUserId(rowData._id);
      setLoading(true);
      Promise.all([fetchParent(), fetchUser()])
        .then(([parent, user]) => {
          setParentBalance(parent.balance);
          setClickedUserBalance(user.balance);
          setClickedUserProfit(user.profit ?? 0);
        })
        .finally(() => setLoading(false));
    }
    setClickedUserNewProfit(0);
    setClickedUserNewBalance(0);
    setParentNewBalance(0);
    setAmount("");
    setRemarks("");
    setTransactionCode("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData, transactionType, onHide]);

  const handleAmountChange = (event) => {
    const { value } = event.target;
    const Amount = parseFloat(value) && parseFloat(value) > 0 ? parseFloat(value) : 0;
    let newParentBalance = 0;
    let clickedUserNewBalance = 0;
    let clickedUserNewProfit = 0;

    // Calculate the new parent balance and profit
    if (transactionType === "credit") {
      newParentBalance = Number(parentBalance) - Amount;
      clickedUserNewBalance = Number(clickedUserBalance) + Amount;
      clickedUserNewProfit = Number(clickedUserProfit) + Amount;
    } else {
      newParentBalance = Number(parentBalance) + Amount;
      clickedUserNewBalance = Number(clickedUserBalance) - Amount;
      clickedUserNewProfit = clickedUserProfit ? Number(clickedUserProfit) - Amount : 0;
    }

    setAmount(Amount);
    setParentNewBalance(newParentBalance);
    setClickedUserNewBalance(clickedUserNewBalance);
    setClickedUserNewProfit(clickedUserNewProfit);
  };
  const modalHeaderClass = transactionType === "credit" ? "bg-success" : "bg-danger";
  const transactionText = transactionType === "credit" ? "Deposit" : "Withdraw";

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

  const handleModalClose = () => {
    setAmount("");
    setRemarks("");
    setTransactionCode("");
    setErrors({ amount: "", remarks: "", transactionCode: "" });
    onHide();
  };

  const handleSubmit = () => {
    const hasErrors = validateForm();
    if (hasErrors) {
      return;
    }
    handleTransactionSubmit(amount, remarks, transactionCode, transactionType, userId);
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
                {parentName}
              </Form.Label>
              <div className="col-md-4">
                <Form.Control
                  type="number"
                  value={parentBalance}
                  onChange={(e) => setParentBalance(e.target.value)}
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <Form.Control
                  type="number"
                  value={parentNewBalance}
                  onChange={(e) => setParentNewBalance(e.target.value)}
                  readOnly
                />
              </div>
            </div>

            <div className="row mb-4">
              <Form.Label htmlFor="inputName" className="col-md-4 form-label fw-semibold text-end">
                {clickedUserName}
              </Form.Label>
              <div className="col-md-4">
                <Form.Control
                  type="number"
                  value={clickedUserBalance}
                  onChange={(e) => setClickedUserBalance(e.target.value)}
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <Form.Control
                  type="number"
                  value={clickedUserNewBalance}
                  onChange={(e) => setClickedUserNewBalance(e.target.value)}
                  readOnly
                />
              </div>
            </div>

            <div className=" row mb-4">
              <Form.Label htmlFor="inputName" className="col-md-4 form-label text-end">
                Profit/Loss
              </Form.Label>
              <div className="col-md-4">
                <Form.Control
                  type="number"
                  value={clickedUserProfit}
                  onChange={(e) => setClickedUserProfit(e.target.value)}
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <Form.Control
                  type="number"
                  value={clickedUserNewProfit}
                  onChange={(e) => setClickedUserNewProfit(e.target.value)}
                  readOnly
                />
              </div>
            </div>

            <div className=" row mb-4">
              <Form.Label htmlFor="inputName" className="col-md-4 form-label text-end">
                Amount <span className="text-danger">*</span>
              </Form.Label>
              <div className="col-md-8">
                <Form.Control type="number" value={amount} onChange={handleAmountChange} autoComplete="off" />
                {errors.amount && <p className="text-danger">{errors.amount}</p>}
              </div>
            </div>

            <div className=" row mb-4">
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

            <div className=" row mb-4">
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
