import React, { useState, useEffect } from "react";
import { Row, Card, Col, Button } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "react-data-table-component-extensions/dist/index.css";
import { getChildUserData, settlement } from "../bankStatementService";
import { Notify } from "../../../utils/notify";
import { downloadCSV } from "../../../utils/csvUtils";
import { showAlert } from "../../../utils/alertUtils";
import SearchInput from "../../../components/Common/FormComponents/SearchInput"; // Import the SearchInput component

import { getAllData } from "../../Account/accountService";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { CCol, CButton, CSpinner } from "@coreui/react";
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import { exportToExcel, exportToPDF } from "../../../utils/exportUtils"; // Import utility functions for exporting

export default function Bank() {
  const Export = ({ onExport }) => (
    <Button className="btn btn-secondary" onClick={(e) => onExport(e.target.value)}>
      Export
    </Button>
  );

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userList, setuserList] = useState([]);
  const [transactionCode, setTransactionCode] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [filters, setFilters] = useState({
    filterUserId: "",
    // Add more filters here if needed
  });
  const [formSelectKey, setFormSelectKey] = useState(0);
  const { _id } = JSON.parse(localStorage.getItem("user_info")) || {};

  const handleAllButtonClick = (row) => {
    console.log(row);
    const oppositeValue = -row.userPl;
    const updatedRow = { ...row, amount: oppositeValue || 0 };
    const updatedData = data.map((rowData) => (rowData === row ? updatedRow : rowData));
    setData(updatedData);
  };

  const handleAmountChange = (row, event) => {
    const newValue = event.target.value;
    if (newValue >= 0) {
      // Check if the entered value is greater than or equal to 0
      const updatedData = data.map((rowData) => (rowData === row ? { ...rowData, amount: newValue } : rowData));
      setData(updatedData);
    }
  };

  const handleSubmitButtonClick = async (row) => {
    try {
      // Call your API function here with the amount
      // Example: await yourApiFunction(row, amount);

      const amount = row.amount || 0;
      if (amount === 0 && transactionCode.length === 0) {
        let msg = "Please Enter amount";
        let msg1 = "Please Enter Transaction Code";
        Notify.error(msg);
        Notify.error(msg1);
        // No amounts to transfer
        return;
      }

      // if (row.userPl < row.amount) {
      //   let msg = "Please Enter valid amount";
      //   Notify.error(msg);
      //   // No amounts to transfer
      //   return;
      // }

      setLoading(true);
      let settlementData = [
        {
          userId: row._id,
          amount: row.amount,
        },
      ];

      let response = null;
      response = await settlement({
        loginUserId: _id,
        transactionCode: transactionCode,
        settlementData,
      });
      if (response.success) {
        let msg = "Account settlement successfully";
        Notify.success(msg);
        fetchData(filters);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Notify.error(error.message);
      console.error("Error calling API:", error);
      // Handle the error as needed
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    // {
    //   name: "SR.NO",
    //   selector: (row, index) => ((currentPage - 1) * perPage) + (index + 1),
    //   sortable: false,
    // },
    {
      name: "USERNAME",
      selector: (row) => [row.username],
      sortable: true,
      sortField: "username",
    },
    {
      name: "CR",
      selector: (row) => [row.creditPoints],
      sortable: true,
      sortField: "creditPoints",
    },
    {
      name: "PTS",
      selector: (row) => [row.points.toFixed(2)],
      sortable: true,
      sortField: "points",
    },
    {
      name: "CLIENT(P/L)",
      selector: (row) => [row.userPl?.toFixed(2)],
      sortable: true,
      sortField: "userPl",
    },
    {
      name: "EXPOSURE",
      selector: (row) => [row.exposure?.toFixed(2)],
      sortable: true,
      sortField: "exposure",
    },
    {
      name: "AVAILABLE PTS",
      selector: (row) => [row.balance?.toFixed(2)],
      sortable: true,
      sortField: "balance",
    },
    {
      name: "ACCOUNT TYPE",
      selector: (row) => [row.role],
      sortable: true,
      sortField: "role",
    },
    {
      name: "ACTION",
      selector: (row) => [row.fromtoName],
      sortable: true,
      sortField: "fromtoName",
      width: "200px",
      cell: (row) => (
        <Row className=" row-sm">
          <Col lg={4}>
            <button
              className="text-success"
              onClick={() => handleAllButtonClick(row)}
              style={{ border: "none", background: "none", cursor: "pointer" }}
            >
              All <i className="fe fe-arrow-right"></i>
            </button>
          </Col>
          <Col lg={8}>
            <input
              type="number"
              name="amount"
              placeholder="0"
              className="form-control form-control-sm transfer-amt"
              value={row.amount || ""}
              onChange={(e) => handleAmountChange(row, e)}
            />
          </Col>
          <button className="btn btn-info btn-sm mt-2" onClick={() => handleSubmitButtonClick(row)}>
            Submit
          </button>
        </Row>
      ),
    },
    {
      name: "STATUS",
      selector: (row) => [row.fromtoName],
      sortable: true,
      sortField: "fromtoName",
      cell: (row) => <div></div>,
    },
  ];

  const transferAmounts = async () => {
    const settlementData = data.filter((row) => row.amount > 0).map((row) => ({ _id: row._id, amount: row.amount }));
    if (settlementData.length === 0 && !transactionCode) {
      let msg = "Please add amount";
      let msg1 = "Please Enter Transaction Code";

      Notify.error(msg, msg1);
      Notify.error(msg1);

      // No amounts to transfer
      return;
    }
    console.log(transactionCode);
    // if (!transactionCode) {
    //   let msg = "Please Enter Transaction Code";
    // Notify.error(msg);
    // No amounts to transfer
    //   return;
    // }
    try {
      let response = null;
      response = await settlement({
        loginUserId: _id,
        transactionCode: transactionCode,
        settlementData,
      });
      if (response.success) {
        let msg = "Account settlement successfully";
        Notify.success(msg);
        fetchData(filters);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Notify.error(error.message);
      console.error("Error calling API:", error);
      // Handle the error as needed
    }
  };

  const fetchData = async (filters) => {
    setLoading(true);
    try {
      const { filterUserId } = filters;
      const result = await getChildUserData({
        userId: _id,
        filterUserId: filterUserId,
      });
      setData(result.details);
      //setData(dummyDataArray);
      //setTotalRows(result.totalRecords);
      setLoading(false);
    } catch (error) {
      // Handle error
      console.error("Error fetching :", error);
      // Display error message or show notification to the user
      // Set the state to indicate the error condition
      setLoading(false);
    }
  };

  const handleExcelExport = async (filters) => {
    try {
      //const response = await yourExcelApiCall(); // Replace with your actual API call
      // Generate and download Excel file
      const { filterUserId } = filters;
      const result = await getChildUserData({
        userId: _id,
        filterUserId: filterUserId,
      });

      const formattedData = result.details.map((item) => ({
        USERNAME: item.username,
        CR: item.creditPoints,
        PTS: item.points,
        "CLIENT(P/L)": item.userPl,
        EXPOSURE: item.exposure,
        "AVAILABLE PTS": item.balance,
        "ACCOUNT TYPE": item.role,
        STATUS: item.fromtoName,
      }));
      exportToExcel(formattedData, "bank.xlsx"); // Utilize exportToExcel utility function
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const handlePDFExport = async (filters) => {
    try {
      //const response = await yourPDFApiCall(); // Replace with your actual API call

      const { filterUserId } = filters;
      const result = await getChildUserData({
        userId: _id,
        filterUserId: filterUserId,
      });

      const columns = ["USERNAME", "CR", "PTS", "CLIENT(P/L)", "EXPOSURE", "AVAILABLE PTS", "ACCOUNT TYPE", "STATUS"];

      const formattedData = result.details.map((item) => ({
        USERNAME: item.username,
        CR: item.creditPoints,
        PTS: item.points,
        "CLIENT(P/L)": item.userPl,
        EXPOSURE: item.exposure,
        "AVAILABLE PTS": item.balance,
        "ACCOUNT TYPE": item.role,
        STATUS: item.fromtoName,
      }));
      exportToPDF(columns, formattedData, "book.pdf");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    }
  };

  const handleFilterClick = () => {
    const newFilters = {
      filterUserId: selectedUser,
    };
    setFilters(newFilters);
    // Fetch data with the updated filters object
    fetchData(newFilters);
  };

  const resetFilters = () => {
    // Clear the filter values
    setSelectedUser("");
    // Add more filter states if needed
    setFormSelectKey(formSelectKey + 1);

    // Fetch data with the updated filters object
    fetchData({
      filterUserId: "",
      // Add more filters here if needed
    });
  };

  const filterData = async () => {
    try {
      const userData = await getAllData();
      if (userData.records) {
        const dropdownOptions = userData.records.map((option) => ({
          value: option._id,
          label: option.username,
        }));
        setuserList(dropdownOptions);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Handle the error appropriately (e.g., show an error message)
    }
  };

  useEffect(() => {
    fetchData(filters); // fetch page 1 of users
    filterData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">BANK</h1>
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

              <CCol xs={6}>
                <div className="d-grid gap-2 d-md-block">
                  <CButton color="primary" type="submit" onClick={handleFilterClick} className="me-3 mt-6">
                    {loading ? <CSpinner size="sm" /> : "Load"}
                  </CButton>
                  <button
                    onClick={resetFilters} // Call the resetFilters function when the "Reset" button is clicked
                    className="btn btn-danger btn-icon text-white mt-6"
                  >
                    Reset
                  </button>
                </div>
              </CCol>

              <Button variant="success" className="me-2 mt-6" onClick={handleExcelExport}>
                <i className="fa fa-file-excel-o"></i>
              </Button>
              <Button variant="primary" className=" mt-6" onClick={handlePDFExport}>
                <i className="fa fa-file-pdf-o"></i>
              </Button>
              <FormInput
                label="Transaction Code "
                name="transactionCode"
                type="text"
                value={transactionCode}
                onChange={(event) => setTransactionCode(event.target.value)} // Use event.target.value to get the updated value
                onBlur={() => {}}
                width={2}
              />
              <CCol xs={3}>
                <div className="d-grid gap-2 d-md-block float-right">
                  <CButton color="primary" type="submit" onClick={transferAmounts} className="me-3 mt-6">
                    {loading ? <CSpinner size="sm" /> : "Transfer All"}
                  </CButton>
                </div>
              </CCol>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive export-table">
                <DataTable
                  columns={columns}
                  data={data}
                  //selectableRows
                  //pagination
                  highlightOnHover
                  progressPending={loading}
                  //paginationServer
                  //paginationTotalRows={totalRows}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
