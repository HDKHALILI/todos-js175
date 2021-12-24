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
// Tell express what format is used by form data
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
// Redirect start page
app.get("/", (req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (req, res) => {
  res.render("lists", { todoLists: sortTodoLists(todoLists) });
});

// Render new todo list page
app.get("/lists/new", (req, res) => {
  res.render("new-list");
});

// Create a new todo list
app.post("/lists", (req, res) => {
  const title = req.body.todoListTitle.trim();
  if (title.length === 0) {
    res.render("new-list", {
      errorMessage: "A title was not provided.",
    });
  } else if (title.length > 100) {
    res.render("new-list", {
      errorMessage: "List title must be between 1 and 100 characters.",
      todoListTitle: title,
    });
  } else if (todoLists.some(list => list.title === title)) {
    res.render("new-list", {
      errorMessage: "List title must be unique.",
      todoListTitle: title,
    });
  } else {
    todoLists.push(new TodoList(title));
    res.redirect("/lists");
  }
});

// Listener
app.listen(port, host, () => {
  console.log(`Listening on port ${port} of ${host}...`);
});
