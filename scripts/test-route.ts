import { getDesignById } from "./app/(main)/dashboard/design/prints/actions/design-actions";

async function test() {
  const result = await getDesignById("c99fb7d5-3c2f-4ff4-9e20-ea5627fcbe0f");
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
