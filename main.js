const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow, newTodoAddWindow;

let todoList = [];

//when electron app is ready, this event is triggered
app.on("ready", () => {
  //Prepare browser window
  mainWindow = new BrowserWindow({
    frame: true,
    webPreferences: {
      //webPreferences is added for using require vs in web pages
      nodeIntegration: true,
    },
  });
  mainWindow.setResizable(true);

  //main window load
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "pages/mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  //prepare menu
  const mainWindowMenu = Menu.buildFromTemplate(mainWindowMenuTemplate);
  Menu.setApplicationMenu(mainWindowMenu);

  //when html is loaded, this event is triggered
  mainWindow.webContents.once("dom-ready", () => {
    mainWindow.webContents.send("initApp", todoList); //send message to web parts
  });

  //event listening on 'save:todo'
  ipcMain.on("save:todo", (err, data) => {
    if (data) {
      let newTodo = {
        id: Math.random(),
        text: data.todoValue,
      };
      todoList.push(newTodo);

      if (data.ref == "newWindow") {
        newTodoAddWindow.close();
        newTodoAddWindow = null;
      }

      //add new to do to web part for adding screen
      mainWindow.webContents.send("todo:add", newTodo);
    }
  });

  //event listening on 'delete:todo'
  ipcMain.on("delete:todo", (e, id) => {
    const index = todoList.indexOf(id);
    if (index > -1) {
      todoList.splice(index, 1);
    }
  });

  //event listening on 'close:mainWindow' (mainWindow)
  ipcMain.on("close:mainWindow", () => {
    app.quit();
    newTodoAddWindow = null;
  });

  //event listening on 'close:newTodo' (newTodoAddWindow)
  ipcMain.on("close:newTodo", () => {
    newTodoAddWindow.close();
    newTodoAddWindow = null;
  });
});

//main window menu template
const mainWindowMenuTemplate = [
  {
    label: "Actions",
    submenu: [
      {
        label: "Open Add New Todo Window",
        click() {
          createNewTodoWindow();
        },
      },
      {
        label: "Delete All",
        click() {
          deleteAll();
        },
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        role: "quit",
      },
    ],
  },
];
if (process.env.NODE_ENV !== "production") {
  mainWindowMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Developer Tools",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        label: "Refresh",
        role: "reload",
      },
    ],
  });
}

function createNewTodoWindow() {
  newTodoAddWindow = new BrowserWindow({
    width: 400,
    height: 180,
    webPreferences: {
      //webPreferences is added for using require vs in web pages
      nodeIntegration: true,
    },
  });

  newTodoAddWindow.setResizable(false);

  newTodoAddWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "pages/newTodoAddWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  newTodoAddWindow.on("close", () => {
    newTodoAddWindow = null;
  });
}

function deleteAll() {
  todoList = [];
  mainWindow.webContents.send("todo:deleteAll", todoList); //send message to web parts
}
