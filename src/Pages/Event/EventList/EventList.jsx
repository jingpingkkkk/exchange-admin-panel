import { CButton, CCol, CSpinner } from "@coreui/react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Button, Card, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "react-data-table-component-extensions/dist/index.css";
import { Link, useLocation } from "react-router-dom";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormSelect from "../../../components/Common/FormComponents/FormSelect"; // Import the FormSelect component
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import SearchInput from "../../../components/Common/FormComponents/SearchInput"; // Import the SearchInput component
import { permission } from "../../../lib/user-permissions";
import { showAlert } from "../../../utils/alertUtils";
import { downloadCSV } from "../../../utils/csvUtils";
import { Notify } from "../../../utils/notify";
import { getAllCompetitionOptions } from "../../Competition/competitionService";
import { getAllSport } from "../../Sport/sportService";
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
  const [sortBy, setSortBy] = useState("isActive");
  const [direction, setDirection] = useState("desc");
  const [competitionList, setCompetitionList] = useState([]);
  const [competitionLoading, setCompetitionLoading] = useState(false);
  const [eventStatus, setEventStatus] = useState({});
  //Filter Param
  const [startDateValue, setStartDateValue] = useState("");
  const [endDateValue, setEndDateValue] = useState("");
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sportLoading, setSportLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState("");
  const [sportList, setSportList] = useState([]);

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
    sportId: location.state ? location.state.sportId : "",
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
        const matchTime = row?.matchTime ? moment(row?.matchTime, "HH:mm").format("hh:mm A") : "";
        const formattedDate = moment(row.matchDate).format("DD/MM/YYYY") + " " + matchTime;
        return formattedDate;
      },
      sortable: true,
      sortField: "matchDate",
    },
    {
      name: "EVENT STATUS",
      selector: (row) => [row.status],
      sortable: true,
    },
    permission.EVENTS.ACTIVE && {
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
    permission.EVENTS.ACTIVE && {
      name: "ACTION",
      cell: (row) => (
        <div>
          <OverlayTrigger placement="top" overlay={<Tooltip> Click here to edit</Tooltip>}>
            <Link
              to={`${process.env.PUBLIC_URL}/event-form`}
              state={{ id: row._id, liveEvent: false }}
              className="btn btn-primary btn-lg"
            >
              <i className="fa fa-edit"></i>
            </Link>
          </OverlayTrigger>
          {/* <button onClick={(e) => handleDelete(row._id)} className="btn btn-danger btn-lg ms-2"><i className="fa fa-trash"></i></button> */}
        </div>
      ),
    },
  ].filter(Boolean);

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
      const { competitionId, fromDate, toDate, status, sportId } = filters;
      const result = await getAllEvent({
        page: page,
        perPage: perPage,
        sortBy: sortBy,
        direction: direction,
        searchQuery: searchQuery,
        competitionId: competitionId,
        sportId,
        fromDate: fromDate,
        toDate: toDate,
        status: status,
      });
      console.log(result.records);
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
      sportId: selectedSport,
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
    setSelectedSport("");
    // Add more filter states if needed
    // Fetch data with the updated filters object
    fetchData(currentPage, sortBy, direction, searchQuery, {
      sportId: "",
      competitionId: "",
      startDate: "",
      endDate: "",
      // Add more filters here if needed
    });
  };

  const fetchSportList = async () => {
    setSportLoading(true);
    const sportData = await getAllSport();
    const dropdownOptions = sportData.records.map((option) => ({
      value: option._id,
      label: option.name,
    }));
    setSportList(dropdownOptions);
    setSportLoading(false);
  };

  const fetchCompetitionList = async () => {
    setCompetitionLoading(true);
    const competitionData = await getAllCompetitionOptions({ fields: { name: 1 }, sortBy: "name", direction: "asc" });
    const dropdownOptions = competitionData.records.map((option) => ({
      value: option._id,
      label: option.name,
    }));
    setCompetitionList(dropdownOptions);
    setCompetitionLoading(false);
  };
  const filterData = async () => {
    Promise.all([fetchSportList(), fetchCompetitionList()]);
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
        {permission.EVENTS.ACTIVE && competitionName === "" && (
          <div className="ms-auto pageheader-btn">
            <Link to={`${process.env.PUBLIC_URL}/event-form`} className="btn btn-primary btn-icon text-white me-3">
              <span>
                <i className="fe fe-plus"></i>&nbsp;
              </span>
              CREATE EVENT
            </Link>
          </div>
        )}
      </div>

      <Card>
        {competitionName === "" && (
          <Card.Header className="d-block">
            <Row className="w-100">
              <FormSelectWithSearch
                isLoading={competitionLoading}
                placeholder={competitionLoading ? "Loading..." : "Select Competition"}
                label="Competition"
                name="sportId"
                value={selectedCompetition} // Set the selectedCompetition as the value
                onChange={(name, selectedValue) => setSelectedCompetition(selectedValue)} // Update the selectedCompetition
                onBlur={() => {}} // Add an empty function as onBlur prop
                error=""
                width={3}
                options={competitionList}
              />

              <FormSelectWithSearch
                key={formSelectKey} // Add the key prop here
                isLoading={sportLoading}
                placeholder={sportLoading ? "Loading Sports..." : "Select Sport"}
                label="Sport"
                name="sportId"
                value={selectedSport} // Set the selectedSport as the value
                onChange={(name, selectedValue) => setSelectedSport(selectedValue)} // Update the selectedSport
                onBlur={() => {}} // Add an empty function as onBlur prop
                error=""
                width={3}
                options={sportList}
              />
            </Row>

            <Row className="mt-2">
              <FormInput
                label="Start Date"
                name="startDate"
                type="date"
                value={startDateValue}
                onChange={(event) => setStartDateValue(event.target.value)} // Use event.target.value to get the updated value
                onBlur={() => {}}
                width={3}
              />

              <FormInput
                label="End Date"
                name="endDate"
                type="date"
                value={endDateValue}
                onChange={(event) => setEndDateValue(event.target.value)} // Use event.target.value to get the updated value
                onBlur={() => {}}
                width={3}
              />

              <FormSelect
                label="Status"
                name="status"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)} // Use event.target.value to get the updated value
                onBlur={() => {}}
                width={3}
              >
                {statusList.map((status, index) => (
                  <option key={index} value={status.id}>
                    {status.lable.toUpperCase()}
                  </option>
                ))}
              </FormSelect>

              <CCol md="3">
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
            </Row>
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
    </div>
  );
}
