const electron = require("electron");
const { ipcRenderer } = electron;

checkTodoCount();

//get all todos from main.js
ipcRenderer.send("todo:getAll", {});

//this event triggered by main.js
ipcRenderer.on("todo:all", (e, todos) => {
  todos.forEach((todo) => {
    drawRow(todo);
  });
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
