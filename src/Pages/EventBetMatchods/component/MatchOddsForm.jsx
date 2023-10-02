import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import { Row } from "react-bootstrap";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormToggleSwitch from "../../../components/Common/FormComponents/FormToggleSwitch";
import moment from "moment";
import { updateMarket } from "../marketService";
import { Divider } from "@mui/material";
import { completeBet } from "../../EventBet/eventBetService";
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";

const MatchOddsForm = ({ market }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [runners, setRunners] = useState([]);
  const [winRunner, setWinRunner] = useState("");
  const [resultLoading, setResultLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: market?.name || "",
      betDelay: market?.betDelay || 0,
      minStake: market?.minStake || 0,
      maxStake: market?.maxStake || 0,
      visibleToPlayer: market?.visibleToPlayer || false,
      maxBetLiability: market?.maxBetLiability || 0,
      maxMarketLiability: market?.maxMarketLiability || 0,
      maxMarketProfit: market?.maxMarketProfit || 0,
      startDate: market?.startDate ? moment(market?.startDate).format("YYYY-MM-DD") : "",
      positionIndex: market?.positionIndex || 0,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      maxStake: Yup.number().when("minStake", (minStake, schema) =>
        schema.test({
          test: (maxStake) => !maxStake || maxStake >= minStake,
          message: "Max stake must be greater than or equal to min stake",
        })
      ),
      minStake: Yup.number().min(0, "Min stake must be greater than or equal to 0"),
      betDelay: Yup.number().required("Bet delay is required"),
      maxBetLiability: Yup.number().required("Max Bet Liability is required"),
      maxMarketLiability: Yup.number().required("Max Market Liability is required"),
      maxMarketProfit: Yup.number().required("Max Market Profit is required"),
      positionIndex: Yup.number(),
      startDate: Yup.string().required("Date is required"),
    }),
    onSubmit: async (values) => {
      if ((values.minStake || values.maxStake) && values.minStake > values.maxStake) {
        formik.setFieldError("maxStake", "Max stake must be greater than Min Stake");
        return;
      }
      setServerError(null);
      setLoading(true);
      try {
        let response = null;
        const body = {
          ...values,
          maxStake: values.maxStake || 0,
          minStake: values.minStake || 0,
          betDelay: values.betDelay || 0,
          maxBetLiability: values.maxBetLiability || 0,
          maxMarketLiability: values.maxMarketLiability || 0,
          maxMarketProfit: values?.maxMarketProfit || 0,
          positionIndex: values?.positionIndex || 0,
          _id: market?._id,
        };

        response = await updateMarket(body);

        if (response.success) {
          navigate("/event-list/");
        } else {
          setServerError(response.message);
        }
      } catch (error) {
        //console.log(error);
        if (error.response && error.response.status === 500) {
          // Server-side error occurred
          setServerError(error.response.data.message); // Set the server error message
        } else {
          // Handle other errors
        }
      } finally {
        setLoading(false); // Set loading state to false
      }
    },
  });

  useEffect(() => {
    const { market_runner } = market;
    const dropdownOptions = market_runner?.map((option) => ({
      value: option._id,
      label: option.runnerName,
    }));
    setRunners(dropdownOptions);
  }, [market]);

  const onCompleteBet = async () => {
    setResultLoading(true);
    try {
      const body = {
        marketId: market?._id,
        winRunnerId: winRunner,
      };
      const res = await completeBet(body);
      if (res.success) {
        navigate("/event-list/");
      } else {
        setServerError(res.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 500) {
        setServerError(error.response.data.message);
      }
    } finally {
      setResultLoading(false);
    }
  };

  return (
    <div>
      <CForm className="needs-validation" onSubmit={formik.handleSubmit}>
        {serverError && <p className="text-red">{serverError}</p>}

        <Row>
          <FormInput
            label="Market Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && formik.errors.name}
            isRequired="true"
            width={3}
          />
          <FormInput
            type="number"
            label="Min Stake"
            name="minStake"
            min="0"
            value={formik.values.minStake}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.minStake && formik.errors.minStake}
            isRequired="true"
            width={3}
          />

          <FormInput
            type="number"
            label="Max Stake"
            name="maxStake"
            min="0"
            value={formik.values.maxStake}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxStake && formik.errors.maxStake}
            isRequired="true"
            width={3}
          />
          <FormInput
            type="number"
            label="Bet Delay"
            name="betDelay"
            min="0"
            value={formik.values.betDelay}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.betDelay && formik.errors.betDelay}
            isRequired="true"
            width={3}
          />
        </Row>
        <Row className="mt-3">
          <FormInput
            type="number"
            min="0"
            label="Max Bet Liability"
            name="maxBetLiability"
            value={formik.values.maxBetLiability}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxBetLiability && formik.errors.maxBetLiability}
            isRequired="true"
            width={3}
          />
          <FormInput
            type="number"
            min="0"
            label="Max Market Liability"
            name="maxMarketLiability"
            value={formik.values.maxMarketLiability}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxMarketLiability && formik.errors.maxMarketLiability}
            isRequired="true"
            width={3}
          />
          <FormInput
            type="number"
            min="0"
            label="Max Market Profit"
            name="maxMarketProfit"
            value={formik.values.maxMarketProfit}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxMarketProfit && formik.errors.maxMarketProfit}
            isRequired="true"
            width={3}
          />

          <FormInput
            label="Position Index"
            name="positionIndex"
            type="number"
            min="0"
            value={formik.values.positionIndex}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.positionIndex && formik.errors.positionIndex}
            width={3}
          />

          <FormInput
            label="Start Date"
            name="startDate"
            type="date"
            value={formik.values.startDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.startDate && formik.errors.startDate}
            width={3}
            isRequired="true"
          />
        </Row>
        <Row className="mt-3">
          <CCol sm="4" md="2" lg="2">
            <CFormLabel htmlFor="visibleToPlayer">Visible To Player</CFormLabel>
            <FormToggleSwitch
              id="visibleToPlayer"
              name="visibleToPlayer"
              checked={formik.values.visibleToPlayer}
              onChange={() => {
                formik.setFieldValue("visibleToPlayer", !formik.values.visibleToPlayer);
              }}
            />
          </CCol>
        </Row>

        <div className="mt-5 mb-3">
          <CButton color="primary" type="submit" className="me-2">
            {loading ? <CSpinner size="sm" /> : "Update"}
          </CButton>

          <Link to={`${process.env.PUBLIC_URL}/event-list`} className="btn btn-danger btn-icon text-white">
            Cancel
          </Link>
        </div>
      </CForm>
      <Divider light />
      <div className="mt-5 mb-3">
        <Row className="w-100">
          <FormSelectWithSearch
            placeholder="Select Runner"
            label="Runner"
            name="winRunner"
            value={winRunner} // Set the selectedCompetition as the value
            onChange={(name, selectedValue) => setWinRunner(selectedValue)} // Update the selectedCompetition
            onBlur={() => {}} // Add an empty function as onBlur prop
            error=""
            width={3}
            options={runners}
          />
          <CCol md="3" className="mt-6">
            <CButton color="primary" type="button" className="me-2" onClick={onCompleteBet} disabled={!winRunner}>
              {resultLoading ? <CSpinner size="sm" /> : "Generate Result"}
            </CButton>
          </CCol>
        </Row>
      </div>
    </div>
  );
};

export default MatchOddsForm;
