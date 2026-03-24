import { config } from "dotenv";
config();

import { createApp } from "./app";
import { connectDb } from "./db";

const port = Number(process.env.PORT || 3000);

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal:", err);
  process.exit(1);
});

