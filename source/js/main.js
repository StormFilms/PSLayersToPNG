'use strict';

function API(cs) {
    this.cs = cs;
}

API.prototype.exportDoc = function(path) {
    this.cs.evalScript('exportDoc("'+path+'")');
};

API.prototype.setDebugMode = function() {
    this.cs.evalScript('setDebugMode()');
};

API.prototype.getPref = function() {
    this.cs.evalScript('getPref()');
};

API.prototype.setPref = function(folder) {
    this.cs.evalScript('setPref("'+folder+'")');
};

API.prototype.selectFolder = function() {
    this.cs.evalScript('selectFolder()');
};

API.prototype.onGetPref = function(cb) {
    this.cs.addEventListener("no.syng.getpref", cb);
};

API.prototype.onSetPref = function(cb) {
    this.cs.addEventListener("no.syng.setpref", cb);
};

API.prototype.onFolderSelect = function(cb) {
    this.cs.addEventListener("no.syng.folderselect", cb);
};

API.prototype.onDebug = function(cb) {
    this.cs.addEventListener("no.syng.debug", cb);
};

API.prototype.onDocActive = function(cb) {
    this.cs.addEventListener("documentAfterActivate", cb);
};

var CS = new CSInterface();
var exportPath = '';
var DEBUG = true;
var api = new API(CS);

function init(event) {
    if (DEBUG) {
        api.setDebugMode();
    }

    document.getElementById('export')
        .addEventListener('click', function(event) {
            api.exportDoc(exportPath);
        });

    document
        .getElementById('folderSelect')
        .addEventListener('click', function(event) {
            api.selectFolder();
        });

    api.onGetPref(function(evt) {
        exportPath = evt.data;
        document.getElementById('curPath').innerHTML = exportPath;
        document.getElementById('export')
            .setAttribute('class', exportPath === '...' ? 'hidden' : '');
    });

    api.onSetPref(function(event) {
        api.getPref();
    });

    api.onFolderSelect(function(evt) {
        var file = evt.data;
        if (typeof file === 'undefined') {
            return;
        }
        api.setPref(aliasUserDir(file));
    });

    api.onDocActive(function(evt) {
        if (DEBUG) {
            clearDebug();
        }
        api.getPref();
    });

    if (DEBUG) {
        api.onDebug(function(evt) {
            var p = document.createElement('p');
            var txt = document.createTextNode(evt.data);
            p.appendChild(txt);
            document.getElementById('debug')
                .appendChild(p);
        });
    } else {
        document.getElementById('debug')
            .setAttribute('class', 'hidden');
    }

    api.getPref();
}

function clearDebug() {
    var dbg = document.getElementById('debug');
    while (dbg.firstChild) {
        dbg.removeChild(dbg.firstChild);
    }
}

function stripFile(path) {
    var folders = path.split('/');
    return folders.splice(0, folders.length - 1).join('/');
}

function aliasUserDir(path) {
    var folders = path.split('/');
    var pos = 1;
    for (var i=0; i<folders.length; i++) {
        if (String(folders[i]) === String('Users')) {
            pos = i + 2;
            break;
        }
    }
    return '~/' + folders.splice(pos).join('/');
}

document.addEventListener('DOMContentLoaded', init);
