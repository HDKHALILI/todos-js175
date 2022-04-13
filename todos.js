const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");

const Todo = require("./lib/todo");
const TodoList = require("./lib/todolist");
const { sortTodoLists, sortTodos } = require("./lib/sort");

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
app.use(
  session({
    name: "launch-school-todos-session-id",
    resave: false,
    saveUninitialized: true,
    secret: "this is not very secure",
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;

  next();
});

const loadTodoList = todoListId => {
  return todoLists.find(todoList => todoList.id === Number(todoListId));
};

const loadATodo = (todoListId, todoId) => {
  const todoList = loadTodoList(Number(todoListId));
  if (!todoList) return undefined;

  // find method returns 'undefined' if no item found
  return todoList.todos.find(todo => todo.id === Number(todoId));
};

// Routes
// Redirect start page
app.get("/", (req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (req, res) => {
  res.render("lists", {
    todoLists: sortTodoLists(todoLists),
  });
});

// Render new todo list page
app.get("/lists/new", (req, res) => {
  res.render("new-list");
});

// Render an individual todo list and its todos
app.get("/lists/:todoListId", (req, res, next) => {
  const { todoListId } = req.params;
  const todoList = loadTodoList(todoListId);
  if (todoList === undefined) {
    next(new Error("Not Found."));
  } else {
    res.render("list", {
      todoList: todoList,
      todos: sortTodos(todoList),
    });
  }
});

// Create a new todo list
app.post(
  "/lists",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The list title is required")
      .isLength({ max: 100 })
      .withMessage("List title must be between 1 and 100 characters.")
      .custom(title => {
        const duplicate = todoLists.find(list => list.title === title);
        return duplicate === undefined;
      })
      .withMessage("List title must be unique."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    const title = req.body.todoListTitle;
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.render("new-list", {
        flash: req.flash(),
        todoListTitle: title,
      });
    } else {
      todoLists.push(new TodoList(title));
      req.flash("success", "The todo list has been created.");
      res.redirect("/lists");
    }
  }
);

// toggle todo's done property
app.post("/lists/:todoListId/todos/:todoId/toggle", (req, res, next) => {
  const { todoListId, todoId } = req.params;
  const todo = loadATodo(todoListId, todoId);
  if (!todo) {
    next(new Error("Not Found"));
  } else {
    const title = todo.title;
    if (todo.isDone()) {
      todo.markUndone();
      req.flash(`Success ${title} marked as NOT done!`);
    } else {
      todo.markDone();
      req.flash(`success ${title} marked done!`);
    }
    res.redirect(`/lists/${todoListId}`);
  }
});

// Delete a todo
app.post("/lists/:todoListId/todos/:todoId/destroy", (req, res, next) => {
  const { todoListId, todoId } = req.params;
  const todo = loadATodo(todoListId, todoId);

  if (!todo) {
    next(new Error("Not Found"));
  } else {
    const todoList = loadTodoList(todoListId);
    const index = todoList.findIndexOf(todo);
    const title = todo.title;
    todoList.removeAt(index);
    req.flash("success", `The "${title}" todo has been deleted.`);

    res.redirect(`/lists/${todoListId}`);
  }
});

// Mark all todos done in a list
app.post("/lists/:todoListId/complete_all", (req, res, next) => {
  const { todoListId } = req.params;
  const todoList = loadTodoList(todoListId);

  if (!todoList) {
    next(new Error("Not Found"));
  } else {
    todoList.markAllDone();
    req.flash("success", "All todos have been marked as done.");
    res.redirect(`/lists/${todoListId}`);
  }
});

// Add a new todo
app.post(
  "/lists/:todoListId/todos",
  [
    body("todoTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("A todo title is required.")
      .isLength({ max: 100 })
      .withMessage("The todo title must be between 1 and 100 characters."),
  ],
  (req, res, next) => {
    const { todoListId } = req.params;
    const todoList = loadTodoList(todoListId);

    if (!todoList) {
      next(new Error("Not Found"));
    } else {
      const errors = validationResult(req);
      const title = req.body.todoTitle;

      if (!errors.isEmpty()) {
        errors.array().forEach(message => req.flash("error", message.msg));

        res.render("list", {
          flash: req.flash(),
          todoList: todoList,
          todos: sortTodos(todoList),
          todoTitle: title,
        });
      } else {
        todoList.add(new Todo(title));
        req.flash("success", `"${title}" is added to the list.`);
        res.redirect(`/lists/${todoListId}`);
      }
    }
  }
);

// Error handler
app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404).send(err.message);
});

// Listener
app.listen(port, host, () => {
  console.log(`Listening on port ${port} of ${host}...`);
});
