import { CButton, CCol, CSpinner } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Dropdown, Row, Tooltip, OverlayTrigger } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "react-data-table-component-extensions/dist/index.css";
import { Link, useLocation } from "react-router-dom";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormSelect from "../../../components/Common/FormComponents/FormSelect"; // Import the FormSelect component
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import SearchInput from "../../../components/Common/FormComponents/SearchInput"; // Import the SearchInput component
import { showAlert } from "../../../utils/alertUtils";
import { downloadCSV } from "../../../utils/csvUtils";
import { Notify } from "../../../utils/notify";
import { getAllCompetitionOptions } from "../../Competition/competitionService";
import { changeStatus, deleteEvent, getAllEvent } from "../eventService";

export default function EventList() {
  const Export = ({ onExport }) => (
    <Button className="btn btn-secondary" onClick={(e) => onExport(e.target.value)}>
      Export
    </Button>
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [competitionList, setCompetitionList] = useState([]);
  const [competitionLoading, setCompetitionLoading] = useState(false);
  const [eventStatus, setEventStatus] = useState({});
  //Filter Param
  const [startDateValue, setStartDateValue] = useState("");
  const [endDateValue, setEndDateValue] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const updateEventStatus = (id, key, value) => {
    setEventStatus((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  const toggleHighlight = async (id, isActive) => {
    updateEventStatus(id, "loading", true);
    try {
      const newStatus = !isActive;
      const request = { _id: id, fieldName: "isActive", status: newStatus.toString() };
      const result = await changeStatus(request);
      if (result.success) {
        Notify.success("Status updated successfully");
        updateEventStatus(id, "isActive", result.data.details.isActive);
      }
    } catch (error) {
      console.error("Error removing :", error);
    }
    updateEventStatus(id, "loading", false);
  };

  const location = useLocation();
  const competitionId = location.state ? location.state.competitionId : "";
  const competitionName = location.state ? location.state.competitionName : "";
  const [filters, setFilters] = useState({
    competitionId: location.state ? location.state.competitionId : "",
    starDate: "",
    endDate: "",
    status: "",
    // Add more filters here if needed
  });

  const statusList = [
    { id: "", lable: "All" },
    { id: true, lable: "Active" },
    { id: false, lable: "Inactive" },
  ];
  const columns = [
    {
      name: "SR.NO",
      selector: (row, index) => (currentPage - 1) * perPage + (index + 1),
      sortable: false,
    },
    {
      name: "NAME",
      selector: (row) => [row.name],
      sortable: true,
      sortField: "name",
    },
    {
      name: "COMPETITION",
      selector: (row) => [row.competitionName],
      sortable: true,
    },
    {
      name: "SPORT",
      selector: (row) => [row.sportsName],
      sortable: true,
    },
    {
      name: "MATCH DATE",
      selector: (row) => {
        const originalDate = new Date(row.matchDate);
        const formattedDate = originalDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return formattedDate;
      },
      sortable: true,
      sortField: "matchDate",
    },
    {
      name: "STATUS",
      selector: (row) => [row.betCategory],
      sortable: false,
      cell: (row) => (
        <div className="material-switch mt-4 d-flex align-items-center" key={row._id}>
          <input
            id={`highlightSwitch_${row._id}`}
            name={`notes[${row._id}].highlight`}
            onChange={() => toggleHighlight(row._id, eventStatus[row._id]?.isActive)}
            checked={eventStatus[row._id]?.isActive || false}
            type="checkbox"
          />
          <label htmlFor={`highlightSwitch_${row._id}`} className="label-primary"></label>
          {eventStatus[row._id]?.loading ? (
            <div className="pb-2 ps-4">
              <CSpinner size="sm" />
            </div>
          ) : null}
        </div>
      ),
    },
    {
      name: "ACTION",
      cell: (row) => (
        <div>
          <OverlayTrigger placement="top" overlay={<Tooltip > Click here to edit</Tooltip>}>
            <Link to={`${process.env.PUBLIC_URL}/event-form`} state={{ id: row._id }} className="btn btn-primary btn-lg">
              <i className="fa fa-edit"></i>
            </Link>
          </OverlayTrigger>
          {/* <button onClick={(e) => handleDelete(row._id)} className="btn btn-danger btn-lg ms-2"><i className="fa fa-trash"></i></button> */}
        </div>
      ),
    },
  ];

  const actionsMemo = React.useMemo(() => <Export onExport={() => handleDownload()} />, []);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [toggleCleared, setToggleCleared] = React.useState(false);
  const [formSelectKey, setFormSelectKey] = useState(0);
  let selectdata = [];
  const handleRowSelected = React.useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const contextActions = React.useMemo(() => {
    const Selectdata = () => {
      if (window.confirm(`download:\r ${selectedRows.map((r) => r.SNO)}?`)) {
        setToggleCleared(!toggleCleared);
        data.map((e) => {
          selectedRows.map((sr) => {
            if (e.id === sr.id) {
              selectdata.push(e);
            }
          });
        });
        downloadCSV(selectdata);
      }
    };

    return <Export onExport={() => Selectdata()} icon="true" />;
  }, [data, selectdata, selectedRows]);

  const fetchData = async (page, sortBy, direction, searchQuery, filters) => {
    setLoading(true);
    try {
      const { competitionId, fromDate, toDate, status } = filters;
      const result = await getAllEvent({
        page: page,
        perPage: perPage,
        sortBy: sortBy,
        direction: direction,
        searchQuery: searchQuery,
        competitionId: competitionId,
        fromDate: fromDate,
        toDate: toDate,
        status: status,
      });
      setData(result.records);
      setTotalRows(result.totalRecords);
      setEventStatus(
        result.records.reduce((acc, event) => {
          acc[event._id] = { isActive: event.isActive, loading: false };
          return acc;
        }, {})
      );
      setLoading(false);
    } catch (error) {
      // Handle error
      console.error("Error fetching :", error);
      // Display error message or show notification to the user
      // Set the state to indicate the error condition
      setLoading(false);
    }
  };

  const removeRow = async (id) => {
    setLoading(true);
    try {
      const success = await deleteEvent(id);
      if (success) {
        fetchData(currentPage, sortBy, direction, searchQuery, filters);
        setLoading(false);
      }
    } catch (error) {
      // Handle error
      console.error("Error removing :", error);
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
    await downloadCSV("event/getAllEvent", searchQuery, "events.csv");
  };

  const handleDelete = (id) => {
    showAlert(id, removeRow);
  };

  const handleFilterClick = () => {
    const newFilters = {
      competitionId: selectedCompetition,
      fromDate: startDateValue, // Replace startDateValue with the actual state value for start date
      toDate: endDateValue, // Replace endDateValue with the actual state value for end date
      status: selectedStatus,
    };
    setFilters(newFilters);
    // Fetch data with the updated filters object
    fetchData(currentPage, sortBy, direction, searchQuery, newFilters);
  };

  const resetFilters = () => {
    // Clear the filter values
    setSelectedCompetition("");
    setStartDateValue("");
    setEndDateValue("");
    setSelectedStatus("");
    setFormSelectKey(formSelectKey + 1);
    // Add more filter states if needed
    // Fetch data with the updated filters object
    fetchData(currentPage, sortBy, direction, searchQuery, {
      sportId: "",
      startDate: "",
      endDate: "",
      // Add more filters here if needed
    });
  };

  const filterData = async () => {
    setCompetitionLoading(true);
    const competitionData = await getAllCompetitionOptions({ fields: { name: 1 }, sortBy: "name", direction: "asc" });
    const dropdownOptions = competitionData.records.map((option) => ({
      value: option._id,
      label: option.name,
    }));
    setCompetitionList(dropdownOptions);
    setCompetitionLoading(false);
  };

  useEffect(() => {
    if (searchQuery !== "") {
      fetchData(currentPage, sortBy, direction, searchQuery, filters); // fetch page 1 of users
    } else {
      fetchData(currentPage, sortBy, direction, "", filters); // fetch page 1 of users
    }
    filterData();
  }, [perPage, searchQuery, filters]);

  useEffect(() => {
    return () => {
      setFilters({
        competitionId: "",
        starDate: "",
        endDate: "",
        // Add more filters here if needed
      });
    };
  }, [location]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title"> {competitionName !== "" ? competitionName + "'s Events" : "ALL EVENTS"}</h1>
          {/* <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item" href="#">
              Category
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item active breadcrumds" aria-current="page">
              List
            </Breadcrumb.Item>
          </Breadcrumb> */}
        </div>
        <div className="ms-auto pageheader-btn">
          {competitionName === "" && (
            <Link to={`${process.env.PUBLIC_URL}/event-form`} className="btn btn-primary btn-icon text-white me-3">
              <span>
                <i className="fe fe-plus"></i>&nbsp;
              </span>
              CREATE EVENT
            </Link>
          )}
          {/* <Link to="#" className="btn btn-success btn-icon text-white">
            <span>
              <i className="fe fe-log-in"></i>&nbsp;
            </span>
            Export
          </Link> */}
        </div>
      </div>

      <Row className=" row-sm">
        <Col lg={12}>
          <Card>
            {competitionName === "" && (
              <Card.Header>
                <FormSelectWithSearch
                  isLoading={competitionLoading}
                  placeholder={competitionLoading ? "Loading..." : "Select Competition"}
                  label="Competition"
                  name="sportId"
                  value={selectedCompetition} // Set the selectedCompetition as the value
                  onChange={(name, selectedValue) => setSelectedCompetition(selectedValue)} // Update the selectedCompetition
                  onBlur={() => { }} // Add an empty function as onBlur prop
                  error=""
                  width={2}
                  options={competitionList}
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

                <FormSelect
                  label="Status"
                  name="status"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)} // Use event.target.value to get the updated value
                  onBlur={() => { }}
                  width={2}
                >
                  {statusList.map((status, index) => (
                    <option key={index} value={status.id}>
                      {status.lable.toUpperCase()}
                    </option>
                  ))}
                </FormSelect>

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
            )}
            <Card.Body>
              <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} loading={loading} />
              <div className="table-responsive export-table">
                <DataTable
                  columns={columns}
                  data={data}
                  // actions={actionsMemo}
                  // contextActions={contextActions}
                  // onSelectedRowsChange={handleRowSelected}
                  clearSelectedRows={toggleCleared}
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
