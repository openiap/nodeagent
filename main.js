const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { openiap } = require("@openiap/nodeapi");
const { existsSync } = require('fs');
const { join } = require('path');
const AdmZip = require("adm-zip");
const fs = require('fs');

const { execSync, spawn } = require('child_process');
var client = new openiap();
client.onConnected = onConnected
client.onDisconnected = onDisconnected

var packagefolder = __dirname + "/packages";

async function getpackage(fileid, id) {
  const reply = await client.DownloadFile({ id: fileid });
  // move reply.filename to packagefolder
  if(!fs.existsSync(packagefolder)) fs.mkdirSync(packagefolder);
  // fs.copyFileSync(reply.filename, join(packagefolder, reply.filename));
  try {
    if (path.extname(reply.filename) == ".zip") {
      var zip = new AdmZip(reply.filename);
      zip.extractAllTo(path.join(join(packagefolder, id)), true);
      console.log("done")
    }
  } catch (error) {
    console.error(error);
    throw error
  } finally {
    fs.unlinkSync(reply.filename);
  }
}
function getpackagepath(packagepath, first = true) {
  if (fs.existsSync(path.join(packagepath, "package.json"))) return packagepath;
  if (fs.existsSync(path.join(packagepath, "agent.js"))) return packagepath;
  if (fs.existsSync(path.join(packagepath, "main.js"))) return packagepath;
  if (fs.existsSync(path.join(packagepath, "index.js"))) return packagepath;
  if (fs.existsSync(path.join(packagepath, "agent.py"))) return packagepath;
  if (fs.existsSync(path.join(packagepath, "main.py"))) return packagepath;
  if (fs.existsSync(path.join(packagepath, "index.py"))) return packagepath;
  // search for a .csproj file
  if (!first) return ""
  if (!fs.existsSync(packagepath)) return ""
  var files = fs.readdirSync(packagepath)
  for (var i = 0; i < files.length; i++) {
    const filepath = path.join(packagepath, files[i])
    if (fs.lstatSync(filepath).isDirectory()) {
      var test = getpackagepath(filepath, false)
      if (test != "") return test;
    }
  }
  return ""
}
function getscriptpath(packagepath) {
  if (fs.existsSync(path.join(packagepath, "package.json"))) {
    var project = require(path.join(packagepath, "package.json"))
    if(project.scripts && project.scripts.start) {
      return "npm run start"
    }
    var _main = path.join(packagepath, project.main);
    if (fs.existsSync(_main)) {
      return _main
    }
  }
  if (fs.existsSync(path.join(packagepath, "agent.js"))) return path.join(packagepath, "agent.js");
  if (fs.existsSync(path.join(packagepath, "main.js"))) return path.join(packagepath, "main.js");
  if (fs.existsSync(path.join(packagepath, "index.js"))) return path.join(packagepath, "index.js");
  if (fs.existsSync(path.join(packagepath, "agent.py"))) return path.join(packagepath, "agent.py");
  if (fs.existsSync(path.join(packagepath, "main.py"))) return path.join(packagepath, "main.py");
  if (fs.existsSync(path.join(packagepath, "index.py"))) return path.join(packagepath, "index.py");
}
function npminstall(packagepath, streamid) {
  if (fs.existsSync(path.join(packagepath, "npm.install.done"))) return;
  if (fs.existsSync(path.join(packagepath, "package.json"))) {
    execSync("npm install --unsafe-perm", {
      stdio: [0, 1, 2],
      cwd: packagepath,
    })
    fs.writeFileSync(join(packagepath, "npm.install.done"), "done");
  }
}

function findPythonPath() {
  try {
    const stdout = execSync('which python3', { stdio: 'pipe' }).toString();
    return stdout.trim();
  } catch (error) {
    throw error;
  }
}
function pipinstall(packagepath, streamid, pythonpath) {
  if (fs.existsSync(path.join(packagepath, "requirements.txt.done"))) return;
  if (fs.existsSync(path.join(packagepath, "requirements.txt"))) {
    execSync(pythonpath + " -m pip install -r " + join(packagepath, "requirements.txt"), {
      stdio: [0, 1, 2],
      cwd: packagepath,
    })
    fs.writeFileSync(join(packagepath, "requirements.txt.done"), "done");
  }
}
function runit(packagepath, streamid, command) {
  try {
    console.log("run", command, "in", packagepath)
    // execSync(command, {
    //   stdio: [0, 1, 2],
    //   cwd: packagepath,
    // })
    const childProcess = spawn(command.split(" ")[0], command.split(" ").slice(1))
    childProcess.stdout.on('data', (data) => {
      console.log(data.toString());
      notifyStream(streamid, data)
    }); 
    childProcess.stdout.on('error', (data) => {
      console.log(data.toString());
      notifyStream(streamid, data)
    });
    childProcess.stdout.on('close', (code) => {
      console.log(`Child process exited with code ${code}`);
    });
    console.log("done")
  } catch (error) {
    console.error(error);
    throw error;    
  }
}
function deleteDirectoryRecursiveSync(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(function(file, index) {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteDirectoryRecursiveSync(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

async function onConnected(cli)  {
  console.log('connected');
  notifyServerStatus('connected');
  var packages = await client.Query({query: {"_type": "package"}, collectionname: "agents"});
  for(var i = 0; i < packages.length; i++) {
    try {
      if(existsSync(join(packagefolder, packages[i]._id))) continue;
      if(packages[i].fileid != null && packages[i].fileid != "") {
        await getpackage(packages[i].fileid, packages[i]._id);
      }
    } catch (error) {
      console.error(error);      
    }
  }
  notifyPackages(packages);
};
async function onDisconnected(client)  {
  console.log('disconnected');
  notifyServerStatus('disconnected');
};
client.connect();
var mainWindow
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });
  ipcMain.handle('ping', (sender) => { 
    return 'pong';
  });
  ipcMain.handle('clear-cache', async (sender) => { 
    deleteDirectoryRecursiveSync(packagefolder);
    onConnected(client)
  });
  ipcMain.handle('open-package', async (sender, id, streamid) => { 
    console.log('open package ' + id, streamid);
    var packagepath = getpackagepath(join(packagefolder, id));
    if(existsSync(packagepath)) {
      let command = getscriptpath(packagepath)
      if(command == "") throw new Error("Failed locating a command to run, EXIT")
      if(command.endsWith(".py")) {
        var python = findPythonPath();
        pipinstall(packagepath, streamid, python)
        runit(packagepath, streamid, python + " " + command)
      } else {
        // const nodePath = path.join(app.getAppPath(), 'node_modules', '.bin', 'node');
        var test = process.versions.node;
        const nodePath = "node"
        npminstall(packagepath, streamid)
        runit(packagepath, streamid, nodePath + " " + command)
      }
    }
    return 'pong';
  });
  notifyServerStatus('connecting...');

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();

};
function notifyStream(id, buffer) {
  mainWindow.webContents.executeJavaScript(`updateStream("${id}", ${JSON.stringify(buffer)})`);
}
function notifyServerStatus(status) {
  mainWindow.webContents.executeJavaScript(`updateServerStatus("${status}")`);
}
function notifyPackages(packages) {
  mainWindow.webContents.executeJavaScript(`updatePackages('${JSON.stringify(packages)}')`);
}
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

