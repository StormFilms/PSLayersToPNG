# PSLayersToPNG
Plugin that prepares and exports layers based on certain rules

## Generate a certificate

```
./tools/ZXPSignCmd -selfSignedCert <countryCode> <stateOrProvince> <organization> <commonName> <password> <outputPath.p12>
```

## Build the zxp

```
./tools/ZXPSignCmd -sign <inputDirectory> <outputZxp> <p12> <p12Password>
```

ZXPSignCmd will not update the .zxp-file if you run the same command twice. Delete the old file first, like this:

```
rm <zxpFile> & ./tools/ZXPSignCmd -sign <inputDirectory> <outputZxp> <p12> <p12Password>
```

## Install

Download ZXPInstaller from [http://zxpinstaller.com](http://zxpinstaller.com) or from the ```tools``` folder. Open the app and drag the .zxp file generated by ```ZXPSignCmd``` onto the app.

## Allow unsigned extensions

This is really handy for editing plugins without the need for repackaging and installation. First, package the app and install it. The plugin should be installed in ```/Library/Application Support/Adobe/CEP/extensions/no.stormfilms.syngexporter```. From here you can edit the files and reload in Photoshop.

Tip for reloading an extension:

1. Assing a keyboard shortcut via Edit > Keyboard Shortcuts to more easily open the extension.
2. Double click the title bar to minimize. Double click again to open. This causes a full reload of the extension.

Enable unsigned extensions on macOS:

```
defaults write com.adobe.CSXS.7 PlayerDebugMode 1
```

## Documentation

### Resources

* [http://www.adobe.com/devnet/creativesuite/articles/a-short-guide-to-HTML5-extensions.html](Adobe Devnet: A Short Guide to HTML5 Extensibility)

### This is how the plugin works
Bla bla bla

## Credits

Created by Thomas Viktil [github.com/mandarinx](https://github.com/mandarinx), [@mandarinx](https://twitter.com/mandarinx) for [Storm Films AS](http://stormfilms.no).

