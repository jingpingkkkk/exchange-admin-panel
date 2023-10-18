import { CButton, CCol } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import FormSelectWithSearch from "../../../../../components/Common/FormComponents/FormSelectWithSearch";
import { showConfirmAlert } from "../../../../../utils/confirmUtils";

function MatchOddsResultForm({ market }) {
  const [runnerOptions, setRunnerOptions] = useState([]);
  const [selectedRunner, setSelectedRunner] = useState(null);

  useEffect(() => {
    const options = market?.market_runner?.map((runner) => ({
      value: runner._id,
      label: runner.runnerName,
    }));
    setRunnerOptions(options);
    const winnerRunner = market.winnerRunnerId
      ? options.find((runner) => runner.value === market.winnerRunnerId)
      : null;
    setSelectedRunner(winnerRunner);
    return () => {
      setRunnerOptions([]);
      setSelectedRunner(null);
    };
  }, [market, market?.market_runner, market.winnerRunnerId]);

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
      <FormSelectWithSearch
        label="Select Runner"
        value={selectedRunner}
        onChange={(name, selectedValue) => setSelectedRunner(selectedValue)}
        onBlur={() => {}}
        error=""
        width={3}
        options={runnerOptions}
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

export default MatchOddsResultForm;
