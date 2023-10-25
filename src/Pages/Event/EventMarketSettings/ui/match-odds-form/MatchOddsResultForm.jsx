import { CButton, CCol } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import FormSelectWithSearch from "../../../../../components/Common/FormComponents/FormSelectWithSearch";
import { showConfirmAlert } from "../../../../../utils/confirmUtils";
import { Notify } from "../../../../../utils/notify";
import { generateMatchOddsResult, revertMarketResult } from "../../../../EventBet/eventBetService";

function MatchOddsResultForm({ market, onResultGenerate, onResultRevert }) {
  const [runnerOptions, setRunnerOptions] = useState([]);
  const [selectedRunner, setSelectedRunner] = useState(market?.winnerRunnerId || null);
  const [resultDeclared, setResultDeclared] = useState(!!market?.winnerRunnerId);

  useEffect(() => {
    const options = market?.market_runner?.map((runner) => ({
      value: runner._id,
      label: runner.runnerName,
    }));
    setRunnerOptions(options);
    return () => {
      setRunnerOptions([]);
      setSelectedRunner(null);
    };
  }, [market, market?.market_runner, market?.winnerRunnerId]);

  const generateResult = async () => {
    const result = await generateMatchOddsResult({
      marketId: market._id,
      winRunnerId: selectedRunner,
    });
    if (result.success) {
      Notify.success(`Result Generated for ${market.name}.`);
      onResultGenerate({ marketId: market._id, runnerId: selectedRunner });
      setResultDeclared(true);
    } else {
      Notify.error(`Error: ${result.message || "Something went wrong!"}`);
    }
  };

  const revertResult = async () => {
    const result = await revertMarketResult({ marketId: market._id });
    if (result.success) {
      Notify.success(`Result Reverted for ${market.name}.`);
      setSelectedRunner(null);
      onResultRevert({ marketId: market._id });
      setResultDeclared(false);
    } else {
      Notify.error(`Error: ${result.message || "Something went wrong!"}`);
    }
  };

  const handleGenerateResult = () => {
    showConfirmAlert("Are you sure you want to Generate Result?", generateResult);
  };

  const handleRevertResult = () => {
    showConfirmAlert("Are you sure you want to Revert Result?", revertResult);
  };

  return (
    <Row className="pb-1">
      <FormSelectWithSearch
        label="Winner Runner"
        value={selectedRunner}
        onChange={(name, selectedValue) => setSelectedRunner(selectedValue)}
        onBlur={() => {}}
        error=""
        width={3}
        options={runnerOptions}
      />

      <CCol md={6} className="d-flex align-items-center mt-6 pt-1">
        <CButton
          disabled={!selectedRunner || resultDeclared}
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

export default MatchOddsResultForm;
