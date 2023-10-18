import { CButton, CCol, CForm, CFormLabel } from "@coreui/react";
import { useFormik } from "formik";
import moment from "moment";
import React from "react";
import { Row } from "react-bootstrap";
import * as Yup from "yup";
import FormInput from "../../../../../components/Common/FormComponents/FormInput";
import FormToggleSwitch from "../../../../../components/Common/FormComponents/FormToggleSwitch";
import MatchOddsResultForm from "./FancyResultForm";

function FancyForm({ market = {} }) {
  const initialValues = {
    name: market.name,
    minStake: market.minStake || 0,
    maxStake: market.maxStake || 0,
    betDelay: market.betDelay || 0,
    minBetLiability: market.minBetLiability || 0,
    maxBetLiability: market.maxBetLiability || 0,
    maxMarketProfit: market.maxMarketProfit || 0,
    startDate: market.startDate ? moment(market.startDate).format("YYYY-MM-DD") : "",
    visibleToPlayer: market.visibleToPlayer || false,
    positionIndex: market.positionIndex || 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string(),
    minStake: Yup.number(),
    maxStake: Yup.number(),
    betDelay: Yup.number(),
    minBetLiability: Yup.number(),
    maxBetLiability: Yup.number(),
    maxMarketProfit: Yup.number(),
    visibleToPlayer: Yup.boolean(),
    positionIndex: Yup.number().min(0).nullable(true),
  });

  const onSubmit = async (values) => {};

  const formik = useFormik({ initialValues, validationSchema, onSubmit });

  return (
    <>
      <CForm onSubmit={formik.handleSubmit}>
        <Row>
          <FormInput
            label="Market Name"
            name="name"
            type="text"
            readOnly
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && formik.errors.name}
            width={3}
            isRequired="true"
          />

          <FormInput
            label="Min Stake"
            name="minStake"
            type="number"
            value={formik.values.minStake}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.minStake && formik.errors.minStake}
            width={3}
            isRequired="true"
          />

          <FormInput
            label="Max Stake"
            name="maxStake"
            type="number"
            value={formik.values.maxStake}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxStake && formik.errors.maxStake}
            width={3}
            isRequired="true"
          />

          <FormInput
            label="Bet Delay"
            name="betDelay"
            type="number"
            value={formik.values.betDelay}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.betDelay && formik.errors.betDelay}
            width={3}
            isRequired="true"
          />

          <FormInput
            label="Min Bet Liability"
            name="minBetLiability"
            type="number"
            value={formik.values.minBetLiability}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.minBetLiability && formik.errors.minBetLiability}
            width={3}
            isRequired="true"
          />

          <FormInput
            label="Max Bet Liability"
            name="maxBetLiability"
            type="number"
            value={formik.values.maxBetLiability}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxBetLiability && formik.errors.maxBetLiability}
            width={3}
            isRequired="true"
          />

          <FormInput
            label="Position Index"
            name="positionIndexj"
            type="number"
            value={formik.values.positionIndex}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.positionIndex && formik.errors.positionIndex}
            width={3}
            isRequired="true"
          />

          <CCol md={3}>
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

        <div className="d-flex align-items-center mt-4">
          <CButton color="success" type="submit" className="me-2 py-1 fw-bolder">
            UPDATE
          </CButton>
          <CButton color="primary" type="reset" className="py-1 fw-bolder" onClick={formik.resetForm}>
            RESET
          </CButton>
        </div>
      </CForm>

      <hr className="mt-4 mb-0" />

      <MatchOddsResultForm market={market} />
    </>
  );
}

export default FancyForm;
