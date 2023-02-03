import { TimeUnit } from "./schemas";

export enum Channel {
  TRANSFER_UPDATE = "transfer_update",
  ITEM_CREATION = "item_creation",
}

export type Statistic = {
  time: string;
  count: number;
};

export type StatisticsFunction = (options: {
  timeUnit: TimeUnit;
}) => Promise<Statistic[]>;
