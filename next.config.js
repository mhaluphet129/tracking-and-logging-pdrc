require("dotenv").config();

module.exports = {
  env: {
    mongoDbUrl: process.env.databaseUrl,
  },
  distDir: "dist",
  output: "standalone",
};
