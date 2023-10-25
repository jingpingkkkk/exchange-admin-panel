import { CCol, CFormLabel } from "@coreui/react";
import React from "react";
import Select from "react-select";

const FormSelectWithSearch = ({
  label,
  name,
  value = null,
  onChange = () => {},
  onBlur = () => {},
  error,
  options,
  isRequired,
  width,
  disabled = false,
  isLoading = false,
  placeholder = "Select",
  ...props
}) => {
  return (
    <CCol md={width}>
      <CFormLabel htmlFor={name}>
        {label} {isRequired === "true" && <span className="text-red">*</span>}
      </CFormLabel>
      <Select
        {...props}
        placeholder={placeholder}
        isLoading={isLoading}
        isDisabled={disabled}
        id={name}
        name={name}
        value={options.find((option) => option.value === value)}
        onChange={(selectedOption) => onChange(name, selectedOption?.value)}
        onBlur={() => onBlur(name)}
        className={error ? "is-invalid" : ""}
        options={options}
        isSearchable
      />
      {error && <p className="text-red">{error}</p>}
    </CCol>
  );
};

export default React.memo(FormSelectWithSearch);
