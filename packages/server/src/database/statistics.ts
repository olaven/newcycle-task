import * as klart from "klart";
import { TimeUnit } from "../schemas";

export type Statistic = {
  time: string;
  count: number;
};

export type StatisticsFunction = (options: {
  timeUnit: TimeUnit;
  from: Date;
}) => Promise<Statistic[]>;

const getTransferStatistics: StatisticsFunction = (options) => {
  console.log("GETTING FROM", options.from);
  return klart.rows<Statistic>(
    `
      SELECT 
        date_trunc($1, timestamp) as time,
        COUNT(*) as count
      FROM transfers
      WHERE timestamp >= $2
      GROUP BY 
        date_trunc($1, timestamp);
      `,
    [options.timeUnit, options.from]
  );
};

const getCreationStatistics: StatisticsFunction = (options) => {
  return klart.rows<Statistic>(
    `
      SELECT 
        date_trunc($1, created_at) as time,
        COUNT(*) as count
      FROM items
      WHERE created_at >= $2
      GROUP BY 
        date_trunc($1, created_at);
      `,
    [options.timeUnit, options.from]
  );
};

export const statistics = {
  getTransferStatistics,
  getCreationStatistics,
};
