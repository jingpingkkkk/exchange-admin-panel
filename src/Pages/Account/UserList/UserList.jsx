import { CSpinner } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "react-data-table-component-extensions/dist/index.css";
import { Link } from "react-router-dom";
import SearchInput from "../../../components/Common/FormComponents/SearchInput"; // Import the FormInput component
import { permission } from "../../../lib/user-permissions";
import { showAlert } from "../../../utils/alertUtils";
import { downloadCSV } from "../../../utils/csvUtils";
import { Notify } from "../../../utils/notify";
import TransactionModal from "../TransactionModal";
import { createTransaction, deleteData, getAllData, getUserDetails, updateUserStatus } from "../accountService";

const Export = ({ onExport }) => (
  <Button className="btn btn-secondary" onClick={(e) => onExport(e.target.value)}>
    Export
  </Button>
);

export default function UserList() {
  const [parentLoading, setParentLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({});

  useEffect(() => {
    const getData = async () => {
      setParentLoading(true);
      const user = await getUserDetails({ parentId: 1, isClone: 1, cloneParentId: 1, role: 1 });
      setLoggedInUser(user);
      setParentLoading(false);
    };
    getData();
    return () => {
      setLoggedInUser({});
    };
  }, []);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [userStatus, setUserStatus] = useState({});
  const [userBetStatus, setUserBetStatus] = useState({});
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [rowData, setRowData] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [serverError, setServerError] = useState(null);

  const allowedRoles = ["user"];

  const changeUserStatus = async (type, id, key, value) => {
    if (type === "bet") {
      setUserBetStatus((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    } else {
      setUserStatus((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    }
  };

  const toggleStatus = async (type, id, toggleValue) => {
    changeUserStatus(type, id, "loading", true);
    const fieldName = type === "bet" ? "isBetLock" : "isActive";
    try {
      const status = type === "bet" ? !userBetStatus[id]?.isBetLock : !userStatus[id]?.isActive;
      const request = { _id: id, fieldName, status: status.toString() };
      const result = await updateUserStatus(request);
      if (result.success) {
        Notify.success(type === "bet" ? "Bet status changed successfully" : "User status updated successfully");
        changeUserStatus(type, id, fieldName, result.data.details[fieldName]);
      }
    } catch (error) {
      Notify.error(type === "bet" ? "Error updating bet status" : "Error updating user status");
      console.error("Error removing :", error);
    }
    changeUserStatus(type, id, "loading", false);
  };

  const handleDepositClick = (row) => {
    // Set initial values for the Deposit modal based on the row data
    setShowTransactionModal(true);
    setRowData(row);
    setTransactionType("credit");
  };

  const handleWithdrawClick = (row) => {
    // Set initial values for the Withdraw modal based on the row data
    setShowTransactionModal(true);
    setRowData(row);
    setTransactionType("debit");
  };

  const handleTransactionSubmit = async (amount, remarks, transactionCode, transactionType, userId) => {
    try {
      const result = await createTransaction({
        userId: loggedInUser._id,
        fromId: userId,
        points: amount,
        type: transactionType,
        remark: remarks,
        transactionCode: transactionCode,
      });
      if (!result.success) {
        throw new Error(result.message);
      } else {
        Notify.success("Transaction Done!!!.");
        setShowTransactionModal(false);
        fetchData(currentPage, sortBy, direction, searchQuery, loggedInUser.parentId); // fetch page 1 of users
      }
    } catch (error) {
      Notify.error(error.message);
      setServerError(error.message);
    }
  };

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
      sortField: "username",
    },
    {
      name: "FULL NAME",
      selector: (row) => [row.fullName],
      sortable: true,
      sortField: "fullName",
    },
    {
      name: "MOBILE NUMBER",
      selector: (row) => [row.mobileNumber],
      sortable: true,
      sortField: "mobileNumber",
    },
    {
      name: "BALANCE",
      selector: (row) => [row.balance],
      sortable: true,
      sortField: "balance",
    },
    {
      name: "CITY",
      selector: (row) => [row.city],
      sortable: true,
      sortField: "city",
    },
    {
      name: "PL",
      selector: (row) => [row.userPl],
      sortable: true,
      sortField: "userPl",
    },
    {
      name: "EXPOSURE",
      selector: (row) => [row.exposure],
      sortable: true,
      sortField: "exposure",
    },
    {
      name: "REGISTERED DATE",
      width: "150px",
      selector: (row) => {
        const originalDate = new Date(row.createdAt);
        const formattedDate = originalDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return <div title={formattedDate}>{formattedDate}</div>;
      },
      sortable: true,
      sortField: "createdAt",
    },
    permission.USER_MODULE.USER_BET_UPDATE && {
      name: "BET LOCK",
      selector: (row) => [row.betCategory],
      sortable: false,
      cell: (row) => (
        <div className="material-switch mt-4 d-flex align-items-center" key={row._id}>
          <input
            id={`betSwitch_${row._id}`}
            name={`notes[${row._id}].isBetLock`}
            onChange={() => toggleStatus("bet", row._id, row.isBetLock)}
            checked={userBetStatus[row._id]?.isBetLock || false}
            type="checkbox"
            disabled={!permission.USER_MODULE.USER_BET_UPDATE}
          />
          <label htmlFor={`betSwitch_${row._id}`} className="label-primary"></label>
          {userBetStatus[row._id]?.loading ? (
            <div className="pb-2 ps-4">
              <CSpinner size="sm" />
            </div>
          ) : null}
        </div>
      ),
    },
    permission.USER_MODULE.USER_STATUS_UPDATE && {
      name: "USER LOCK",
      selector: (row) => [row.betCategory],
      sortable: false,
      cell: (row) => (
        <div className="material-switch mt-4 d-flex align-items-center" key={row._id}>
          <input
            id={`userSwitch_${row._id}`}
            name={`notes[${row._id}].isActive`}
            onChange={() => toggleStatus("user", row._id, row.isActive)}
            checked={userStatus[row._id]?.isActive || false}
            type="checkbox"
            disabled={!permission.USER_MODULE.USER_STATUS_UPDATE}
          />
          <label htmlFor={`userSwitch_${row._id}`} className="label-primary"></label>
          {userStatus[row._id]?.loading ? (
            <div className="pb-2 ps-4">
              <CSpinner size="sm" />
            </div>
          ) : null}
        </div>
      ),
    },
    permission.USER_MODULE.UPDATE && {
      name: "ACTION",
      width: "260px",
      cell: (row) => (
        <div>
          <OverlayTrigger placement="top" overlay={<Tooltip> Click here to deposit</Tooltip>}>
            <Button variant="success" onClick={() => handleDepositClick(row)} className="btn btn-lg " title="Deposit">
              D
            </Button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={<Tooltip> Click here to withdraw</Tooltip>}>
            <Button
              variant="danger"
              onClick={() => handleWithdrawClick(row)}
              className="btn btn-lg ms-2 me-2"
              title="Withdraw"
            >
              W
            </Button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={<Tooltip> Click here to edit</Tooltip>}>
            <Link to="/user-edit" state={{ id: row._id }} className="btn btn-primary btn-lg ms-2 me-2">
              <i className="fa fa-edit"></i>
            </Link>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={<Tooltip> Click here to see activity</Tooltip>}>
            <Link to="/user-activity" state={{ id: row._id }} className="btn btn-primary btn-lg">
              <i className="fa fa-history"></i>
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
  // const handleRowSelected = React.useCallback((state) => {
  //   setSelectedRows(state.selectedRows);
  //   const selectedUser = state.selectedRows[0]; // Assuming only one user can be selected at a time
  //   if (selectedUser) {
  //     setParentId(selectedUser._id);
  //   }
  // }, []);

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

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const result = await getAllData({
        page: page,
        perPage: perPage,
        sortBy: sortBy,
        direction: direction,
        searchQuery: searchQuery,
        parentId: loggedInUser.parentId,
        role: allowedRoles,
      });

      setData(result.records);
      setTotalRows(result.totalRecords);
      result.records.forEach((user) => {
        userStatus[user._id] = { loading: false, isActive: user.isActive };
        userBetStatus[user._id] = { loading: false, isBetLock: user.isBetLock };
      });
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
      const success = await deleteData(id);
      if (success) {
        fetchData(currentPage);
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
    fetchData(currentPage);
    setLoading(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setLoading(true);
    setPerPage(newPerPage);
    setLoading(false);
  };

  const handleDownload = async () => {
    await downloadCSV(
      "users/getAllUsers",
      { searchQuery, parentId: loggedInUser.parentId, role: ["user"] },
      "users.csv"
    );
  };

  const handleDelete = (id) => {
    showAlert(id, removeRow);
  };

  useEffect(() => {
    setData([]);
    if (searchQuery !== "") {
      fetchData(currentPage, sortBy, direction, searchQuery, loggedInUser.parentId); // fetch page 1 of users
    } else {
      fetchData(currentPage, sortBy, direction, searchQuery, loggedInUser.parentId); // fetch page 1 of users
    }
    return () => {
      setData([]);
    };
  }, [perPage, searchQuery, loggedInUser.parentId]);

  return (
    <>
      {parentLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
          <CSpinner />
        </div>
      ) : (
        <>
          <div className="page-header">
            <div>
              <h1 className="page-title">ALL USERS</h1>
            </div>
            <div className="ms-auto pageheader-btn">
              {permission.USER_MODULE.CREATE && (
                <Link to={`${process.env.PUBLIC_URL}/user-form`} className="btn btn-primary btn-icon text-white me-3">
                  <span>
                    <i className="fe fe-plus"></i>&nbsp;
                  </span>
                  CREATE USER
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
                <Card.Body>
                  <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} loading={loading} />
                  <div className="table-responsive export-table">
                    <DataTable
                      columns={columns}
                      data={data}
                      actions={actionsMemo}
                      contextActions={contextActions}
                      // onSelectedRowsChange={handleRowSelected}
                      // clearSelectedRows={toggleCleared}
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
          <TransactionModal
            show={showTransactionModal}
            onHide={() => setShowTransactionModal(false)}
            handleTransactionSubmit={handleTransactionSubmit}
            rowData={rowData}
            transactionType={transactionType}
          />
        </>
      )}
    </>
  );
}
