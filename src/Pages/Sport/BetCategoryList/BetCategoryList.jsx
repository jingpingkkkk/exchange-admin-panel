import React, { useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "react-data-table-component-extensions/dist/index.css";
import { Link, useLocation } from "react-router-dom";
import SearchInput from "../../../components/Common/FormComponents/SearchInput"; // Import the SearchInput component
import { showAlert } from "../../../utils/alertUtils";
import { downloadCSV } from "../../../utils/csvUtils";
import { deleteSport, getBetCategoryListBySportID } from "../sportService";

export default function BetCategoryList(props) {
  const Export = ({ onExport }) => (
    <Button className="btn btn-secondary" onClick={(e) => onExport(e.target.value)}>
      Export
    </Button>
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const location = useLocation();
  const { sportId } = location.state;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");

  // Function to generate URL with query parameter

  const columns = [
    {
      name: "SR.NO",
      selector: (row, index) => (currentPage - 1) * perPage + (index + 1),
      sortable: false,
    },
    {
      name: "BET CATEGORY",
      selector: (row) => [row.betCatName],
      sortable: true,
      sortField: "betCatName",
    },
    {
      name: "ACTION",
      cell: (row) => (
        <div>
          <OverlayTrigger placement="top" overlay={<Tooltip> Click here to edit</Tooltip>}>
            <Link
              to={`${process.env.PUBLIC_URL}/bet-category-setting`}
              state={{
                id: row._id,
                sportId: row.sportsId,
                betCatId: row.betCatId,
                betCatName: row.betCatName,
                sportsName: row.sportsName,
              }}
              className="btn btn-primary btn-lg"
            >
              <i className="fa fa-edit"></i>
            </Link>
          </OverlayTrigger>

          {/* <button onClick={(e) => handleDelete(row._id)} className="btn btn-danger btn-lg ms-2"><i className="fa fa-trash"></i></button>
          <Link
            to={{
              pathname: `${process.env.PUBLIC_URL}/rule-list`,
              // Pass the sportId as state
            }}
            state={{ sportId: row._id }}
            className="btn btn-info btn-lg ms-2"

          >
            <i className="fa fa-file"></i>
          </Link> */}
        </div>
      ),
    },
  ];

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
      const requestParameter = { page, perPage, sortBy, direction, sportId, searchQuery };
      const result = await getBetCategoryListBySportID(requestParameter);
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
        fetchData(currentPage, sortBy, direction, searchQuery, sportId);
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
    await downloadCSV("sportsBetCategories/getAllSportsBetCategory", searchQuery, "sports.csv");
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
  }, [perPage, searchQuery, sportId]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">BET CATEGORY BY SPORTS</h1>
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
          {/* <Link to={`${process.env.PUBLIC_URL}/sport-add`} className="btn btn-primary btn-icon text-white me-3">
            <span>
              <i className="fe fe-plus"></i>&nbsp;
            </span>
            CREATE SPORT
          </Link> */}
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
