import { CButton, CCol } from "@coreui/react";
import CryptoJS from "crypto-js";
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
  { value: "all", label: "All" },
  { value: "declared", label: "Declared" },
  { value: "pending", label: "Pending" },
];

function EventMarketSettings() {
  const location = useLocation();
  const navigate = useNavigate();

  let eventId = null;

  if (location?.state?.eventId) {
    eventId = location?.state?.eventId;
    const encrypted = CryptoJS.AES.encrypt(eventId, process.env.REACT_APP_PERMISSIONS_AES_SECRET);
    localStorage.setItem("evsId", encrypted.toString());
  } else {
    const storedId = localStorage.getItem("evsId");
    if (storedId) {
      const decrypted = CryptoJS.AES.decrypt(storedId, process.env.REACT_APP_PERMISSIONS_AES_SECRET);
      eventId = decrypted.toString(CryptoJS.enc.Utf8);
    }
  }

  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState({});
  const [originalMarkets, setOriginalMarkets] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarketType, setSelectedMarketType] = useState([]);
  const [selectedResultType, setSelectedResultType] = useState("all");

  const filterMarkets = () => {
    let filteredMarkets = originalMarkets;
    if (selectedResultType) {
      filteredMarkets = filteredMarkets.filter((market) =>
        selectedResultType === "declared" ? market.resultDeclared : !market.resultDeclared
      );
    }
    if (selectedMarketType.length) {
      filteredMarkets = filteredMarkets.filter((market) => selectedMarketType.includes(market.type));
    }
    if (searchQuery) {
      filteredMarkets = filteredMarkets.filter((market) =>
        market.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setMarkets(filteredMarkets);
  };

  useEffect(() => {
    filterMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedMarketType, selectedResultType]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedMarketType([]);
    setSelectedResultType("all");
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
          return [{ ...market, type: market?.name, resultDeclared: !!market?.winnerRunnerId }];
        } else if ([MARKET_TYPES.NORMAL, MARKET_TYPES.FANCY1].includes(market?.name)) {
          return market.market_runner.map((runner) => ({
            ...market,
            ...runner,
            marketId: market._id,
            type: market?.name,
            name: runner?.runnerName,
            resultDeclared: !!market?.winScore,
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
      handleClearFilters();
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
          return { ...market, winnerRunnerId: runnerId, resultDeclared: true };
        } else if ([MARKET_TYPES.NORMAL, MARKET_TYPES.FANCY1].includes(market?.name)) {
          return { ...market, winScore, resultDeclared: true };
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
          return { ...market, winnerRunnerId: null, resultDeclared: false };
        }
        if ([MARKET_TYPES.NORMAL, MARKET_TYPES.FANCY1].includes(market?.name)) {
          return { ...market, winScore: null, resultDeclared: false };
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
              onChange={(name, selectedValue) => setSelectedMarketType(selectedValue)}
              width={3}
              options={marketTypeOptions}
            />

            <FormSelectWithSearch
              disabled={loading}
              isClearable
              label="Result Type"
              name="resultType"
              value={selectedResultType}
              onChange={(name, selectedValue) => setSelectedResultType(selectedValue)}
              width={3}
              options={resultTypeOptions}
            />

            <CCol md={3} className="pt-1">
              <CButton disabled={loading} color="primary" className="mt-6 py-1 fw-bolder" onClick={handleClearFilters}>
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
