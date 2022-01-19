"use strict";
exports.__esModule = true;
exports.context = void 0;
var minimist_1 = require("minimist");
var common_1 = require("./common");
var argvs = minimist_1["default"](process.argv);
exports.context = {
    affinity: common_1.buildSpAffinityUrl(),
    spParam: common_1.decodeBase64(process.env.SP_PARAM),
    cpParamsLanguage: argvs.language,
    cpLanguageCmd: common_1.getLanguageCmd(argvs),
    cpParamsWorkDir: common_1.getWorkDir(argvs),
    cpParamsEntry: common_1.getLanguageEntry(argvs),
    userCodePid: null,
    isFirstKill: true,
    isDebugKill: false,
    runMode: argvs.runMode,
    vscodePid: null,
    userId: process.env.SP_USER_ID,
    appId: process.env.SP_APP_ID,
    nodeId: process.env.SP_NODE_ID,
    nodePort: 8003
};
