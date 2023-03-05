const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

const clearcache = document.getElementById('clearcache')
clearcache.onclick = function() {
    try {
        console.log('clear cache')
        app.clearCache();
    } catch (error) {
        console.error(error);        
    }
}
function updateServerStatus(status) {
    const information = document.getElementById('status')
    information.innerText = status
    console.log('Server status:', status);
}
function openPackage(packageid) {
    // generate unique id for stream
    const streamid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const outputul = document.getElementById('output')
    const span = document.createElement('span');
    span.innerText = 'Package ' + packageid + ' output:';
    const pre = document.createElement('pre');
    pre.id = streamid;
    const li = document.createElement('li');
    li.appendChild(span);
    li.appendChild(pre);
    outputul.insertBefore(li, outputul.firstChild);

    console.log('open package', packageid);
    app.openPackage(packageid, streamid);
}
var streams = {}
function updateStream(id, byteArray) {
    var bytes = byteArray;
    if(byteArray == null) return;
    if(byteArray.type == 'Buffer') {
        bytes = byteArray.data;
    }
    bytes = new Uint8Array(bytes)
    if(streams[id] == null) streams[id] = [];
    streams[id] = streams[id].concat(bytes);

    console.log('Recevied data for ' + id, byteArray);
    const outputul = document.getElementById(id)
    if(outputul == null) return;
    const decoder = new TextDecoder('utf-8');
    const string = decoder.decode(bytes);
    outputul.innerText += string;
}
 
function updatePackages(json) {
    var packages = JSON.parse(json);
    const ul_packages = document.getElementById('packages')
    ul_packages.innerHTML = ''
    for(var i = 0; i < packages.length; i++) {
        var li = document.createElement('li');
        // add a link to package by calling "openPackage(packages[i]._id)"
        var a = document.createElement('a');
        a.href = '#';
        a.innerText = packages[i].name;
        const _id = packages[i]._id
        a.onclick = function() {
            openPackage(_id);
        }
        li.appendChild(a);
        ul_packages.appendChild(li);
    }
}
