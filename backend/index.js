const app = require("./app");
const { sequelize } = require("./db");
const { PORT, NODE_ENV } = require("./utils/env");

app.listen(PORT, async () => {
  if (NODE_ENV === "PRODUCTION") {
    await sequelize.sync();
  } else {
    await sequelize.sync({ force: true }); // this will drop every table
  }
  console.log(`listening on http://localhost:${PORT}`);
});