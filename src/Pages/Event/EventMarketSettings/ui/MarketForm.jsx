import React from "react";
import { MARKET_TYPES } from "../data/constants";
import FancyForm from "./fancy-form";
import MatchOddsForm from "./match-odds-form";

function MarketForm(props) {
  const { market = {} } = props;

  const FormComponent = {
    [MARKET_TYPES.MATCH_ODDS]: <MatchOddsForm {...props} />,
    [MARKET_TYPES.BOOKMAKER]: <MatchOddsForm {...props} />,
    [MARKET_TYPES.NORMAL]: <FancyForm {...props} />,
    [MARKET_TYPES.FANCY1]: <FancyForm {...props} />,
  };

  return FormComponent[market?.type] || <div className="text-red">Component not found!</div>;
}

export default MarketForm;
