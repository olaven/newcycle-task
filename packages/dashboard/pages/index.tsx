import React from "react";
import { InteractSection } from "../components/interact/InteractSection";
import { StatisticsSection } from "../components/statistics/StatisticsSection";

export default () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <StatisticsSection />
      <InteractSection />
    </div>
  );
};
