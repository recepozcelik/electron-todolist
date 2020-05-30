const electron = require("electron");
const { ipcRenderer } = electron;

let cancelBtn = document.querySelector("#cancelBtn");
let saveBtn = document.querySelector("#saveBtn");
let todoValue = document.querySelector("#todoValue");

cancelBtn.addEventListener("click", () => {
  ipcRenderer.send("close:newTodo");
});

saveBtn.addEventListener("click", () => {
  ipcRenderer.send("save:todo", {
    ref: "newWindow",
    todoValue: todoValue.value,
  });
});
