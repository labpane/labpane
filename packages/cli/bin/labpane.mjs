#!/usr/bin/env node
import { main } from "../src/cli.mjs";

try {
  await main(process.argv.slice(2));
} catch (error) {
  console.error(`labpane: ${error.message}`);
  process.exitCode = error.code === "ABORT_ERR" ? 130 : 1;
}
