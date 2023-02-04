import * as klart from "klart";
import { TimeUnit } from "../schemas";

export type Statistic = {
  time: string;
  count: number;
};

export type StatisticsFunction = (options: {
  timeUnit: TimeUnit;
}) => Promise<Statistic[]>;

const getTransferStatistics: StatisticsFunction = (options) => {
  return klart.rows<Statistic>(
    `
      SELECT 
        date_trunc($1, timestamp) as time,
        COUNT(*) as count
      FROM transfers
      GROUP BY 
        date_trunc($1, timestamp)
      ORDER BY time DESC;
      `,
    [options.timeUnit]
  );
};

const getCreationStatistics: StatisticsFunction = (options) => {
  return klart.rows<Statistic>(
    `
      SELECT 
        date_trunc($1, created_at) as time,
        COUNT(*) as count
      FROM items
      GROUP BY 
        date_trunc($1, created_at)
      ORDER BY time DESC;
      `,
    [options.timeUnit]
  );
};

export const statistics = {
  getTransferStatistics,
  getCreationStatistics,
};
