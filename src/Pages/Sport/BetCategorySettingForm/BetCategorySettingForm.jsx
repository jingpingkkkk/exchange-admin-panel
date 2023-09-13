import { CButton, CCol, CContainer, CForm, CFormLabel } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormTextarea from "../../../components/Common/FormComponents/FormTextarea";
import { Notify } from "../../../utils/notify";
import { getBetCategorySettingByID, updateBetCategorySetting } from "../sportService";

export default function BetCategorySettingForm(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { sportId, betCatId, id, betCatName, sportsName } = location.state ?? {};
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if location.state is empty or undefined
    if (!location.state) {
      // Redirect to the 404 page
      navigate("/errorpage404");
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      minBet: "",
      maxBet: "",
      betDelay: "",
      notes: [{ description: "", highlight: false }],
    },
    validationSchema: Yup.object({
      minBet: Yup.number().required("Min Bet is required").min(1, "Min Bet cannot be lower than 1"),
      maxBet: Yup.number()
        .required("Max Bet is required")
        .test("minBetLessThanMaxBet", "Max Bet must be greater than Min Bet", function (value) {
          // Access the parent context to get the minBet value
          const { minBet } = this.parent;
          const parsedMinBet = parseFloat(minBet);
          const parsedMaxBet = parseFloat(value);

          if (!isNaN(parsedMinBet) && !isNaN(parsedMaxBet) && parsedMinBet >= parsedMaxBet) {
            return new Yup.ValidationError("Max Bet must be greater than Min Bet", value, "maxBet");
          }

          return true;
        }),
      betDelay: Yup.number().required("Min Bet is required").min(1, "Bet delay cannot be lower than 1"),
      notes: Yup.array().of(
        Yup.object().shape({
          description: Yup.string().required("Description is required"),
          highlight: Yup.boolean().required("Highlight is required"),
        })
      ),
    }),
    onSubmit: async (values) => {
      try {
        if (id) {
          await updateBetCategorySetting({
            _id: id,
            ...values,
          });
        }
        Notify.success("Bet Category Rule and Setting updated.");
        navigate("/bet-category-list", { state: { sportId: sportId } });
      } catch (error) {
        // Handle error
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const result = await getBetCategorySettingByID(id);

        formik.setValues((prevValues) => ({
          ...prevValues,
          ...result,
        }));
      }
    };
    fetchData();
  }, [id, getBetCategorySettingByID]);

  const formTitle = sportsName + "'s " + betCatName + " Bet Setting & Rule";

  const handleAddNote = () => {
    formik.setValues((prevValues) => ({
      ...prevValues,
      notes: [...prevValues.notes, { description: "", highlight: false }],
    }));
  };

  const handleRemoveNote = (index) => {
    formik.setValues((prevValues) => ({
      ...prevValues,
      notes: prevValues.notes.filter((_, i) => i !== index),
    }));
  };

  const toggleHighlight = (index) => {
    formik.setValues((prevValues) => {
      const newNotes = [...prevValues.notes];
      newNotes[index].highlight = !newNotes[index].highlight;
      return {
        ...prevValues,
        notes: newNotes,
      };
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"> {formTitle}</h1>
        </div>
      </div>

      <Row>
        <Col md={12} lg={12}>
          <Card>
            {/* <Card.Header>
              <h3 className="card-title">General Information</h3>
            </Card.Header> */}
            <Card.Body>
              <CForm
                className="row g-3 needs-validation"
                noValidate
                validated={validated}
                onSubmit={formik.handleSubmit}
              >
                <h4 className="mb-4">Bet Setting </h4>
                <FormInput
                  label="Min Bet"
                  name="minBet"
                  type="number"
                  value={formik.values.minBet}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.minBet && formik.errors.minBet}
                  width={2}
                  isRequired="true"
                />

                <FormInput
                  label="Max Bet"
                  name="maxBet"
                  type="number"
                  value={formik.values.maxBet}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.maxBet && formik.errors.maxBet}
                  width={2}
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
                  width={2}
                  isRequired="true"
                />
                <hr className="my-5" />

                <h4 className="mb-4">Rules</h4>

                <CContainer>
                  {formik.values.notes.map((note, index) => (
                    <Row key={index} className="mb-3">
                      <FormTextarea
                        label="Description"
                        name={`notes[${index}].description`}
                        value={formik.values.notes[index].description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.notes &&
                          formik.touched.notes[index] &&
                          formik.errors.notes &&
                          formik.errors.notes[index]?.description
                        }
                        isRequired="true"
                        width={5}
                      />

                      <CCol md={1}>
                        <CFormLabel>Highlight</CFormLabel>
                        <div className="material-switch mt-4">
                          <input
                            id={`highlightSwitch_${index}`}
                            name={`notes[${index}].highlight`}
                            onChange={() => toggleHighlight(index)}
                            checked={formik.values.notes[index].highlight}
                            type="checkbox"
                          />
                          <label htmlFor={`highlightSwitch_${index}`} className="label-primary"></label>
                        </div>
                      </CCol>

                      <Col md={2}>
                        <OverlayTrigger placement="top" overlay={<Tooltip> Click here to remove</Tooltip>}>
                          <CButton className="mt-6" color="danger" onClick={() => handleRemoveNote(index)}>
                            <i className="fa fa-close"></i>
                          </CButton>
                        </OverlayTrigger>
                      </Col>
                    </Row>
                  ))}

                  <CCol xs={12}>
                    <div className="d-grid gap-2 d-md-block">
                      <OverlayTrigger placement="top" overlay={<Tooltip> Click here to add new</Tooltip>}>
                        <CButton color="warning" type="button" onClick={handleAddNote}>
                          <i className="fa fa-plus"></i>
                        </CButton>
                      </OverlayTrigger>
                    </div>
                  </CCol>
                </CContainer>

                <CCol xs={12}>
                  <div className="d-grid gap-2 d-md-block">
                    <CButton color="primary" type="submit" className="me-3">
                      Save
                    </CButton>
                    <Link
                      to={`${process.env.PUBLIC_URL}/bet-category-list`}
                      state={{ sportId: sportId }}
                      className="btn btn-danger btn-icon text-white "
                    >
                      Cancel
                    </Link>
                  </div>
                </CCol>
              </CForm>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
