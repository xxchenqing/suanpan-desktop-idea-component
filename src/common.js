"use strict";
exports.__esModule = true;
exports.formatUserCodeProcessStdio = exports.getSpArgsArrary = exports.killProcess = exports.getLauncType = exports.decodeBase64 = exports.getLanguageEntry = exports.getLanguageCmd = exports.getWorkDir = exports.buildSpAffinityUrl = exports.suanpan = void 0;
var child_process_1 = require("child_process");
var eventlogger_1 = require("./eventlogger/eventlogger");
var path_1 = require("path");
exports.suanpan = {
    affinity: process.env.SP_AFFINITY,
    host: process.env.SP_HOST,
    port: process.env.SP_PORT,
    protocol: process.env.SP_HOST_TLS && process.env.SP_HOST_TLS !== 'false',
    accessSecret: process.env.SP_ACCESS_SECRET,
    field: {
        userIdHeader: process.env.SP_USER_ID_HEADER_FIELD || 'x-sp-user-id',
        userSignature: process.env.SP_USER_SIGNATURE_HEADER_FIELD || 'x-sp-signature',
        userSignVersionHeader: process.env.SP_USER_SIGN_VERSION_HEADER_FIELD || 'x-sp-sign-version'
    }
};
function buildSpAffinityUrl() {
    var host = exports.suanpan.host, spPort = exports.suanpan.port, affinity = exports.suanpan.affinity, httpsProtocol = exports.suanpan.protocol;
    if (affinity) {
        return affinity;
    }
    var protocol = httpsProtocol ? 'https' : 'http';
    var port = spPort ? ":" + spPort : '';
    return protocol + "://" + host + port;
}
exports.buildSpAffinityUrl = buildSpAffinityUrl;
// 非绝对路径，则默认为节点的工作路径下
function getWorkDir(argvs) {
    var defaultWorkDir = path_1["default"].resolve(argvs['storage-minio-global-store'], argvs.language);
    try {
        if (path_1["default"].isAbsolute(argvs.workDir)) {
            return argvs.workDir;
        }
        console.warn("params workDir(" + argvs.workDir + ") is not absolute path, use default workDir(" + defaultWorkDir + ")");
    }
    catch (err) {
        console.warn("parse workDir(" + argvs.workDir + ") err: " + err + ", use default workDir(" + defaultWorkDir + ")");
    }
    return defaultWorkDir;
}
exports.getWorkDir = getWorkDir;
function getLanguageCmd(argvs) {
    switch (argvs.language) {
        case 'nodejs':
            return 'node';
        case 'python':
            return 'python';
        default:
            return '';
    }
}
exports.getLanguageCmd = getLanguageCmd;
function getLanguageEntry(argvs) {
    switch (argvs.language) {
        case 'nodejs':
            return argvs.entryNodejs || 'index.js';
        case 'python':
            return argvs.entryPython || 'main.py';
        default:
            return '';
    }
}
exports.getLanguageEntry = getLanguageEntry;
function decodeBase64(base64str) {
    return Buffer.from(base64str, 'base64').toString();
}
exports.decodeBase64 = decodeBase64;
function getLauncType(language) {
    switch (language) {
        case 'nodejs':
            return 'node';
        case 'python':
            return 'python';
        default:
            return '';
    }
}
exports.getLauncType = getLauncType;
function killProcess(pid) {
    try {
        child_process_1.execSync("taskkill /pid " + pid + " /t /f", {
            windowsHide: true
        });
    }
    catch (e) {
        console.error("kill process(pid=" + pid + ") err: " + e.message);
        eventlogger_1["default"].Instance.error("kill process(pid=" + pid + ") err: " + e.message);
    }
}
exports.killProcess = killProcess;
function getSpArgsArrary(spParams) {
    return spParams
        .trim()
        .split(/\s+/)
        .map(function (arg) { return arg.trim().replace(/'/g, ''); });
}
exports.getSpArgsArrary = getSpArgsArrary;
function formatUserCodeProcessStdio(stdio, message) {
    return "[usercode " + stdio + "] " + message;
}
exports.formatUserCodeProcessStdio = formatUserCodeProcessStdio;
