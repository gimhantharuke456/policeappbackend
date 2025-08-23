const app = require("./app");
require("./Config/DBconfig"); // This will connect to MongoDB
const port = 3002;

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
