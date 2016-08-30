#target photoshop

var Helpers = {
    skip: false,

    adjustmentLayers: [
        LayerKind.BLACKANDWHITE,
        LayerKind.BRIGHTNESSCONTRAST,
        LayerKind.CHANNELMIXER,
        LayerKind.COLORBALANCE,
        LayerKind.CURVES,
        LayerKind.EXPOSURE,
        LayerKind.GRADIENTFILL,
        LayerKind.GRADIENTMAP,
        LayerKind.HUESATURATION,
        LayerKind.INVERSION,
        LayerKind.LEVELS,
        LayerKind.PATTERNFILL,
        LayerKind.PHOTOFILTER,
        LayerKind.POSTERIZE,
        LayerKind.SELECTIVECOLOR,
        LayerKind.SOLIDFILL,
        LayerKind.THRESHOLD,
        LayerKind.VIBRANCE
    ],

    ignoredNames: [
        'ignore',
        'ignore ',
        ' ignore',
        'ignored',
        'ignored ',
        ' ignored'
    ],

    illegalNames: [
        ' copy ',
        ' copy',
        'layer '
    ],

    cleanDocName: function(name) {
        var nameParts = name.split(' ');
        var newName = '';
        for (var i=0; i<nameParts.length; i++) {
            newName += nameParts[i][0].toUpperCase();
            newName += nameParts[i].substr(1, nameParts[i].length - 1);
        }
        if (newName.substr(newName.length - 4, 4).toLowerCase() === '.psd') {
            newName = newName.substr(0, newName.length - 4);
        }
        return newName;
    },

    setRulerUnits: function(units) {
        var rulerUnits = app.preferences.rulerUnits;
        app.preferences.rulerUnits = units;
        return rulerUnits;
    },

    layerIsValid: function(layer, index) {
        if (Helpers.skip && !layer.grouped) {
            Helpers.skip = false;
            return false;
        }

        if (Helpers.isAdjustmentLayer(layer.kind)) {
            Helpers.skip = layer.grouped;
            return false;
        }

        if (Helpers.findInArray(layer.name.toLowerCase(), Helpers.ignoredNames)) {
            return false;
        }

        if (layer.kind !== LayerKind.NORMAL) {
            return false;
        }

        if (layer.isBackgroundLayer) {
            return false;
        }

        if (Helpers.findInArray(layer.name.toLowerCase(), Helpers.illegalNames)) {
            return false;
        }

        if (Helpers.inIndex(index, layer.name)) {
            return false;
        }

        return true;
    },

    isAdjustmentLayer: function(layerKind) {
        var found = false;
        for (var n=0; n<Helpers.adjustmentLayers.length; n++) {
            found |= Helpers.adjustmentLayers[n] === layerKind;
        }
        return found;
    },

    findInArray: function(str, arr) {
        var found = false;
        for (var n=0; n<arr.length; n++) {
            found |= str.split(arr[n]).length > 1;
        }
        return found;
    },

    inIndex: function(index, name) {
        var found = false;
        for (var i=0; i<index.length; i++) {
            found |= index[i] === name;
        }
        return found;
    },

    rasterizeLayer: function(doc, layer) {
        layer.rasterize(RasterizeType.ENTIRELAYER);
        doc.activeLayer = layer;

        var idrasterizeLayer = stringIDToTypeID( "rasterizeLayer" );
        var desc19 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var ref3 = new ActionReference();
            var idLyr = charIDToTypeID( "Lyr " );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            ref3.putEnumerated( idLyr, idOrdn, idTrgt );
        desc19.putReference( idnull, ref3 );
        var idWhat = charIDToTypeID( "What" );
        var idrasterizeItem = stringIDToTypeID( "rasterizeItem" );
        var idlayerStyle = stringIDToTypeID( "layerStyle" );
        desc19.putEnumerated( idWhat, idrasterizeItem, idlayerStyle );
        executeAction( idrasterizeLayer, desc19, DialogModes.NO );
    },

    save: function(layer, exportFolder, fileOptions) {
        var newDoc = Helpers.newDocument(layer);
        var fileName = Helpers.stripWhitespace(layer.name) + '.png';
        newDoc.exportDocument(File(exportFolder + fileName),
                              ExportType.SAVEFORWEB,
                              fileOptions);
        newDoc.close(SaveOptions.DONOTSAVECHANGES);
    },

    newDocument: function(layer) {
        // Copy the content of the layer in the clipboard
        layer.copy();

        // Get the dimensions of the content of the layer
        var width = layer.bounds[2].as("px") - layer.bounds[0].as("px");
        var height = layer.bounds[3].as("px") - layer.bounds[1].as("px");

        // Create a new document with the correct dimensions
        // and a transparent background
        var newDoc = app.documents.add(width, height, 72,
                                       layer.name,
                                       NewDocumentMode.RGB,
                                       DocumentFill.TRANSPARENT);

        // Add an empty layer and paste the content of the
        // clipboard inside
        var targetLayer = newDoc.artLayers.add();
        newDoc.paste();
        return newDoc;
    },

    stripWhitespace: function(str) {
        return str.split(' ').join('');
    },

    removeEmptyLines: function(lines) {
        var newlines = [];
        for (var i=0; i<lines.length; i++) {
            if (typeof lines[i] !== 'undefined' &&
                lines[i] !== null &&
                lines[i] !== '') {
                newlines.push(lines[i]);
            }
        }
        return newlines;
    },

    debugLines: function(lines) {
        for (var i=0; i<lines.length; i++) {
            E.dispatch('no.syng.debug', i+': '+lines[i]);
        }
    },

};

var E = {
    dispatch: function(type, payload) {
        try {
            var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
        } catch (e) {
        }

        if (xLib) {
            var eventObj = new CSXSEvent();
            eventObj.type = type;
            eventObj.data = payload;
            eventObj.dispatch();
        }
    },
}

function Prefs(docPath) {
    this.docPath = docPath;

    this.decode = function(str) {
        return decodeURIComponent(str);
    };

    this.getLines = function() {
        var settings = File(this.docPath);
        settings.encoding = "UTF8";
        settings.open("r", "TEXT");
        return settings.read().split('\n');
    };

    this.writeLines = function(lines) {
        var settings = File(this.docPath);
        settings.encoding = "UTF8";
        settings.open("w", "TEXT");
        if (DEBUG) {
            E.dispatch('no.syng.debug', "Write:");
            Helpers.debugLines(lines);
        }
        settings.write(lines.join('\n'));
        settings.close();
    };

    this.prefExists = function(docPath, lines) {
        docPath = String(docPath);

        if (DEBUG) {
            E.dispatch('no.syng.debug', "PrefExists");
            E.dispatch('no.syng.debug', "- docPath: "+docPath);
        }

        var n = -1;
        for (var i=0; i<lines.length; i+=2) {
            var line = String(lines[i]);
            if (DEBUG) {
                E.dispatch('no.syng.debug', "- line["+i+"]: " + line);
            }
            if (line === null || line === "") {
                continue;
            }
            if (DEBUG) {
                E.dispatch('no.syng.debug', "- match: " + (line === docPath));
            }
            if (line === docPath) {
                n = i;
                break;
            }
        }
        return n;
    };

    this.findDocFor = function(lines, folder) {
        folder = String(folder);
        for (var i=1; i<lines.length; i+=2) {
            if (String(lines[i]) == folder) {
                return i - 1;
            }
        }
        return -1;
    };
};

Prefs.prototype.getPref = function() {
    var activeDoc = String(app.activeDocument.fullName);

    var settings = File(this.docPath);
    settings.encoding = "UTF8";
    settings.open("e", "TEXT");
    var exportPath = '...';

    if (settings.exists) {
        var lines = this.getLines();
        for (var i=0; i<lines.length; i+=2) {
            var line = String(lines[i]);
            if (line === null || line === "") {
                continue;
            }
            if (line === activeDoc) {
                exportPath = lines[i+1];
            }
        }
    }

    settings.close();
    E.dispatch('no.syng.getpref', this.decode(exportPath));
};

Prefs.prototype.setPref = function(folder) {
    folder = String(folder);
    var lines = this.getLines();

    var doci = this.findDocFor(lines, folder);
    if (doci > -1) {
        alert("You have set the same export folder for " + lines[doci] + "." +
              "\n\n" +
              "This will get messy. Please pick a different folder.");
        return;
    }

    if (DEBUG) {
        E.dispatch('no.syng.debug', "SetPref");
        E.dispatch('no.syng.debug', "Doc path: "+app.activeDocument.fullName);
        E.dispatch('no.syng.debug', "Export folder: "+folder);
        E.dispatch('no.syng.debug', "Current lines:");
        Helpers.debugLines(lines);
    }

    lines = Helpers.removeEmptyLines(lines);

    if (DEBUG) {
        E.dispatch('no.syng.debug', "Remove empty lines");
        Helpers.debugLines(lines);
    }

    var i = this.prefExists(app.activeDocument.fullName, lines);

    if (DEBUG) {
        E.dispatch('no.syng.debug', "Pref exists on line "+i);
    }

    if (i >= 0) {
        if (DEBUG) {
            E.dispatch('no.syng.debug', "Splice start at "+i+" len 2");
        }
        lines.splice(i, 2);
    }

    lines.push(app.activeDocument.fullName);
    lines.push(folder);
    this.writeLines(lines);
    E.dispatch('no.syng.setpref', app.activeDocument.fullName);
};

function Data(exportPath) {
    this.docName = Helpers.cleanDocName(app.activeDocument.name);
    this.docPath = app.activeDocument.path;
    this.exportFolder = '';
    this.doc = app.activeDocument;
    this.validLayers = [];
    this.layerNameIndex = [];
    this.fileOptions = {};
    this.exportFolder = String(exportPath);
    this.fileOptions = new ExportOptionsSaveForWeb();
    this.fileOptions.format = SaveDocumentType.PNG;
    this.fileOptions.PNG8 = false;
    this.fileOptions.transparency = true;
    this.fileOptions.optimized = true;
};

Data.prototype.duplicateDoc = function() {
    this.doc = app.activeDocument.duplicate("temp", false);
};

Data.prototype.getValidLayers = function(layers) {
    for (var i=0; i<layers.length; i++) {
        var layer = layers[i];

        if (layer.typename === "ArtLayer") {
            if (Helpers.layerIsValid(layer, this.layerNameIndex)) {
                this.layerNameIndex.push(layer.name);
                this.validLayers.push(layer);
            }
        }

        var isIgnored = Helpers.findInArray(layer.name.toLowerCase(),
                                            Helpers.ignoredNames);
        if (layer.typename === "LayerSet" && !isIgnored) {
            this.getValidLayers(layer.layers);
        }
    }
};

Data.prototype.exportLayers = function() {
    for (var i=0; i<this.validLayers.length; i++) {
        app.activeDocument = this.doc;
        var layer = this.validLayers[i];
        Helpers.rasterizeLayer(this.doc, layer);
        Helpers.save(layer, this.exportFolder, this.fileOptions);
    }
};

Data.prototype.closeTempDoc = function() {
    if (this.doc.name === "temp") {
        this.doc.close(SaveOptions.DONOTSAVECHANGES);
    }
};

var settingsPath = app.preferencesFolder + '/syng_settings.cfg';
var DEBUG = false;

function exportDoc(exportPath) {
    var data = new Data(exportPath + '/');
    data.duplicateDoc();
    data.rulerUnits = Helpers.setRulerUnits(Units.PIXELS);
    data.getValidLayers(data.doc.layers);
    data.exportLayers();
    data.closeTempDoc();
    Helpers.setRulerUnits(data.rulerUnits);
}

function getPref() {
    new Prefs(settingsPath)
        .getPref();
}

function setPref(folder) {
    new Prefs(settingsPath)
        .setPref(folder);
}

function selectFolder() {
    var folder = Folder.selectDialog("Select export folder");
    E.dispatch("no.syng.folderselect", String(folder));
}

function setDebugMode() {
    DEBUG = true;
}
