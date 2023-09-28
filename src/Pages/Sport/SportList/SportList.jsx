import { CSpinner } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "react-data-table-component-extensions/dist/index.css";
import { Link } from "react-router-dom";
import SearchInput from "../../../components/Common/FormComponents/SearchInput"; // Import the SearchInput component
import { permission } from "../../../lib/user-permissions";
import { showAlert } from "../../../utils/alertUtils";
import { downloadCSV } from "../../../utils/csvUtils";
import { Notify } from "../../../utils/notify";
import { changeStatus, deleteSport, getAllSport } from "../sportService";

export default function SportList() {
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
  const [sortBy, setSortBy] = useState("positionIndex");
  const [direction, setDirection] = useState("asc");
  const [sportStatus, setSportStatus] = useState({}); // status and loading state of each sport

  const updateSportStatus = (id, key, value) => {
    setSportStatus((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  const toggleHighlight = async (id, isActive) => {
    updateSportStatus(id, "loading", true);
    try {
      const newStatus = !isActive;
      const result = await changeStatus({ _id: id, status: newStatus.toString() });
      if (result.success) {
        Notify.success("Status updated successfully");
        updateSportStatus(id, "isActive", result.data.details.isActive);
      }
    } catch (error) {
      console.error("Error removing :", error);
    }
    updateSportStatus(id, "loading", false);
  };

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
      name: "TOTAL BET CATEGORY",
      selector: (row) => [row.betCategoryCount],
      sortable: false,
      cell: (row) => <span className="ms-2"> {row.betCategoryCount}</span>,
    },
    {
      name: "POSITION INDEX",
      selector: (row) => [row.positionIndex],
      sortable: true,
      sortField: "positionIndex",
    },
    permission.SPORTS.ACTIVE && {
      name: "STATUS",
      selector: (row) => [row.betCategory],
      sortable: false,
      cell: (row) => (
        <div className="material-switch mt-4 d-flex align-items-center" key={row._id}>
          <input
            id={`highlightSwitch_${row._id}`}
            name={`notes[${row._id}].highlight`}
            onChange={() => toggleHighlight(row._id, sportStatus[row._id]?.isActive)}
            checked={sportStatus[row._id]?.isActive || false}
            type="checkbox"
          />
          <label htmlFor={`highlightSwitch_${row._id}`} className="label-primary"></label>
          {sportStatus[row._id]?.loading ? (
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
          {permission.SPORTS.ACTIVE && (
            <OverlayTrigger placement="top" overlay={<Tooltip> Click here to edit</Tooltip>}>
              <Link
                to={`${process.env.PUBLIC_URL}/sport-form`}
                state={{ id: row._id }}
                className="btn btn-primary btn-lg"
              >
                <i className="fa fa-edit"></i>
              </Link>
            </OverlayTrigger>
          )}
          {/* <button onClick={(e) => handleDelete(row._id)} className="btn btn-danger btn-lg ms-2"><i className="fa fa-trash"></i></button> */}
          <OverlayTrigger placement="top" overlay={<Tooltip> Bet Categories and Rules</Tooltip>}>
            <Link
              to={{
                pathname: `${process.env.PUBLIC_URL}/bet-category-list`,
              }}
              state={{ sportId: row._id }}
              className="btn btn-info btn-lg ms-2"
            >
              <i className="fa fa-file"></i>
            </Link>
          </OverlayTrigger>
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

  const fetchData = async (page, sortBy, direction, searchQuery) => {
    setLoading(true);
    try {
      const result = await getAllSport(page, perPage, sortBy, direction, searchQuery);

      const initialSportStatus = result.records.reduce((acc, sport) => {
        acc[sport._id] = { isActive: sport.isActive, loading: false };
        return acc;
      }, {});
      setSportStatus(initialSportStatus);
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
      const success = await deleteSport(id);
      if (success) {
        fetchData(currentPage, sortBy, direction, searchQuery);
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
    fetchData(currentPage, sortBy, direction, searchQuery);
    setLoading(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page, sortBy, direction, searchQuery);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setLoading(true);
    setPerPage(newPerPage);
    setLoading(false);
  };

  const handleDownload = async () => {
    await downloadCSV("sport/getAllSport", searchQuery, "sports.csv");
  };

  const handleDelete = (id) => {
    showAlert(id, removeRow);
  };

  useEffect(() => {
    if (searchQuery !== "") {
      fetchData(currentPage, sortBy, direction, searchQuery); // fetch page 1 of users
    } else {
      fetchData(currentPage, sortBy, direction, ""); // fetch page 1 of users
    }
  }, [perPage, searchQuery]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">ALL SPORTS</h1>
          {/* <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item" href="#">
              Category
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item active breadcrumds" aria-current="page">
              List
            </Breadcrumb.Item>
          </Breadcrumb> */}
        </div>
        {permission.SPORTS.ACTIVE && (
          <div className="ms-auto pageheader-btn">
            <Link to={`${process.env.PUBLIC_URL}/sport-form`} className="btn btn-primary btn-icon text-white me-3">
              <span>
                <i className="fe fe-plus"></i>&nbsp;
              </span>
              CREATE SPORT
            </Link>
          </div>
        )}
      </div>

      <Row className=" row-sm">
        <Col lg={12}>
          <Card>
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
