import React from "react";
import { useItemStatistics, useTransferStatistics } from "./useStatistics";

export const StatisticsSection = () => {
  const [timeUnit, setTimeUnit] = React.useState("month");

  const updateTimeUnit = (event: any) => {
    setTimeUnit(event.target.value);
  };

  const itemStats = useItemStatistics(timeUnit);
  const transferStats = useTransferStatistics(timeUnit);

  return (
    <div>
      <h2>Live Statistics</h2>
      FIXME: stats accumulates when changing time unit
      <div>
        <h3>Select frequency</h3>
        <select onChange={updateTimeUnit}>
          {["month", "day", "hour", "minute", "second", "millisecond"].map(
            (timeUnit) => (
              <option value={timeUnit} key={timeUnit}>
                Per {timeUnit}
              </option>
            )
          )}
        </select>
      </div>
      <div>
        <h3>Item Statistics (per {timeUnit})</h3>
        <code>{JSON.stringify(itemStats)}</code>
      </div>
      <div>
        <h3>Transfer Statistics (per {timeUnit})</h3>
        <code>{JSON.stringify(transferStats)}</code>
      </div>
    </div>
  );
};
