import React from "react";
import MatchOdds from "./MatchOdds";
import BookMaker from "./BookMaker";
import Fancy from "./Fancy";

function Market({ market, matchWinLoss }) {
  const markets = {
    "Match Odds": <MatchOdds market={market} matchWinLoss={matchWinLoss} />,
    Bookmaker: <BookMaker market={market} matchWinLoss={matchWinLoss} />,
    Normal: <Fancy market={market} matchWinLoss={matchWinLoss} />,
  };
  return markets[market?.name] || null;
}

export default Market;
