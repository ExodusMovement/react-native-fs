/**
 * React Native FS
 */

'use strict';

// This file supports both iOS and Android

var RNFSManager = require('react-native').NativeModules.RNFSManager;

var isIOS = require('react-native').Platform.OS === 'ios';

var RNFSFileTypeRegular = RNFSManager.RNFSFileTypeRegular;
var RNFSFileTypeDirectory = RNFSManager.RNFSFileTypeDirectory;

var normalizeFilePath = (path) => (path.startsWith('file://') ? path.slice(7) : path);

function encode(contents, encoding) {
  if (encoding === 'utf8') return btoa(unescape(encodeURIComponent(contents)));
  if (encoding === 'ascii') return btoa(contents);
  if (encoding === 'base64') return contents;
  throw new Error(`Invalid encoding type "${encoding}"`);
}

function decode(b64, encoding) {
  if (encoding === 'utf8') return decodeURIComponent(escape(atob(b64)));
  if (encoding === 'ascii') return atob(b64);
  if (encoding === 'base64') return b64;
  throw new Error(`Invalid encoding type "${encoding}"`);
}

/**
 * Generic function used by readFile and readFileAssets
 */
function readFileGeneric(filepath, encodingOrOptions, command) {
  var options = {
    encoding: 'utf8'
  };

  if (encodingOrOptions) {
    if (typeof encodingOrOptions === 'string') {
      options.encoding = encodingOrOptions;
    } else if (typeof encodingOrOptions === 'object') {
      options = encodingOrOptions;
    }
  }

  return command(normalizeFilePath(filepath)).then((b64) => decode(b64, options.encoding));
}

/**
 * Generic function used by readDir and readDirAssets
 */
function readDirGeneric(dirpath, command) {
  return command(normalizeFilePath(dirpath)).then(files => {
    return files.map(file => ({
      ctime: file.ctime && new Date(file.ctime * 1000) || null,
      mtime: file.mtime && new Date(file.mtime * 1000) || null,
      name: file.name,
      path: file.path,
      size: file.size,
      isFile: () => file.type === RNFSFileTypeRegular,
      isDirectory: () => file.type === RNFSFileTypeDirectory,
    }));
  });
}

var RNFS = {

  mkdir(filepath, options = {}) {
    return RNFSManager.mkdir(normalizeFilePath(filepath), options).then(() => void 0);
  },

  moveFile(filepath, destPath, options = {}) {
    return RNFSManager.moveFile(normalizeFilePath(filepath), normalizeFilePath(destPath), options).then(() => void 0);
  },

  copyFile(filepath, destPath, options = {}) {
    return RNFSManager.copyFile(normalizeFilePath(filepath), normalizeFilePath(destPath), options).then(() => void 0);
  },

  pathForBundle(bundleNamed) {
    return RNFSManager.pathForBundle(bundleNamed);
  },

  pathForGroup(groupName) {
    return RNFSManager.pathForGroup(groupName);
  },

  getFSInfo() {
    return RNFSManager.getFSInfo();
  },

  getAllExternalFilesDirs() {
    return RNFSManager.getAllExternalFilesDirs();
  },

  unlink(filepath) {
    return RNFSManager.unlink(normalizeFilePath(filepath)).then(() => void 0);
  },

  exists(filepath) {
    return RNFSManager.exists(normalizeFilePath(filepath));
  },

  readDir(dirpath) {
    return readDirGeneric(dirpath, RNFSManager.readDir);
  },

  // Android-only
  readDirAssets(dirpath) {
    if (!RNFSManager.readDirAssets) {
      throw new Error('readDirAssets is not available on this platform');
    }
    return readDirGeneric(dirpath, RNFSManager.readDirAssets);
  },

  // Android-only
  existsAssets(filepath) {
    if (!RNFSManager.existsAssets) {
      throw new Error('existsAssets is not available on this platform');
    }
    return RNFSManager.existsAssets(filepath);
  },

  // Android-only
  existsRes(filename) {
    if (!RNFSManager.existsRes) {
      throw new Error('existsRes is not available on this platform');
    }
    return RNFSManager.existsRes(filename);
  },

  // Node style version (lowercase d). Returns just the names
  readdir(dirpath) {
    return RNFS.readDir(normalizeFilePath(dirpath)).then(files => {
      return files.map(file => file.name);
    });
  },

  // setReadable for Android
  setReadable(filepath, readable, ownerOnly) {
    return RNFSManager.setReadable(filepath, readable, ownerOnly).then((result) => {
      return result;
    })
  },

  stat(filepath) {
    return RNFSManager.stat(normalizeFilePath(filepath)).then((result) => {
      return {
        'path': filepath,
        'ctime': new Date(result.ctime * 1000),
        'mtime': new Date(result.mtime * 1000),
        'size': result.size,
        'mode': result.mode,
        'originalFilepath': result.originalFilepath,
        isFile: () => result.type === RNFSFileTypeRegular,
        isDirectory: () => result.type === RNFSFileTypeDirectory,
      };
    });
  },

  readFile(filepath, encodingOrOptions) {
    return readFileGeneric(filepath, encodingOrOptions, RNFSManager.readFile);
  },

  readUtf8(filepath) {
    return RNFSManager.readUtf8(normalizeFilePath(filepath));
  },

  read(filepath, length = 0, position = 0, encodingOrOptions) {
    var options = {
      encoding: 'utf8'
    };

    if (encodingOrOptions) {
      if (typeof encodingOrOptions === 'string') {
        options.encoding = encodingOrOptions;
      } else if (typeof encodingOrOptions === 'object') {
        options = encodingOrOptions;
      }
    }

    return RNFSManager.read(normalizeFilePath(filepath), length, position).then((b64) => decode(b64, options.encoding));
  },

  // Android only
  readFileAssets(filepath, encodingOrOptions) {
    if (!RNFSManager.readFileAssets) {
      throw new Error('readFileAssets is not available on this platform');
    }
    return readFileGeneric(filepath, encodingOrOptions, RNFSManager.readFileAssets);
  },

  // Android only
  readFileRes(filename, encodingOrOptions) {
    if (!RNFSManager.readFileRes) {
      throw new Error('readFileRes is not available on this platform');
    }
    return readFileGeneric(filename, encodingOrOptions, RNFSManager.readFileRes);
  },

  hash(filepath, algorithm) {
    return RNFSManager.hash(normalizeFilePath(filepath), algorithm);
  },

  // Android only
  copyFileAssets(filepath, destPath) {
    if (!RNFSManager.copyFileAssets) {
      throw new Error('copyFileAssets is not available on this platform');
    }
    return RNFSManager.copyFileAssets(normalizeFilePath(filepath), normalizeFilePath(destPath)).then(() => void 0);
  },

  // Android only
  copyFileRes(filename, destPath) {
    if (!RNFSManager.copyFileRes) {
      throw new Error('copyFileRes is not available on this platform');
    }
    return RNFSManager.copyFileRes(filename, normalizeFilePath(destPath)).then(() => void 0);
  },

  // iOS only
  // Copies fotos from asset-library (camera-roll) to a specific location
  // with a given width or height
  // @see: https://developer.apple.com/reference/photos/phimagemanager/1616964-requestimageforasset
  copyAssetsFileIOS(imageUri, destPath, width, height,
    scale = 1.0, compression = 1.0, resizeMode = 'contain') {
    return RNFSManager.copyAssetsFileIOS(imageUri, destPath, width, height, scale, compression, resizeMode);
  },

  // iOS only
  // Copies fotos from asset-library (camera-roll) to a specific location
  // with a given width or height
  // @see: https://developer.apple.com/reference/photos/phimagemanager/1616964-requestimageforasset
  copyAssetsVideoIOS(imageUri, destPath) {
    return RNFSManager.copyAssetsVideoIOS(imageUri, destPath);
  },

  writeFile(filepath, contents, encodingOrOptions) {
    var options = {
      encoding: 'utf8'
    };

    if (encodingOrOptions) {
      if (typeof encodingOrOptions === 'string') {
        options.encoding = encodingOrOptions;
      } else if (typeof encodingOrOptions === 'object') {
        options = {
          ...options,
          ...encodingOrOptions
        };
      }
    }

    const b64 = encode(contents, options.encoding);

    return RNFSManager.writeFile(normalizeFilePath(filepath), b64, options).then(() => void 0);
  },

  writeUtf8(filepath, contents) {
    return RNFSManager.writeUtf8(normalizeFilePath(filepath), contents).then(() => void 0);
  },

  appendFile(filepath, contents, encodingOrOptions) {
    var options = {
      encoding: 'utf8'
    };

    if (encodingOrOptions) {
      if (typeof encodingOrOptions === 'string') {
        options.encoding = encodingOrOptions;
      } else if (typeof encodingOrOptions === 'object') {
        options = encodingOrOptions;
      }
    }

    const b64 = encode(contents, options.encoding);

    return RNFSManager.appendFile(normalizeFilePath(filepath), b64);
  },

  write(filepath, contents, position, encodingOrOptions) {
    var options = {
      encoding: 'utf8'
    };

    if (encodingOrOptions) {
      if (typeof encodingOrOptions === 'string') {
        options.encoding = encodingOrOptions;
      } else if (typeof encodingOrOptions === 'object') {
        options = encodingOrOptions;
      }
    }

    const b64 = encode(contents, options.encoding);

    if (position === undefined) {
      position = -1;
    }

    return RNFSManager.write(normalizeFilePath(filepath), b64, position).then(() => void 0);
  },

  touch(filepath, mtime, ctime) {
    if (ctime && !(ctime instanceof Date)) throw new Error('touch: Invalid value for argument `ctime`');
    if (mtime && !(mtime instanceof Date)) throw new Error('touch: Invalid value for argument `mtime`');
    var ctimeTime = 0;
    if (isIOS) {
      ctimeTime = ctime && ctime.getTime();
    }
    return RNFSManager.touch(
      normalizeFilePath(filepath),
      mtime && mtime.getTime(),
      ctimeTime
    );
  },

  // not accurate on ios
  canOpenFile(filepath, scheme) {
    const path = `${isIOS ? 'file://' : ''}${normalizeFilePath(filepath)}`
    return RNFSManager.canOpenFile(
      path,
      scheme,
    );
  },

  openFile(filepath, scheme) {
    const path = `${isIOS ? 'file://' : ''}${normalizeFilePath(filepath)}`
    return RNFSManager.openFile(
      path,
      scheme,
    );
  },

  scanFile(path) {
    return RNFSManager.scanFile(path);
  },

  MainBundlePath: RNFSManager.RNFSMainBundlePath,
  CachesDirectoryPath: RNFSManager.RNFSCachesDirectoryPath,
  ExternalCachesDirectoryPath: RNFSManager.RNFSExternalCachesDirectoryPath,
  DocumentDirectoryPath: RNFSManager.RNFSDocumentDirectoryPath,
  DownloadDirectoryPath: RNFSManager.RNFSDownloadDirectoryPath,
  ExternalDirectoryPath: RNFSManager.RNFSExternalDirectoryPath,
  ExternalStorageDirectoryPath: RNFSManager.RNFSExternalStorageDirectoryPath,
  TemporaryDirectoryPath: RNFSManager.RNFSTemporaryDirectoryPath,
  LibraryDirectoryPath: RNFSManager.RNFSLibraryDirectoryPath,
  PicturesDirectoryPath: RNFSManager.RNFSPicturesDirectoryPath,
  FileProtectionKeys: RNFSManager.RNFSFileProtectionKeys
};

module.exports = RNFS;
