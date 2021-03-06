const electron = require('electron');
const url = require('url');
const path = require('path');
var myCache = require("./cache");
var solution = require('./solution')

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let informationWindow;
let settingWindow;
let userWindow;
let loadingWindow;
let isConnected = false;
let setting = {}
let ip, key, web, api;
let users;
let logs = [];
let SOLUTION;

// SET ENV
process.env.NODE_ENV = 'development';

app.on("ready", async()=> {

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
    });

    if(myCache.has("setting")){
        loadingWindow.show();
        //ipcRenderer.send("setting",myCache.get("setting"));
        setting = myCache.get("setting");
        settingWindow.webContents.send("setting", setting);
        ip = setting.ip;
        key = setting.key;
        web = setting.web;
        api = setting.api;

        isConnected = await SOLUTION.GET_SYNC_TIME() == "" ? false : true;
        console.log(isConnected)
        myCache.set("isConnected", isConnected);

        //connect to finger print solution with ip
        if(isConnected){
            users = await SOLUTION.GET_USER_INFO();
            logs = await SOLUTION.GET_LOG();
        }
        mainWindow.custom = {
            isConnected : isConnected,
            users : users,
            logs:logs
        }
    }

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu);
})

//catch settings
ipcMain.on('setting', async function (e, item) {
    settingWindow.webContents.send('progress', "Please wait while connecting...<br>");
    console.log(item);
    setting = item;
    myCache.set("setting", item);

    SOLUTION =  new solution(item);
    isConnected = await SOLUTION.GET_SYNC_TIME() == "" ? false : true;
    console.log(isConnected)

    //connect to finger print solution with ip
    if(isConnected){
        myCache.set("isConnected", isConnected);
        users = await SOLUTION.GET_USER_INFO();
        logs = await SOLUTION.GET_LOG();
        isConnected = isConnected;
        mainWindow.custom = {
                isConnected : isConnected,
                logs:logs
        }
        mainWindow.webContents.send("setting", item);
        settingWindow.close();
        mainWindow.reload();
    } else {
        console.log("gagal")
        settingWindow.webContents.send('progress', "Connection failed with password...<br>");
        settingWindow.webContents.send('progress', "Trying to connect " + setting.ip +"<br>");
        settingWindow.webContents.send('progress', "Please waiting again...<br>");
        let data = await SOLUTION.CONNECT_TO();
        console.log(typeof  data)
        console.log(data+"data")
        if(data){
            settingWindow.webContents.send('progress', data + "<br>");
            settingWindow.webContents.send('progress', "successfully connect to "+setting.ip+"<br>");
            if(data.indexOf("ZK") > -1){
                settingWindow.webContents.send('progress', "your password is wrong<br>");
            } else {
                settingWindow.webContents.send('progress', "<strong>"+setting.ip+" is not finger print!!!</strong><br>");
            }

            settingWindow.webContents.send('progress', "done");

        } else {
            settingWindow.webContents.send('progress', "Can not connected...<br>Please check your network<br>");
            settingWindow.webContents.send('progress', "done");

        }
    }
});


function userWindowFunction() {
    //user window
    userWindow = new BrowserWindow({
        title : 'User Solution Machine',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    })
    //load main window in userWindow.html
    userWindow.loadURL(url.format({
        pathname : path.join(__dirname,'userWindow.html'),
        protocol: 'file:',
        slashes : true
    }));
    console.log(users)
    userWindow.custom = users;
}


function loadingWindowFunction() {
    //loading window
    loadingWindow = new BrowserWindow({
        width : 200,
        height : 200,
        frame: false,
        center: true,
        transparent: true,
        movable:false,
    });
    //loader
    loadingWindow.loadURL(url.format({
        pathname : path.join(__dirname,'loadingWindow.html'),
        protocol: 'file:',
        slashes : true,
    }));
    loadingWindow.show() // Used to hide the loading screen when the contents in main app are loaded
}


function userWindowFunction() {
    //user window
    userWindow = new BrowserWindow({
        title : 'User Solution Machine',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true
        }
    })
    //load main window in userWindow.html
    userWindow.loadURL(url.format({
        pathname : path.join(__dirname,'userWindow.html'),
        protocol: 'file:',
        slashes : true
    }));

    console.log(users)
    userWindow.custom = users;

}

function settingWindowFunction() {
    //setting window
    settingWindow = new BrowserWindow({
        width : 300,
        height : 550,
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
                label : 'User',
                click() {
                    userWindowFunction();
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