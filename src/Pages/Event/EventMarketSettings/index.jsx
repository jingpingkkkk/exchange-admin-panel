import { CButton, CCol } from "@coreui/react";
import React, { useEffect, useState } from "react";
import { Accordion, Card, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import FormInput from "../../../components/Common/FormComponents/FormInput";
import FormMultiSelect from "../../../components/Common/FormComponents/FormMultiSelect";
import FormSelectWithSearch from "../../../components/Common/FormComponents/FormSelectWithSearch";
import { Notify } from "../../../utils/notify";
import { getAllBetResultData } from "../../EventBetMatchods/marketService";
import { MARKET_TYPES } from "./data/constants";
import "./eventMarketSettings.css";
import Loader from "./ui/Loader";
import MarketForm from "./ui/MarketForm";
import NoData from "./ui/NoData";

const marketTypeOptions = Object.values(MARKET_TYPES).map((type) => ({ value: type, label: type }));
const resultTypeOptions = [
  { value: "declared", label: "Declared" },
  { value: "pending", label: "Pending" },
];

function EventMarketSettings() {
  const location = useLocation();
  const navigate = useNavigate();

  const eventId = location?.state?.eventId;

  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState({});
  const [originalMarkets, setOriginalMarkets] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarketType, setSelectedMarketType] = useState([]);
  const [selectedResultType, setSelectedResultType] = useState(null);

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchQuery(value);
    if (value) {
      setMarkets(originalMarkets.filter((market) => market.name.toLowerCase().includes(value.toLowerCase())));
    } else {
      setMarkets(originalMarkets);
    }
  };

  const handleMarketTypeChange = (name, selectedValue) => {
    setSelectedMarketType(selectedValue);
    if (selectedValue.length) {
      setMarkets(originalMarkets.filter((market) => selectedValue.includes(market.type)));
    } else {
      setMarkets(originalMarkets);
    }
  };

  const handleResultTypeChange = (name, selectedValue) => {
    setSelectedResultType(selectedValue);
    if (selectedValue) {
      setMarkets(
        originalMarkets.filter((market) =>
          selectedValue === "declared" ? !!market?.winnerRunnerId || !!market?.winScore : false
        )
      );
    } else {
      setMarkets(originalMarkets);
    }
  };

  const handleClearFilter = () => {
    setSearchQuery("");
    setSelectedMarketType(null);
    setSelectedResultType(null);
    setMarkets(originalMarkets);
  };

  useEffect(() => {
    if (!eventId) {
      navigate("/event-list");
      Notify.error("eventId not found!");
    }

    const fetchData = async (sync = false) => {
      if (!sync) {
        setLoading(true);
      }

      const result = await getAllBetResultData(eventId);
      setEvent(result);
      const markets = result.market.flatMap((market) => {
        if ([MARKET_TYPES.MATCH_ODDS, MARKET_TYPES.BOOKMAKER].includes(market?.name)) {
          return [{ ...market, type: market?.name }];
        } else if ([MARKET_TYPES.NORMAL, MARKET_TYPES.FANCY1].includes(market?.name)) {
          return market.market_runner.map((runner) => ({
            ...market,
            ...runner,
            marketId: market._id,
            type: market?.name,
            name: runner?.runnerName,
          }));
        }
        return [];
      });
      setOriginalMarkets(markets);
      setMarkets(markets);
      const marketIds = markets.map((market) => market._id);
      setExpanded(marketIds);
      setLoading(false);
    };

    fetchData();

    return () => {
      handleClearFilter();
      setEvent({});
      setMarkets([]);
      setOriginalMarkets([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const addMarketResult = ({ marketId, runnerId, winScore }) => {
    const updatedMarkets = markets.map((market) => {
      if (market._id === marketId) {
        if ([MARKET_TYPES.MATCH_ODDS, MARKET_TYPES.BOOKMAKER].includes(market?.name)) {
          return { ...market, winnerRunnerId: runnerId };
        } else if ([MARKET_TYPES.NORMAL, MARKET_TYPES.FANCY1].includes(market?.name)) {
          return { ...market, winScore };
        }
      }
      return market;
    });
    setMarkets(updatedMarkets);
    setOriginalMarkets(updatedMarkets);
  };

  const removeMarketResult = ({ marketId }) => {
    const updatedMarkets = markets.map((market) => {
      if (market._id === marketId) {
        if ([MARKET_TYPES.MATCH_ODDS, MARKET_TYPES.BOOKMAKER].includes(market?.name)) {
          return { ...market, winnerRunnerId: null };
        }
        if ([MARKET_TYPES.NORMAL, MARKET_TYPES.FANCY1].includes(market?.name)) {
          return { ...market, winScore: null };
        }
      }
      return market;
    });
    setMarkets(updatedMarkets);
    setOriginalMarkets(updatedMarkets);
  };

  return (
    <div>
      <div className="page-header my-3">
        <h1 className="page-title mb-0">Event Market Settings</h1>
      </div>

      <Card>
        <Card.Header>
          <h4 className="mb-0 fw-semibold">{event.name || "Loading..."}</h4>
        </Card.Header>

        <Card.Body className="pt-3">
          <Row>
            <FormInput
              disabled={loading}
              label="Market or Runner"
              placeholder="Search"
              name="searchQuery"
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              width={3}
              isRequired="false"
            />

            <FormMultiSelect
              isMulti
              disabled={loading}
              isClearable
              label="Market Types"
              name="marketType"
              value={selectedMarketType}
              onChange={handleMarketTypeChange}
              width={3}
              options={marketTypeOptions}
            />

            <FormSelectWithSearch
              disabled={loading}
              isClearable
              label="Result Type"
              name="resultType"
              value={selectedResultType}
              onChange={handleResultTypeChange}
              width={3}
              options={resultTypeOptions}
            />

            <CCol md={3} className="pt-1">
              <CButton disabled={loading} color="primary" className="mt-6 py-1 fw-bolder" onClick={handleClearFilter}>
                <i className="fa fa-times me-1" /> CLEAR FILTERS
              </CButton>
            </CCol>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Loader text="Loading Markets..." />
      ) : markets.length ? (
        <div className="px-3">
          {markets.map((market) => (
            <Accordion key={market._id} defaultActiveKey={expanded} alwaysOpen>
              <Accordion.Item eventKey={market._id} className="mb-3">
                <Accordion.Header>{market.name}</Accordion.Header>
                <Accordion.Body>
                  <MarketForm market={market} onResultGenerate={addMarketResult} onResultRevert={removeMarketResult} />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          ))}
        </div>
      ) : (
        <NoData text="Markets not found for this" />
      )}
    </div>
  );
}

export default EventMarketSettings;
