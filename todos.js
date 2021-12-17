const express = require("express");
const morgan = require("morgan");

const app = express();
const host = "localhost";
const port = 3003;

// Static data for initial testing
let todoLists = require("./lib/seed-data");

app.set("views", "./views");
app.set("view engine", "pug");

// Middleware to use
app.use(morgan("common"));
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.render("lists", { todoLists });
});

// Listener
app.listen(port, host, () => {
  console.log(`Listening on port ${port} of ${host}...`);
});
