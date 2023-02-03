import * as klart from "klart";
import { Statistic, StatisticsFunction } from "../messaging";

const getTransferStatistics: StatisticsFunction = (options) => {
  return klart.rows<Statistic>(
    `
      SELECT 
        date_trunc($1, timestamp) as time,
        COUNT(*) as count
      FROM transfers
      GROUP BY 
        date_trunc($1, timestamp);
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
        date_trunc($1, created_at);
      `,
    [options.timeUnit]
  );
};

export const statistics = {
  getTransferStatistics,
  getCreationStatistics,
};
