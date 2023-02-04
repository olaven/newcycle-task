import { CreateItems } from "./CreateItems";
import { TransferItems } from "./TransferItems";

export const InteractSection = () => (
  <div>
    <CreateItems />
    <div style={{ backgroundColor: "green", color: "white" }}>
      TODO transfer an item between two users
    </div>
    <TransferItems />
    <h3>Transfer Item between two users</h3>
  </div>
);
