import React from "react";
import MatchOdds from "./MatchOdds";

function Market({ market }) {
  const markets = {
    "Match Odds": <MatchOdds market={market} />,
  };
  return markets[market?.name] || null;
}

export default Market;
