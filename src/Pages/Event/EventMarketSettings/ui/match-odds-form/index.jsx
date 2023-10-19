import { CButton, CCol, CForm, CFormLabel } from "@coreui/react";
import { useFormik } from "formik";
import React, { useState } from "react";
import { Row } from "react-bootstrap";
import * as Yup from "yup";
import FormInput from "../../../../../components/Common/FormComponents/FormInput";
import FormToggleSwitch from "../../../../../components/Common/FormComponents/FormToggleSwitch";
import { Notify } from "../../../../../utils/notify";
import { updateMarket } from "../../../../EventBetMatchods/marketService";
import Loader from "../Loader";
import MatchOddsResultForm from "./MatchOddsResultForm";

function MatchOddsForm({ market = {}, onResultGenerate = () => {}, onResultRevert = () => {} }) {
  const [loading, setLoading] = useState(false);

  const initialValues = {
    minStake: market.minStake || 0,
    maxStake: market.maxStake || 0,
    betDelay: market.betDelay || 0,
    maxBetLiability: market.maxBetLiability || 0,
    maxMarketLiability: market.maxMarketLiability || 0,
    maxMarketProfit: market.maxMarketProfit || 0,
    visibleToPlayer: market.visibleToPlayer || false,
  };

  const validationSchema = Yup.object({
    minStake: Yup.number(),
    maxStake: Yup.number(),
    betDelay: Yup.number(),
    maxBetLiability: Yup.number(),
    maxMarketLiability: Yup.number(),
    maxMarketProfit: Yup.number(),
    visibleToPlayer: Yup.boolean(),
  });

  const onSubmit = async (values) => {
    setLoading(true);
    const result = await updateMarket({
      name: market?.name,
      minStake: values.minStake || 0,
      maxStake: values.maxStake || 0,
      betDelay: values.betDelay || 0,
      maxBetLiability: values.maxBetLiability || 0,
      maxMarketLiability: values.maxMarketLiability || 0,
      maxMarketProfit: values?.maxMarketProfit || 0,
      _id: market?._id,
    });
    setLoading(false);
    if (result.success) {
      Notify.success(`${market?.name} updated.`);
    } else {
      Notify.error(`Error: ${result.message || "Something went wrong!"}`);
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });

  return loading ? (
    <Loader text="Updating Market..." />
  ) : (
    <>
      <CForm onSubmit={formik.handleSubmit}>
        <Row>
          <FormInput label="Market Name" name="name" type="text" readOnly value={market.type} width={3} />

          <FormInput
            label="Min Stake"
            name="minStake"
            type="number"
            value={formik.values.minStake}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.minStake && formik.errors.minStake}
            width={3}
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
          />

          <FormInput
            label="Max Market Liability"
            name="maxMarketLiability"
            type="number"
            value={formik.values.maxMarketLiability}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxMarketLiability && formik.errors.maxMarketLiability}
            width={3}
          />

          <FormInput
            label="Max Market Profit"
            name="maxMarketProfit"
            type="number"
            value={formik.values.maxMarketProfit}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxMarketProfit && formik.errors.maxMarketProfit}
            width={3}
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

      <MatchOddsResultForm market={market} onResultGenerate={onResultGenerate} onResultRevert={onResultRevert} />
    </>
  );
}

export default MatchOddsForm;
