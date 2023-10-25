import React from "react";
import { Card, Spinner } from "react-bootstrap";

function Loader({ text = "" }) {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "250px" }}>
          <Spinner animation="border" />
          {text ? <div className="mt-4">{text}</div> : null}
        </div>
      </Card.Body>
    </Card>
  );
}

export default Loader;
