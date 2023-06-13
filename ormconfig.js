var dbConfig = {
  synchronize: false,
  migrations: ["migrations/*.js"],
  cli: {
    migrationsDir: "migrations",
  },
};

switch (process.env.NODE_ENV) {
  case "development":
    Object.assign(dbConfig, {
      type: "sqlite",
      database: "db.sqlite",
      entities: ["**/*.entity.js"],
    });
    break;
  case "test":
    Object.assign(dbConfig, {
      type: "sqlite",
      database: "test.sqlite",
      entities: ["**/*.entity.ts"],
      migrationsRun: true, // start for each individual test
    });
    break;
  case "production":
    Object.assign(dbConfig, {
      type: "postgres",
      url: process.env.DATABASE_URL, // set in env var
      migrationsRun: true,
      entities: ["**/*.entity.js"],
      ssl: {
        rejectUnauthorized: true, // for heroku
      },
    });
    break;
  default:
    throw new Error("unknown environment");
}
module.exports = dbConfig;
