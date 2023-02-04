import { post, CREATED } from "node-kall";

const baseItems = [
  { label: "Bike Item", id: "8645a131-a7ae-4569-bb3c-1f1c7ae86829" },
  { label: "Lego Item", id: "77a09016-e314-419d-a779-274daa77281f" },
];

const _createItem = (base_item_id: string) => async () => {
  const [status, item] = await post("http://localhost:8080/items", {
    base_item_id,
  });

  if (status !== CREATED) {
    console.error("Error when creating base item with id", base_item_id);
  }
  console.log("Created", item);
};

export const CreateItems = () => (
  <div>
    <h2>Interact with the system</h2>
    <h3>Create Items</h3>
    {baseItems.map((baseItem) => (
      <button onClick={_createItem(baseItem.id)}>
        Create a new instance of {baseItem.label}
      </button>
    ))}
  </div>
);
