import * as klart from "klart";

/**
 * Fugly script inserting
 * test data with known IDs
 * to facilitate frontend-demo
 */
(async () => {
  const hasRun = await klart.first(
    `SELECT * FROM base_items WHERE id = '8645a131-a7ae-4569-bb3c-1f1c7ae86829'`
  );

  if (hasRun) {
    console.log("Test data already exists");
    return;
  }

  await klart.run(`
      INSERT INTO base_items (id, description) 
      VALUES ('8645a131-a7ae-4569-bb3c-1f1c7ae86829', '3T Strada Bike'); 

      INSERT INTO base_items (id, description) 
      VALUES ('77a09016-e314-419d-a779-274daa77281f', 'LEGO Botanical Birds Of Paradise'); 

      INSERT INTO users (id)
      VALUES ('30f6df32-03cf-4779-833b-aef9b1e3f61f'); 

      INSERT INTO users (id)
      VALUES ('d29fcf2a-9611-44bf-8c78-4c939c96539c'); 
    `);
})()
  .then(() => {
    console.log("DONE > inserting test data");
  })
  .catch(console.error);
