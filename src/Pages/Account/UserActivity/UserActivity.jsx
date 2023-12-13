import moment from "moment";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "react-data-table-component-extensions/dist/index.css";
import SearchInput from "../../../components/Common/FormComponents/SearchInput"; // Import the SearchInput component
import { downloadCSV } from "../../../utils/csvUtils";
import { getAllData, getUserActivity } from "../../Account/accountService";
import { getUserActivityTypes } from "../../../Pages/Report/reportService";
//import 'react-date-range/dist/styles.css'; // main style file
//import 'react-date-range/dist/theme/default.css'; // theme css file
//import { DateRangePicker } from 'react-date-range';
import { CButton, CCol, CSpinner } from "@coreui/react";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import { exportToExcel, exportToPDF } from "../../../utils/exportUtils"; // Import utility functions for exporting
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function UserActivity() {
  const Export = ({ onExport }) => (
    <Button className="btn btn-secondary" onClick={(e) => onExport(e.target.value)}>
      Export
    </Button>
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [data, setData] = useState([]);
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");

  const [userList, setUserList] = useState([]);
  const [startDateValue, setStartDateValue] = useState("");
  const [endDateValue, setEndDateValue] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [typeList, setTypeList] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [filters, setFilters] = useState({
    userId: "",
    starDate: "",
    endDate: "",
    type: "",
    // Add more filters here if needed
  });
  const [formSelectKey, setFormSelectKey] = useState(0);
  const [formSelectTypeKey, setFormSelectTypeKey] = useState(Math.random());
  const navigate = useNavigate();
  const location = useLocation();

  const columns = [
    {
      name: "SR.NO",
      selector: (row, index) => (currentPage - 1) * perPage + (index + 1),
      sortable: false,
    },
    {
      name: "USERNAME",
      selector: (row) => [row.username],
      sortable: true,
      sortField: "points",
    },
    {
      name: "DATE",
      selector: (row) => [moment(row.createdAt).format("DD-MM-YYYY HH:mm:ss")],
      sortable: true,
      sortField: "createdAt",
    },
    {
      name: "IP ADDRESS",
      selector: (row) => [row.ipAddress],
      sortable: true,
      sortField: "ipAddress",
    },
    {
      name: "EVENT",
      selector: (row) => [row.event],
      sortable: true,
      sortField: "ipAddress",
    },
    {
      name: "CITY",
      selector: (row) => [row.city],
      sortable: true,
      sortField: "city",
    },
    {
      name: "COUNTRY",
      selector: (row) => [row.country],
      sortable: true,
      sortField: "country",
    },
  ];

  const actionsMemo = React.useMemo(() => <Export onExport={() => handleDownload()} />, []);
  const id = location.state ? location.state.id : null;

  const fetchData = async (page, sortBy, direction, searchQuery, filters) => {
    setLoading(true);
    try {
      const { userId, fromDate, toDate, type } = filters;
      const result = await getUserActivity({
        page: page,
        perPage: perPage,
        sortBy: sortBy,
        direction: direction,
        showDeleted: false,
        searchQuery: searchQuery,
        userId: id,
        type: type,
        fromDate: fromDate,
        toDate: toDate,
      });
      setData(result.records);
      setTotalRows(result.totalRecords);
      setLoading(false);
    } catch (error) {
      // Handle error
      console.error("Error fetching :", error);
      // Display error message or show notification to the user
      // Set the state to indicate the error condition
      setLoading(false);
    }
  };

  const handleSort = (column, sortDirection) => {
    // simulate server sort
    setSortBy(column.sortField);
    setDirection(sortDirection);
    setCurrentPage(1);
    fetchData(currentPage, sortBy, direction, searchQuery, filters);
    setLoading(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page, sortBy, direction, searchQuery, filters);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setLoading(true);
    setPerPage(newPerPage);
    setLoading(false);
  };

  const handleDownload = async () => {
    await downloadCSV("currencies/getUserActivity", searchQuery, "currency.csv");
  };

  const selectionRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  };

  const handleSelect = (ranges) => {
    console.log(ranges);
    // {
    //   selection: {
    //     startDate: [native Date Object],
    //     endDate: [native Date Object],
    //   }
    // }
  };

  const handleExcelExport = async () => {
    try {
      const response = await getUserActivity(); // Replace with your actual API call
      // Generate and download Excel file

      const formattedData = response.records.map((item) => ({
        USERNAME: item.username,
        DATE: new Date(item.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        }),
        "IP ADDRESS": item.ipAddress,
        CITY: item.city,
        COUNTRY: item.country,
      }));
      exportToExcel(formattedData, "userHistory.xlsx"); // Utilize exportToExcel utility function
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const handlePDFExport = async () => {
    try {
      const response = await getUserActivity(); // Replace with your actual API call
      // Generate and download PDF file

      const columns = ["USERNAME", "DATE", "IP ADDRESS", "CITY", "COUNTRY"];

      const formattedData = response.records.map((item) => ({
        USERNAME: item.username,
        DATE: new Date(item.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        }),
        "IP ADDRESS": item.ipAddress,
        CITY: item.city,
        COUNTRY: item.country,
      }));
      exportToPDF(columns, formattedData, "userHistory.pdf");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    }
  };

  const handleFilterClick = () => {
    const newFilters = {
      userId: selectedUser,
      type: selectedType,
      fromDate: startDateValue, // Replace startDateValue with the actual state value for start date
      toDate: endDateValue, // Replace endDateValue with the actual state value for end date
    };
    setFilters(newFilters);
    setResetPaginationToggle(!resetPaginationToggle);
    // Fetch data with the updated filters object
    fetchData(currentPage, sortBy, direction, searchQuery, newFilters);
  };

  const resetFilters = () => {
    // Clear the filter values
    setSelectedUser("");
    setSelectedType("");
    setStartDateValue("");
    setEndDateValue("");
    // Add more filter states if needed
    setFormSelectKey(formSelectKey + 1);
    setFormSelectTypeKey(formSelectTypeKey + 1);
    setResetPaginationToggle(!resetPaginationToggle);

    // Fetch data with the updated filters object
    fetchData(currentPage, sortBy, direction, searchQuery, {
      userId: "",
      startDate: "",
      endDate: "",
      type: "",
      // Add more filters here if needed
    });
  };

  const filterData = async () => {
    Promise.all([getAllData(), getUserActivityTypes()]).then((results) => {
      const [userData, userActivityTypes] = results;
      const dropdownOptions = userData.records.map((option) => ({
        value: option._id,
        label: option.username,
      }));
      setUserList(dropdownOptions);
      setTypeList(userActivityTypes);
    });
  };

  useEffect(() => {
    if (searchQuery !== "") {
      fetchData(currentPage, sortBy, direction, searchQuery, filters); // fetch page 1 of users
    } else {
      fetchData(currentPage, sortBy, direction, "", filters); // fetch page 1 of users
    }
    filterData();
  }, [perPage, searchQuery]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">USER ACTIVITY</h1>
        </div>
      </div>

      <Row className=" row-sm">
        <Col lg={12}>
          <Card>
            <Card.Header>

              <FormSelectWithSearch
                key={formSelectTypeKey} // Add the key prop here
                label="Type"
                name="type"
                value={selectedType} // Set the selectedType as the value
                onChange={(name, selectedValue) => setSelectedType(selectedValue)} // Update the selectedType
                onBlur={() => { }} // Add an empty function as onBlur prop
                error=""
                width={2}
                options={typeList}
              />

              <FormInput
                label="Start Date"
                name="startDate"
                type="date"
                value={startDateValue}
                onChange={(event) => setStartDateValue(event.target.value)} // Use event.target.value to get the updated value
                onBlur={() => { }}
                width={2}
              />

              <FormInput
                label="End Date"
                name="endDate"
                type="date"
                value={endDateValue}
                onChange={(event) => setEndDateValue(event.target.value)} // Use event.target.value to get the updated value
                onBlur={() => { }}
                width={2}
              />

              <CCol xs={12}>
                <div className="d-grid gap-2 d-md-block">
                  <CButton color="primary" type="submit" onClick={handleFilterClick} className="me-3 mt-6">
                    {loading ? <CSpinner size="sm" /> : "Filter"}
                  </CButton>
                  <button
                    onClick={resetFilters} // Call the resetFilters function when the "Reset" button is clicked
                    className="btn btn-danger btn-icon text-white mt-6"
                  >
                    Reset
                  </button>

                  <Button variant="success" className="ms-3 me-3 mt-6" onClick={handleExcelExport}>
                    <i className="fa fa-file-excel-o"></i>
                  </Button>
                  <Button variant="info" className=" mt-6" onClick={handlePDFExport}>
                    <i className="fa fa-file-pdf-o"></i>
                  </Button>
                </div>
              </CCol>
            </Card.Header>
            <Card.Body>
              <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} loading={loading} />
              {/* <Row>
                <CCol xs={4}>
                  <DateRangePicker
                    ranges={[selectionRange]}
                    onChange={handleSelect}
                  />
                </CCol>
              </Row> */}
              <div className="table-responsive export-table">
                <DataTable
                  columns={columns}
                  data={data}
                  // actions={actionsMemo}
                  //selectableRows
                  pagination
                  highlightOnHover
                  progressPending={loading}
                  paginationServer
                  paginationResetDefaultPage={resetPaginationToggle}
                  paginationTotalRows={totalRows}
                  onChangeRowsPerPage={handlePerRowsChange}
                  onChangePage={handlePageChange}
                  sortServer
                  onSort={handleSort}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
