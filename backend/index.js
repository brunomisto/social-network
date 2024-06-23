const app = require("./app");
const { sequelize } = require("./db");
const { PORT } = require("./utils/env");

app.listen(PORT, async () => {
  await sequelize.sync({ force: true }); // this will drop every table
  console.log(`listening on http://localhost:${PORT}`);
});