import { CSpinner } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import SearchInput from "../../../components/Common/FormComponents/SearchInput";
import { decryptUserPermissions, getAllData, getUserDefaultPermissions, user } from "../accountService";

const generateTableColumns = (moduleList) => {
  const columns = [
    {
      name: "SR.NO",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
      style: { position: "sticky", left: 0, zIndex: 1, backgroundColor: "#f9f9f9" },
    },
    {
      name: "USERNAME",
      selector: (row) => [row.username],
      sortable: true,
      sortField: "username",
      style: { position: "sticky", left: 0, zIndex: 1, backgroundColor: "#f9f9f9" },
    },
    {
      name: "FULL NAME",
      selector: (row) => [row.fullName],
      sortable: true,
      sortField: "fullName",
      style: { position: "sticky", left: 0, zIndex: 1, backgroundColor: "#f9f9f9" },
    },
  ];

  const isActivePermission = (module, permissions) => {
    const modulePermission = permissions.find((permission) => permission.key === module);
    if (modulePermission) {
      return modulePermission.isActive;
    }
    return false;
  };

  moduleList.forEach((module) => {
    columns.push({
      name: module.split("_").join(" ").toUpperCase(),
      selector: (row) => [row.key],
      sortable: true,
      sortField: module,
      cell: (row) => (
        <div className="h4 mb-0">
          {isActivePermission(module, row.permissions) ? <i className="fa fa-check-circle text-success" /> : null}
        </div>
      ),
    });
  });

  columns.push({
    name: "ACTION",
    cell: (row) => (
      <div>
        <Link to={`${process.env.PUBLIC_URL}/multi-login`} state={{ id: row._id }} className="btn btn-primary btn-lg">
          <i className="fa fa-edit"></i>
        </Link>
        {/* <button onClick={(e) => handleDelete(row._id)} className="btn btn-danger btn-lg ms-2"><i className="fa fa-trash"></i></button> */}
      </div>
    ),
    width: "150px",
  });

  return columns;
};

function MultiLoginListing({ parentLoading = false, id }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clonedUsers, setClonedUsers] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [tableColumns, setTableColumns] = useState([]);

  const handleSort = (column, sortDirection) => {
    setSortBy(column.sortField);
    setDirection(sortDirection);
    setCurrentPage(1);
    setLoading(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = async (newPerPage) => {
    setLoading(true);
    setPerPage(newPerPage);
    setLoading(false);
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      const params = {
        page: currentPage,
        perPage,
        sortBy,
        direction,
        searchQuery,
        cloneParentId: user._id,
        withPermissions: true,
      };

      setLoading(true);

      Promise.all([getAllData(params), getUserDefaultPermissions()])
        .then(([userData, defaultPermissions]) => {
          const moduleList =
            defaultPermissions
              ?.flatMap((module) => {
                if (module.subModules?.length) {
                  return [...module.subModules, module];
                }
                return module;
              })
              ?.map((module) => module.key) || [];

          if (userData) {
            const users = userData.records.map((user) => {
              const clonedUser = { ...user };
              const userPermissions = decryptUserPermissions(user.permissions);
              clonedUser.permissions = userPermissions.flatMap((module) => {
                if (module.subModules?.length) {
                  return [...module.subModules, module];
                }
                return module;
              });
              return clonedUser;
            });

            setClonedUsers(users);
            setTableColumns(generateTableColumns(moduleList));
            setTotalRows(userData.totalRecords);
          }
        })
        .finally(() => setLoading(false));
    };

    fetchAllUsers();
  }, [id, currentPage, perPage, sortBy, direction, searchQuery]);

  return (
    <Card>
      <Card.Header>
        <h3 className="card-title">ALL MULTI LOGIN</h3>
      </Card.Header>

      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
            <CSpinner />
          </div>
        ) : (
          <>
            <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} loading={loading} />
            <div className="table-responsive export-table">
              <DataTable
                columns={tableColumns}
                data={clonedUsers}
                // onSelectedRowsChange={handleRowSelected}
                // clearSelectedRows={toggleCleared}
                // selectableRows
                pagination
                highlightOnHover
                progressPending={loading || parentLoading}
                paginationServer
                paginationTotalRows={totalRows}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                sortServer
                onSort={handleSort}
              />
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default MultiLoginListing;
