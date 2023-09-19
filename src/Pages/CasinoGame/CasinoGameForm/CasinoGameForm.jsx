import { CButton, CCol, CForm, CSpinner, CFormLabel } from "@coreui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import FormInput from "../../../components/Common/FormComponents/FormInput"; // Import the FormInput component
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import FormToggleSwitch from "../../../components/Common/FormComponents/FormToggleSwitch"; // Import the FormToggleSwitch component
import { addCasinoGame, getCasinoGameDetailByID, updateCasinoGame } from "../casinoGameService";
import { getAllCasino } from "../../Casino/casinoService";
import { Notify } from "../../../utils/notify";

const validationSchemaForCreate = Yup.object({
  name: Yup.string().required("Name is required"),
  casinoId: Yup.string().required("Casino is required"),
});

const validationSchemaForUpdate = Yup.object({
  name: Yup.string().required("Name is required"),
  casinoId: Yup.string().required("Casino is required"),
});

export default function CasinoGameForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state ? location.state.id : null;
  const editMode = !!id;

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [serverMsg, setServerMsg] = useState(null);
  const [casinoList, setCasinoList] = useState([]);
  const [sportLoading, setSportLoading] = useState(false);

  const [casinoGameImage, setCasinoGameImage] = useState(null);
  const [casinoGameImageUrl, setCasinoGameImageUrl] = useState("");

  const user = {
    name: "",
    casinoId: "",
  };

  const handleSingleImageUpload = (event, fieldName) => {
    const file = event.target.files[0];
    if (!file) return;

    const newImageUrl = URL.createObjectURL(file);
    setCasinoGameImageUrl(newImageUrl);
    setCasinoGameImage(file);
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
      if (casinoGameImage) {
        formData.append("casinoGameImage", casinoGameImage);
      }

      let response = null;

      if (editMode) {
        formData.append("_id", id);
        response = await updateCasinoGame(formData);
      } else {
        response = await addCasinoGame(formData);
      }

      if (response.data.success) {
        Notify.success(editMode ? "Casino game updated successfully" : "Casino game added successfully");
        navigate("/casino-game-list/");
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
    Promise.all([
      getCasinoGameDetailByID(id),
      getAllCasino({
        status: true,
      }),
    ]).then((results) => {
      console.log(results);
      const [fetchtedUser, allCasino] = results;
      if (fetchtedUser !== null) {
        const result = fetchtedUser;
        formik.setValues((prevValues) => ({
          ...prevValues,
          name: result.name || "",
          casinoId: result.casinoId || "",
        }));

        setCasinoGameImageUrl(fetchtedUser.image);
      }

      const dropdownOptions = allCasino.records.map((option) => ({
        value: option._id,
        label: option.name,
      }));
      setCasinoList(dropdownOptions);
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

  const formTitle = id ? "UPDATE CASINO GAME" : "CREATE CASINO GAME";

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
              isLoading={sportLoading}
              placeholder={sportLoading ? "Loading Casinos..." : "Select Casino"}
              label="Casino"
              name="casinoId"
              value={formik.values.casinoId}
              onChange={(name, selectedValue) => {
                formik.setFieldValue("casinoId", selectedValue); // Use the 'name' argument here
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.casinoId && formik.errors.casinoId}
              isRequired="true"
              width={3}
              options={casinoList}
            />

            <CCol md="2">
              <CFormLabel htmlFor="">Casino Image</CFormLabel>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(event) => handleSingleImageUpload(event, "casinoGameImage")}
              />
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
            <CCol md="2">
              {casinoGameImageUrl && (
                <div className="image-preview">
                  <img src={casinoGameImageUrl} alt="Casino image" />
                </div>
              )}
            </CCol>

            <CCol xs={12} className="pt-3">
              <div className="d-grid gap-2 d-md-block">
                <CButton color="primary" type="submit" className="me-md-3">
                  {loading ? <CSpinner size="sm" /> : editMode ? "Update" : "Create"}
                </CButton>
              </div>
            </CCol>
          </CForm>
        </Card.Body>
      </Card>
    </div>
  );
}
