// Compare object titles alphabetically (case-insensitive)
const compareByTitle = (itemA, itemB) => {
  let titleA = itemA.title.toLowerCase();
  let titleB = itemB.title.toLowerCase();

  if (titleA < titleB) {
    return -1;
  } else if (titleA > titleB) {
    return 1;
  } else {
    return 0;
  }
};

module.exports = {
  // return the list of todo lists sorted by completion status and title
  sortTodoLists(lists) {
    const undone = lists.filter(todoList => !todoList.isDone());
    const done = lists.filter(todoList => todoList.isDone());

    undone.sort(compareByTitle);
    done.sort(compareByTitle);

    return [...undone, ...done];
  },
  sortTodos(todoList) {
    const undone = todoList.todos.filter(todo => !todo.isDone());
    const done = todoList.todos.filter(todo => todo.isDone());

    undone.sort(compareByTitle);
    done.sort(compareByTitle);

    return [].concat(undone, done);
  },
};
