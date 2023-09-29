import { CButton, CCol, CForm, CFormLabel, CSpinner } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput"; // Import the FormInput component
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import { Notify } from "../../../utils/notify";
import { addCasino, getCasinoDetailByID, updateCasino } from "../casinoService";

const validationSchemaForCreate = Yup.object({
  name: Yup.string().required("Name is required"),
  casinoType: Yup.string().required("Casino type is required"),
});

const validationSchemaForUpdate = Yup.object({
  name: Yup.string().required("Name is required"),
  casinoType: Yup.string().required("Casino type is required"),
});

const casinoTypes = [
  { value: "live", label: "Live" },
  { value: "virtual", label: "Virtual" },
];

export default function CasinoForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state ? location.state.id : null;
  const editMode = !!id;

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [serverMsg, setServerMsg] = useState(null);

  const [casinoImage, setCasinoImage] = useState(null);
  const [casinoImageUrl, setCasinoImageUrl] = useState("");

  const user = {
    name: "",
    casinoType: "",
  };

  const handleSingleImageUpload = (event, fieldName) => {
    const file = event.target.files[0];
    if (!file) return;

    const newImageUrl = URL.createObjectURL(file);
    setCasinoImageUrl(newImageUrl);
    setCasinoImage(file);
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
      if (casinoImage) {
        formData.append("casinoImage", casinoImage);
      }

      let response = null;

      if (editMode) {
        formData.append("_id", id);
        response = await updateCasino(formData);
      } else {
        response = await addCasino(formData);
      }

      if (response.success) {
        Notify.success(editMode ? "Casino updated successfully" : "Casino added successfully");
        navigate("/casino-list/");
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
    Promise.all([getCasinoDetailByID(id)]).then(async (results) => {
      const [fetchtedUser] = results;
      if (fetchtedUser !== null) {
        const result = fetchtedUser;
        formik.setValues((prevValues) => ({
          ...prevValues,
          name: result.name || "",
          casinoType: result.casinoType || "",
        }));
        setCasinoImageUrl(fetchtedUser.image);
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

  const formTitle = id ? "UPDATE CASINO" : "CREATE CASINO";

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

            <FormInput
              label="Name"
              name="name"
              type="text"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && formik.errors.name}
              width={3}
              isRequired="true"
            />

            <FormSelectWithSearch
              placeholder="Select casino type"
              label="Casino Type"
              name="casinoType"
              value={formik.values.casinoType}
              onChange={(name, selectedValue) => formik.setFieldValue("casinoType", selectedValue)}
              onBlur={formik.handleBlur}
              error={formik.touched.casinoType && formik.errors.casinoType}
              isRequired="true"
              width={3}
              options={casinoTypes}
            />

            <CCol md="3">
              <CFormLabel htmlFor="">Image</CFormLabel>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(event) => handleSingleImageUpload(event, "casinoImage")}
              />
            </CCol>
            <CCol md="2">
              {casinoImageUrl ? (
                <div className="image-preview">
                  <img src={casinoImageUrl} alt="Casino" />
                </div>
              ) : null}
            </CCol>

            {/* <CCol md="2">
              <div className="pe-6">
                <CFormLabel htmlFor="isBetLock">Bet Lock</CFormLabel>
                <FormToggleSwitch
                  id="isBetLock"
                  name="isBetLock"
                  checked={formik.values.isBetLock}
                  onChange={() => formik.setFieldValue("isBetLock", !formik.values.isBetLock)}
                />
              </div>
            </CCol> */}

            <CCol xs={12} className="pt-4">
              <div className="d-grid gap-2 d-md-block">
                <CButton color="primary" type="submit" className="me-md-3">
                  {loading ? <CSpinner size="sm" /> : "Save"}
                </CButton>
                <Link to={`${process.env.PUBLIC_URL}/casino-list`} className="btn btn-danger btn-icon text-white">
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
