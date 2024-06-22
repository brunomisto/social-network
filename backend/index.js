const app = require("./app");
const { PORT } = require("./utils/env");

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});