import React from "react";
import FancyForm from "./fancy-form";
import MatchOddsForm from "./match-odds-form";

function MarketForm({ market = {} }) {
  const FormComponent = {
    "Match Odds": <MatchOddsForm market={market} />,
    Bookmaker: <MatchOddsForm market={market} />,
    Normal: <FancyForm market={market} />,
    Fancy1: <FancyForm market={market} />,
  };

  return FormComponent[market?.name] || <div className="text-red">Component not found!</div>;
}

export default MarketForm;
