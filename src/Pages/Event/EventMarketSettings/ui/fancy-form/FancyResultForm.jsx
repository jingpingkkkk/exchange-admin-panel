import { CButton, CCol } from "@coreui/react";
import React, { useState } from "react";
import { Row } from "react-bootstrap";
import FormInput from "../../../../../components/Common/FormComponents/FormInput";
import { showConfirmAlert } from "../../../../../utils/confirmUtils";

function FancyResultForm({ market, runner = {} }) {
  const [winScore, setWinScore] = useState(runner.winScore || 0);
  const [error, setError] = useState("");

  const generateResult = async () => {
    console.log("result generated");
  };

  const revertResult = async () => {
    console.log("result reverted");
  };

  const handleGenerateResult = () => {
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
        onChange={setWinScore}
        error={error}
        width={3}
        isRequired="true"
      />

      <CCol md={6} className="d-flex align-items-center mt-6 pt-1">
        <CButton color="blue" type="submit" className="me-3 py-1 fw-bolder" onClick={handleGenerateResult}>
          <i className="fa fa-bar-chart-o me-1" /> GENERATE RESULT
        </CButton>
        <CButton color="danger" type="reset" className="py-1 fw-bolder" onClick={handleRevertResult}>
          <i className="fa fa-history me-1" /> REVERT RESULT
        </CButton>
      </CCol>
    </Row>
  );
}

export default FancyResultForm;
