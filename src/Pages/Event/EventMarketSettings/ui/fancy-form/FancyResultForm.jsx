import { CButton, CCol } from "@coreui/react";
import React, { useState } from "react";
import { Row } from "react-bootstrap";
import FormInput from "../../../../../components/Common/FormComponents/FormInput";
import { showConfirmAlert } from "../../../../../utils/confirmUtils";
import { Notify } from "../../../../../utils/notify";
import { generateFancyResult, revertMarketResult } from "../../../../EventBet/eventBetService";

function FancyResultForm({ market, onResultGenerate, onResultRevert }) {
  const [winScore, setWinScore] = useState(market?.winScore || 0);
  const [error, setError] = useState("");
  const [resultDeclared, setResultDeclared] = useState(!!market?.winScore);

  const generateResult = async () => {
    const result = await generateFancyResult({
      marketId: market.marketId,
      marketRunnerId: market._id,
      winScore,
    });
    if (result.success) {
      Notify.success(`Result Generated for ${market.name}.`);
      onResultGenerate({ marketId: market._id, winScore });
      setResultDeclared(true);
    } else {
      Notify.error(`Error: ${result.message || "Something went wrong!"}`);
    }
  };

  const revertResult = async () => {
    const result = await revertMarketResult({ marketId: market._id });
    if (result.success) {
      Notify.success(`Result Reverted for ${market.name}.`);
      setWinScore(0);
      onResultRevert({ marketId: market._id });
      setResultDeclared(false);
    } else {
      Notify.error(`Error: ${result.message || "Something went wrong!"}`);
    }
  };

  const handleGenerateResult = () => {
    if (winScore === "" || winScore < 0) {
      setError("Invalid Win Score");
      return;
    }
    setError("");
    showConfirmAlert("Are you sure you want to Generate Result?", generateResult);
  };

  const handleRevertResult = () => {
    showConfirmAlert("Are you sure you want to Revert Result?", revertResult);
  };

  return (
    <Row className="pb-1">
      <FormInput
        label="Win Score"
        name="winScore"
        type="number"
        value={winScore}
        onChange={(e) => {
          setWinScore(e.target.value);
          setError("");
        }}
        error={error}
        width={3}
      />

      <CCol md={6} className="d-flex align-items-center mt-6 pt-1">
        <CButton
          disabled={winScore === "" || resultDeclared}
          color="blue"
          type="submit"
          className="me-3 py-1 fw-bolder"
          onClick={handleGenerateResult}
        >
          <i className="fa fa-bar-chart-o me-1" /> GENERATE RESULT
        </CButton>
        <CButton
          disabled={!resultDeclared}
          color="danger"
          type="reset"
          className="py-1 fw-bolder"
          onClick={handleRevertResult}
        >
          <i className="fa fa-history me-1" /> REVERT RESULT
        </CButton>
      </CCol>
    </Row>
  );
}

export default FancyResultForm;
