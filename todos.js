const express = require("express");
const morgan = require("morgan");

const TodoList = require("./lib/todolist");

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
app.use(express.urlencoded({ extended: false }));

const compareByTitle = (todoA, todoB) => {
  let titleA = todoA.title.toLowerCase();
  let titleB = todoB.title.toLowerCase();

  if (titleA < titleB) {
    return -1;
  } else if (titleA > titleB) {
    return 1;
  } else {
    return 0;
  }
};

// return the list of todo lists sorted by completion status and title
const sortTodoLists = lists => {
  const undone = lists.filter(todoList => !todoList.isDone());
  const done = lists.filter(todoList => todoList.isDone());

  undone.sort(compareByTitle);
  done.sort(compareByTitle);

  return [...undone, ...done];
};

// Routes
app.get("/", (req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (req, res) => {
  res.render("lists", { todoLists: sortTodoLists(todoLists) });
});

app.get("/lists/new", (req, res) => {
  res.render("new-list");
});

// Create a new todo list
app.post("/lists", (req, res) => {
  const title = req.body.todoListTitle.trim();
  todoLists.push(new TodoList(title));
  res.redirect("/lists");
});

// Listener
app.listen(port, host, () => {
  console.log(`Listening on port ${port} of ${host}...`);
});
