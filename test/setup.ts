import { rm } from "fs/promises";
import { join } from "path";
import { getConnection } from "typeorm";

global.beforeEach(async () => {
  try {
    await rm(join(__dirname, "..", "test.sqlite"));
  } catch (err: unknown) {
    // could be invoked if there is no file to delete but that is fine
    console.log(err);
  }
});

global.afterEach(async () => {
  const conn = getConnection();
  await conn.close();
});
