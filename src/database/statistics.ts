import klart from "klart";
import { TimeUnit } from "../schemas";

type Statistic = {
  time: string;
  count: number;
};

function getTransferStatistics(options: { timeUnit: TimeUnit }) {
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
}

function getCreationStatistics(options: { timeUnit: TimeUnit }) {
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
}

export const statistics = {
  getTransferStatistics,
  getCreationStatistics,
};
