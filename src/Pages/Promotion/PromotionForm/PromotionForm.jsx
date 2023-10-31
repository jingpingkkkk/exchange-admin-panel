import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput"; // Import the FormInput component
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import { Notify } from "../../../utils/notify";
import { addPromotion, getPromotionDetailByID, updatePromotion } from "../promotionService";

const validationSchemaForCreate = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  rules: Yup.string().nullable(true),
  termsConditions: Yup.string().nullable(true),
  promotionType: Yup.string().required("Prmotion Type is required"),
});

const validationSchemaForUpdate = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  rules: Yup.string().nullable(true),
  termsConditions: Yup.string().nullable(true),
  promotionType: Yup.string().required("Prmotion Type is required"),
});

const promotionTypes = [
  { value: "sport", label: "Sport" },
  { value: "casino", label: "Casino" },
];

export default function PromotionForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state ? location.state.id : null;
  const editMode = !!id;

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [serverMsg, setServerMsg] = useState(null);

  const user = {
    title: "",
    description: "",
    rules: "",
    termsConditions: "",
  };

  const submitForm = async (values) => {
    setServerError(null);
    setLoading(true);

    try {
      const formData = new FormData(); // Create a new FormData object

      // Append form values to FormData
      for (const key in values) {
        formData.append(key, values[key]);
      }
      let response = null;

      if (editMode) {
        formData.append("_id", id);
        response = await updatePromotion(formData);
      } else {
        response = await addPromotion(formData);
      }

      if (response.success) {
        Notify.success(editMode ? "Promotion updated successfully" : "Promotion added successfully");
        navigate("/promotion-list/");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndUpdateFormData = async () => {
    Promise.all([getPromotionDetailByID(id)]).then(async (results) => {
      const [fetchtedUser] = results;
      if (fetchtedUser !== null) {
        const result = fetchtedUser;
        formik.setValues((prevValues) => ({
          ...prevValues,
          title:result.title || "",
          description:result.description || "",
          rules:result.rules || "",
          termsConditions: result.termsConditions || "",
          promotionType: result.promotionType || "",
        }));
      }
    });
  };

  const formik = useFormik({
    initialValues: user,
    validationSchema: editMode ? validationSchemaForUpdate : validationSchemaForCreate,
    onSubmit: submitForm,
  });

  useEffect(() => {
    fetchAndUpdateFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formTitle = id ? "UPDATE PROMOTION" : "CREATE PROMOTION";

  return (
    <div>
      <div className="page-header mb-3">
        <h1 className="page-title">{formTitle}</h1>
      </div>

      <Card>
        {/* <Card.Header>
          <h3 className="card-title">Social Integration </h3>
        </Card.Header> */}

        <Card.Body>
          <CForm className="row g-3 needs-validation" onSubmit={formik.handleSubmit}>
            {serverError ? <p className="text-red">{serverError}</p> : null}
            {serverMsg ? <p className="text-green">{serverMsg}</p> : null}


            <FormSelectWithSearch
              placeholder="Select promotion type"
              label="Promotion Type"
              name="promotionType"
              value={formik.values.promotionType}
              onChange={(name, selectedValue) => formik.setFieldValue("promotionType", selectedValue)}
              onBlur={formik.handleBlur}
              error={formik.touched.promotionType && formik.errors.promotionType}
              isRequired="true"
              width={12}
              options={promotionTypes}
            />

            <FormInput
              label="Title"
              name="title"
              type="text"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && formik.errors.title}
              width={12}
              isRequired="true"
            />

            <FormInput
              label="Description"
              name="description"
              type="text"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && formik.errors.description}
              width={12}
              isRequired="true"
            />

            <FormInput
              label="Rules"
              name="rules"
              type="text"
              value={formik.values.rules}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.rules && formik.errors.rules}
              width={12}
              isRequired="true"
            />

            <FormInput
              label="Terms And Conditions"
              name="termsConditions"
              type="text"
              value={formik.values.termsConditions}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.termsConditions && formik.errors.termsConditions}
              width={12}
              isRequired="true"
            />


            <CCol xs={12} className="pt-4">
              <div className="d-grid gap-2 d-md-block">
                <CButton color="primary" type="submit" className="me-md-3">
                  {loading ? <CSpinner size="sm" /> : "Save"}
                </CButton>
                <Link to={`${process.env.PUBLIC_URL}/promotion-list`} className="btn btn-danger btn-icon text-white">
                  Cancel
                </Link>
              </div>
            </CCol>
          </CForm>
        </Card.Body>
      </Card>
    </div>
  );
}
