const electron = require('electron');
const url = require('url');
const path = require('path');
var myCache = require("./cache");

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let informationWindow;
let settingWindow;

// SET ENV
process.env.NODE_ENV = 'development';

app.on("ready", ()=> {

    //main window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    })
    //load main window in mainWindow.html
    mainWindow.loadURL(url.format({
        pathname : path.join(__dirname,'mainWindow.html'),
        protocol: 'file:',
        slashes : true
    }));

    mainWindow.on('close', function () {
        app.quit();
    })

    if(myCache.has("setting")){
        //ipcRenderer.send("setting",myCache.get("setting"));
        console.log(myCache.get("setting"))
        settingWindow.webContents.send("setting", myCache.get("setting"));
    }

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)
})

//catch settings
ipcMain.on('setting', function (e, item) {
    console.log(item);
    myCache.set("setting", item);
    mainWindow.webContents.send("setting", item);
    settingWindow.close();
})

function settingWindowFunction() {
    //setting window
    settingWindow = new BrowserWindow({
        width : 300,
        height : 500,
        title : 'Setting CMS',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    })
    //load main window in mainWindow.html
    settingWindow.loadURL(url.format({
        pathname : path.join(__dirname,'settingWindow.html'),
        protocol: 'file:',
        slashes : true
    }));

    settingWindow.custom = myCache.has("setting") ? myCache.get("setting") : "";
}

function informationWindowFunction() {
    //information window
    informationWindow = new BrowserWindow({
        width : 300,
        height : 500,
        title : 'Version Title'
    })
    //load main window in mainWindow.html
    informationWindow.loadURL(url.format({
        pathname : path.join(__dirname,'informationWindow.html'),
        protocol: 'file:',
        slashes : true,
    }));


    informationWindow.on("close", function () {
        informationWindow = null;
    })
}

const mainMenuTemplate = [
    {
        label : 'Menu',
        submenu : [
            {
                label : 'Setting',
                click() {
                    settingWindowFunction();
                }
            },
            {
                label : 'Version',
                click() {
                    informationWindowFunction();
                }
            }, {
                label : "Exit",
                accelerator : process.platform == "darwin" ? "Command+Q" : "CTRL+Q",
                click(){
                    app.quit();
                }
            }
        ]
    }
]


if(process.env.NODE_ENV !== "production"){
    mainMenuTemplate.push({
        label : "Developer tools",
        submenu : [
            {
                label : "tools",
                accelerator : process.platform == "darwin" ? "Command+I" : "CTRL+I",
                click(item,focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        ]

    })
}