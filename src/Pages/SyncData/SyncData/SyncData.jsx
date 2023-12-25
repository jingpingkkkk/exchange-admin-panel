import React, { useState } from "react";
import { Breadcrumb, Card, Col, Row, Spinner } from "react-bootstrap";
import { getAllActiveEvents, syncData } from "../syncDataService";
import { CButton } from "@coreui/react";
import { Notify } from "../../../utils/notify";

export default function SyncData() {
  const [syncLoading, setSyncLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);

  const onSyncData = async () => {
    setSyncLoading(true);
    try {
      const success = await syncData();
      if (success) {
        Notify.success("Data synced successfully.");
        setSyncLoading(false);
      }
    } catch (error) {
      // Handle error
      console.error("Error removing :", error);
      Notify.error(error.message);
      // Set the state to indicate the error condition
      setSyncLoading(false);
    }
  };

  const onGetAllevents = async () => {
    setEventLoading(true);
    try {
      const success = await getAllActiveEvents();
      if (success) {
        setEventLoading(false);
      }
    } catch (error) {
      // Handle error
      console.error("Error removing :", error);
      // Set the state to indicate the error condition
      setEventLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header ">
        <div>
          <h1 className="page-title">Sync Data</h1>
          <Breadcrumb className="breadcrumb">
            <Breadcrumb.Item className="breadcrumb-item" href="#">
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item active breadcrumds" aria-current="page">
              Sync Data
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>
      <Row>
        <Col className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <Card>
            <Card.Body className="card-body">
              <CButton
                color="primary"
                type="button"
                className="btn-primary"
                onClick={onSyncData}
                disabled={syncLoading}
              >
                {syncLoading ? <Spinner animation="border" size="sm" className="me-2" /> : ""} Sync Data
              </CButton>
              <CButton
                color="primary"
                type="button"
                className="btn-primary ms-3"
                onClick={onGetAllevents}
                disabled={eventLoading}
              >
                {eventLoading ? <Spinner animation="border" size="sm" className="me-2" /> : ""} Get All Active Events
              </CButton>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
