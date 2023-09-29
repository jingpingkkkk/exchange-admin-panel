import { CButton, CCol, CSpinner } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "react-data-table-component-extensions/dist/index.css";
import { Link } from "react-router-dom";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormSelect from "../../../components/Common/FormComponents/FormSelect"; // Import the FormSelect component
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import SearchInput from "../../../components/Common/FormComponents/SearchInput"; // Import the SearchInput component
import { permission } from "../../../lib/user-permissions";
import { showAlert } from "../../../utils/alertUtils";
import { downloadCSV } from "../../../utils/csvUtils";
import { Notify } from "../../../utils/notify";
import { getAllSport } from "../../Sport/sportService";
import { changeStatus, deleteCompetition, getAllCompetition } from "../competitionService";

export default function CompetitionList() {
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
  const [sportList, setSportList] = useState([]);
  // Filter param
  const [startDateValue, setStartDateValue] = useState("");
  const [endDateValue, setEndDateValue] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [formSelectKey, setFormSelectKey] = useState(0);

  const [competitionStatus, setCompetitionStatus] = useState({}); // status and loading state of each competition
  const [sportLoading, setSportLoading] = useState(false);

  const [filters, setFilters] = useState({
    sportId: "",
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

  const updateCompetitionStatus = (id, key, value) => {
    setCompetitionStatus((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  const toggleHighlight = async (id, isActive) => {
    updateCompetitionStatus(id, "loading", true);
    try {
      const newStatus = !isActive;
      const request = { _id: id, fieldName: "isActive", status: newStatus.toString() };
      const result = await changeStatus(request);
      //const result = await changeStatus({ _id: id, status: newStatus.toString() });
      if (result.success) {
        Notify.success("Status updated successfully");
        updateCompetitionStatus(id, "isActive", result.data.details.isActive);
      }
    } catch (error) {
      console.error("Error removing :", error);
    }
    updateCompetitionStatus(id, "loading", false);
  };

  // const toggleHighlight = async (id, isActive) => {
  //   setLoading(true);
  //   try {
  //     const newStatus = !isActive; // Toggle the isActive status
  //     const request = { _id: id, fieldName: 'isActive', status: newStatus.toString() };
  //     const success = await changeStatus(request);
  //     if (success) {
  //       fetchData(currentPage, sortBy, direction, searchQuery, filters);
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     // Handle error
  //     console.error("Error removing :", error);
  //     // Display error message or show notification to the user
  //     // Set the state to indicate the error condition
  //     setLoading(false);
  //   }
  // };

  const columns = [
    {
      name: "SR.NO",
      selector: (row, index) => (currentPage - 1) * perPage + (index + 1),
      sortable: false,
      width: "80px",
    },
    {
      name: "NAME",
      selector: (row) => <div title={row.name}>{row.name}</div>,
      sortable: true,
      sortField: "name",
    },
    {
      name: "SPORT",
      selector: (row) => <div title={row.sportsName}>{row.sportsName}</div>,
      sortable: true,
      sortField: "sportsName",
      width: "150px",
    },
    {
      name: "START DATE",
      width: "150px",
      selector: (row) => {
        const originalDate = new Date(row.startDate);
        if (!row.endDate) {
          return "-";
        }
        if (isNaN(originalDate)) {
          return "-";
        }
        const formattedDate = originalDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return <div title={formattedDate}>{formattedDate}</div>;
      },
      sortable: true,
      sortField: "startDate",
    },
    {
      name: "END DATE",
      width: "150px",
      selector: (row) => {
        const originalDate = new Date(row.endDate);
        if (!row.endDate) {
          return "-";
        }
        if (isNaN(originalDate)) {
          return "-";
        }
        const formattedDate = originalDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return <div title={formattedDate}>{formattedDate}</div>;
      },
      sortable: true,
      sortField: "startDate",
    },
    {
      name: "STAGE",
      selector: (row) => <div title={row.competitionStatus}>{row.competitionStatus}</div>,
      sortable: true,
      sortField: "competitionStatus",
      width: "100px",
    },
    permission.COMPETITIONS.ACTIVE && {
      name: "STATUS",
      width: "100px",
      selector: (row) => [row.betCategory],
      sortable: false,
      cell: (row) => (
        <div className="material-switch mt-4 d-flex align-items-center" key={row._id}>
          <input
            id={`highlightSwitch_${row._id}`}
            name={`notes[${row._id}].highlight`}
            onChange={() => toggleHighlight(row._id, competitionStatus[row._id]?.isActive)}
            checked={competitionStatus[row._id]?.isActive || false}
            type="checkbox"
          />
          <label htmlFor={`highlightSwitch_${row._id}`} className="label-primary"></label>
          {competitionStatus[row._id]?.loading ? (
            <div className="pb-2 ps-4">
              <CSpinner size="sm" />
            </div>
          ) : null}
        </div>
      ),
    },
    {
      name: "TOTAL EVENTS",
      width: "150px",
      cell: (row) => (
        <div>
          <OverlayTrigger placement="top" overlay={<Tooltip> Click here to see events</Tooltip>}>
            <Link
              to={`${process.env.PUBLIC_URL}/competition-event-list`}
              state={{ competitionId: row._id, competitionName: row.name }}
              className="btn btn-info btn-lg ms-2"
            >
              {row.totalEvent}
            </Link>
          </OverlayTrigger>
          {/* <button onClick={(e) => handleDelete(row._id)} className="btn btn-danger btn-lg ms-2"><i className="fa fa-trash"></i></button> */}
        </div>
      ),
    },
    {
      name: "BET DELAY SEC",
      width: "125px",
      selector: (row) => [row.betDelay],
      sortable: true,
      sortField: "betDelay",
    },
    permission.COMPETITIONS.ACTIVE && {
      width: "125px",
      name: "ACTION",
      cell: (row) => (
        <div>
          <OverlayTrigger placement="top" overlay={<Tooltip> Click here to edit</Tooltip>}>
            <Link
              to={`${process.env.PUBLIC_URL}/competition-form`}
              state={{ id: row._id }}
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
      const { sportId, fromDate, toDate, status } = filters;

      const result = await getAllCompetition({
        page: page,
        perPage: perPage,
        sortBy: sortBy,
        direction: direction,
        searchQuery: searchQuery,
        sportId: sportId,
        fromDate: fromDate,
        toDate: toDate,
        status: status,
      });
      const initialCompetitionStatus = result.records.reduce((acc, competition) => {
        acc[competition._id] = { isActive: competition.isActive, loading: false };
        return acc;
      }, {});
      setCompetitionStatus(initialCompetitionStatus);
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

  const removeRow = async (id) => {
    setLoading(true);
    try {
      const success = await deleteCompetition(id);
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
    await downloadCSV("competition/getAllCompetition", searchQuery, "competition.csv");
  };

  const handleDelete = (id) => {
    showAlert(id, removeRow);
  };

  const filterData = async () => {
    setSportLoading(true);
    const sportData = await getAllSport();
    const dropdownOptions = sportData.records.map((option) => ({
      value: option._id,
      label: option.name,
    }));
    setSportList(dropdownOptions);
    setSportLoading(false);
  };

  const handleFilterClick = () => {
    const newFilters = {
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
    setSelectedSport("");
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
      status: "",
      // Add more filters here if needed
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
          <h1 className="page-title">ALL COMPETITION</h1>
          {/* <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item" href="#">
              Category
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item active breadcrumds" aria-current="page">
              List
            </Breadcrumb.Item>
          </Breadcrumb> */}
        </div>
        {permission.COMPETITIONS.ACTIVE && (
          <div className="ms-auto pageheader-btn">
            <Link
              to={`${process.env.PUBLIC_URL}/competition-form`}
              className="btn btn-primary btn-icon text-white me-3"
            >
              <span>
                <i className="fe fe-plus"></i>&nbsp;
              </span>
              CREATE COMPETITION
            </Link>
          </div>
        )}
      </div>

      <Row className=" row-sm">
        <Col lg={12}>
          <Card>
            <Card.Header>
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
                width={2}
                options={sportList}
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

              <FormSelect
                label="Status"
                name="status"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)} // Use event.target.value to get the updated value
                onBlur={() => {}}
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
