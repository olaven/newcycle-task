import { put, NO_CONTENT } from "node-kall";

const transferLegoSet = async () => {
  const userA = "30f6df32-03cf-4779-833b-aef9b1e3f61f";
  const userB = "d29fcf2a-9611-44bf-8c78-4c939c96539c";

  const itemId = "84e57c17-7ae0-4ef7-baea-ca0b9a598ab8";
  const [status] = await put(
    `http://localhost:8080/items/${itemId}/ownership`,
    { to: userA }
  );

  if (status !== NO_CONTENT) {
    console.error("Error transferring item", itemId, "to", userA);
  }
};

export const TransferItems = () => (
  <>
    <h3>Transfer Item between two users</h3>
    <button onClick={transferLegoSet}>
      Transfer an instance of the LEGO set
    </button>
  </>
);
