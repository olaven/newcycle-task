import { CreateItems } from "./CreateItems";
import { TransferItems } from "./TransferItems";

export const InteractSection = () => (
  <div>
    <CreateItems />
    <TransferItems />
    <h3>Transfer Item between two users</h3>
  </div>
);
