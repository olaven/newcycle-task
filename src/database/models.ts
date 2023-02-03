export type User = {
  id: string;
};

export type BaseItem = {
  id: string;
  description: string;
};

export type Item = {
  id: string;
  base_item_id: string;
  crated_at: string;
};

export type Transfer = {
  id: string;
  timestamp: string;
  owner_id: string;
  item_id: string;
};
