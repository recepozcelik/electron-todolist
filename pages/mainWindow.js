const electron = require("electron");
const { ipcRenderer } = electron;

checkTodoCount();

const todoValue = document.querySelector("#todoValue");

//initApp event triggered by main.js
ipcRenderer.on("initApp", (e, todos) => {
  todos.forEach((todo) => {
    drawRow(todo);
  });
});

//when new todo added, this event triggered from electron part
ipcRenderer.on("todo:add", (e, todo) => {
  drawRow(todo);
});

//when all todo items deleted, this event triggered from electron part
ipcRenderer.on("todo:deleteAll", (e, todoList) => {
  deleteAll();
});

todoValue.addEventListener("keypress", (e) => {
  //when enter key pressed
  if (e.keyCode == 13) {
    //send data todo to electron parts
    ipcRenderer.send("save:todo", {
      ref: "mainWindow",
      todoValue: e.target.value,
    });
    e.target.value = "";
  }
});

document.querySelector("#addBtn").addEventListener("click", () => {
  ipcRenderer.send("save:todo", {
    ref: "mainWindow",
    todoValue: todoValue.value,
  });
  todoValue.value = "";
});

document.querySelector("#closeBtn").addEventListener("click", () => {
  if (confirm("Do you want to quit?")) {
    //send close event to electron part
    ipcRenderer.send("close:mainWindow");
  }
});

document.querySelector("#gotoListPageLinkId").addEventListener("click", () => {
  ipcRenderer.send("goto:listPage");
});

function checkTodoCount() {
  const container = document.querySelector(".todo-container");
  const alertContainer = document.querySelector(".alert-container");

  let todoCount = container.children.length - 2; //-2 => b and br
  document.querySelector(".total-count-container").innerText = todoCount;

  if (todoCount !== 0) {
    alertContainer.style.display = "none";
  } else {
    alertContainer.style.display = "block";
  }
}

function drawRow(todo) {
  const container = document.querySelector(".todo-container");
  // row
  const row = document.createElement("div");
  row.className = "todo-item-row";
  // span
  const span = document.createElement("span");
  span.innerText = todo.text + "   ";
  // Delete Btn
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Delete";
  deleteBtn.setAttribute("data-id", todo.id);
  deleteBtn.addEventListener("click", (e) => {
    if (confirm("Are you sure for delete this item?")) {
      e.target.parentNode.remove();
      //send delete message to electron part
      ipcRenderer.send("delete:todo", e.target.getAttribute("data-id"));
      checkTodoCount();
    }
  });

  row.appendChild(span);
  row.appendChild(deleteBtn);
  container.appendChild(row);

  checkTodoCount();
}

function deleteAll() {
  const container = document.querySelector(".todo-container");
  let rows = container.querySelectorAll(".todo-item-row");
  rows.forEach((row) => {
    row.remove();
  });

  checkTodoCount();
}
