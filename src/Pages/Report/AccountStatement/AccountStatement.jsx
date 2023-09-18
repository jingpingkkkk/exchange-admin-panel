import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Card, Col, Breadcrumb, Button } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "react-data-table-component-extensions/dist/index.css";
import { getAllTransactionActivity } from "../reportService";
import { downloadCSV } from "../../../utils/csvUtils";
import { showAlert } from "../../../utils/alertUtils";
import SearchInput from "../../../components/Common/FormComponents/SearchInput"; // Import the SearchInput component
import { getAllData } from "../../Account/accountService";
//import 'react-date-range/dist/styles.css'; // main style file
//import 'react-date-range/dist/theme/default.css'; // theme css file
//import { DateRangePicker } from 'react-date-range';
import { CCol, CButton, CSpinner } from "@coreui/react";
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import FormInput from "../../../components/Common/FormComponents/FormInput";

export default function AccountStatement() {
  const Export = ({ onExport }) => (
    <Button className="btn btn-secondary" onClick={(e) => onExport(e.target.value)}>
      Export
    </Button>
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");

  const [userList, setuserList] = useState([]);
  const [startDateValue, setStartDateValue] = useState("");
  const [endDateValue, setEndDateValue] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [filters, setFilters] = useState({
    userId: "",
    starDate: "",
    endDate: "",
    // Add more filters here if needed
  });
  const [formSelectKey, setFormSelectKey] = useState(0);

  const columns = [
    {
      name: "SR.NO",
      selector: (row, index) => (currentPage - 1) * perPage + (index + 1),
      sortable: false,
    },
    {
      name: "DATE",
      selector: (row) => {
        const originalDate = new Date(row.createdAt);
        const formattedDate = originalDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        });
        return formattedDate;
      },
      sortable: true,
      sortField: "date",
    },
    {
      name: "CREDIT",
      selector: (row) => [row.points],
      sortable: true,
      sortField: "points",
      cell: (row) => <div style={{ color: "green" }}>{row.type === "credit" ? row.points : ""}</div>,
    },
    {
      name: "DEBIT",
      selector: (row) => [row.points],
      sortable: true,
      sortField: "points",
      cell: (row) => <div style={{ color: "red" }}>{row.type === "debit" ? "-" + row.points : ""}</div>,
    },
    {
      name: "PTS",
      selector: (row) => [row.balancePoints],
      sortable: true,
      sortField: "balancePoints",
    },
    {
      name: "REMARKS",
      selector: (row) => [row.remark],
      sortable: true,
      sortField: "remark",
    },
    {
      name: "FROM-TO",
      selector: (row) => [row.fromtoName],
      sortable: true,
      width: "280px",
      sortField: "fromtoName",
    },
  ];

  const actionsMemo = React.useMemo(() => <Export onExport={() => handleDownload()} />, []);

  const fetchData = async (page, sortBy, direction, searchQuery, filters) => {
    setLoading(true);
    try {
      const { userId, fromDate, toDate } = filters;
      const result = await getAllTransactionActivity({
        page: page,
        perPage: perPage,
        sortBy: sortBy,
        direction: direction,
        searchQuery: searchQuery,
        userId: userId,
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
    await downloadCSV("currencies/getAllTransactionActivity", searchQuery, "currency.csv");
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

  const handleFilterClick = () => {
    const newFilters = {
      userId: selectedUser,
      fromDate: startDateValue, // Replace startDateValue with the actual state value for start date
      toDate: endDateValue, // Replace endDateValue with the actual state value for end date
    };
    setFilters(newFilters);
    // Fetch data with the updated filters object
    fetchData(currentPage, sortBy, direction, searchQuery, newFilters);
  };

  const resetFilters = () => {
    // Clear the filter values
    setSelectedUser("");
    setStartDateValue("");
    setEndDateValue("");
    // Add more filter states if needed
    setFormSelectKey(formSelectKey + 1);

    // Fetch data with the updated filters object
    fetchData(currentPage, sortBy, direction, searchQuery, {
      sportId: "",
      startDate: "",
      endDate: "",
      // Add more filters here if needed
    });
  };

  const filterData = async () => {
    const userData = await getAllData();
    const dropdownOptions = userData.records.map((option) => ({
      value: option._id,
      label: option.username,
    }));
    setuserList(dropdownOptions);
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
          <h1 className="page-title">ACCOUNT STATEMENT</h1>
        </div>
      </div>

      <Row className=" row-sm">
        <Col lg={12}>
          <Card>
            <Card.Header>
              <FormSelectWithSearch
                key={formSelectKey} // Add the key prop here
                label="Client name"
                name="sportId"
                value={selectedUser} // Set the selectedUser as the value
                onChange={(name, selectedValue) => setSelectedUser(selectedValue)} // Update the selectedUser
                onBlur={() => {}} // Add an empty function as onBlur prop
                error=""
                width={2}
                options={userList}
              />

              <FormInput
                label="Start Date"
                name="startDate"
                type="date"
                value={startDateValue}
                onChange={(event) => setStartDateValue(event.target.value)} // Use event.target.value to get the updated value
                onBlur={() => {}}
                width={2}
              />

              <FormInput
                label="End Date"
                name="endDate"
                type="date"
                value={endDateValue}
                onChange={(event) => setEndDateValue(event.target.value)} // Use event.target.value to get the updated value
                onBlur={() => {}}
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
