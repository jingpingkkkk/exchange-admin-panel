import React, { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { Notify } from "../../../utils/notify";
import { getAllBetResultData } from "../../EventBetMatchods/marketService";
import "./eventMarketSettings.css";
import Loader from "./ui/Loader";
import MarketForm from "./ui/MarketForm";
import NoData from "./ui/NoData";

function EventMarketSettings() {
  const location = useLocation();
  const navigate = useNavigate();

  const eventId = location?.state?.eventId || "652cf70687c9a04540e94502";

  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [expanded, setExpanded] = useState([]);

  useEffect(() => {
    if (!eventId) {
      navigate("/event-list");
      Notify.error("eventId not found!");
    }

    const fetchData = async () => {
      setLoading(true);
      const result = await getAllBetResultData(eventId);
      console.log(result);
      setMarkets(result.market);
      const marketIds = result.market.map((market) => market._id);
      setExpanded(marketIds);
      setLoading(false);
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title mb-0">Event Market Settings</h1>
      </div>

      {loading ? (
        <Loader text="Loading Markets..." />
      ) : markets.length ? (
        <>
          {markets.map((market) => (
            <Accordion key={market._id} defaultActiveKey={expanded} alwaysOpen>
              <Accordion.Item eventKey={market._id} className="mb-3">
                <Accordion.Header>{market.name}</Accordion.Header>
                <Accordion.Body>
                  <MarketForm market={market} />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          ))}
        </>
      ) : (
        <NoData text="Markets not found for this" />
      )}
    </div>
  );
}

export default EventMarketSettings;
