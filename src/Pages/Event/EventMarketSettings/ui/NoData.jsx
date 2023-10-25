import React from "react";
import { Card } from "react-bootstrap";

function NoData({ text = "Data not found" }) {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "200px" }}>
          <h5 className="text-center text-muted">{text}</h5>
        </div>
      </Card.Body>
    </Card>
  );
}

export default NoData;
