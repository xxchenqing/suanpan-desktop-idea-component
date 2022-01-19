"use strict";
exports.__esModule = true;
exports.createLaunchJson = exports.tryOpenVscode = exports.writeJson = exports.init = void 0;
var child_process_1 = require("child_process");
var path_1 = require("path");
var global = require("./global");
var common_1 = require("./common");
var eventlogger_1 = require("./eventlogger/eventlogger");
var fse = require('fs-extra');
function init(app) {
    // app.get('/usercode/debug/attach', (req, resp) => {
    // 	const workDir = global.context.cpParamsWorkDir;
    // 	// const workDir = `C:/Users/laien.cyx/Desktop/repo/xuelang-group/suanpan-desktop-component-vscode-user`;
    // 	console.log(workDir);
    // 	tryWriteLaunchJson(
    // 		path.join(workDir, '.vscode/launch.json'),
    // 		createLaunchJson('attach'),
    // 		req,
    // 		resp,
    // 	);
    // 	tryOpenVscode(workDir, req, resp);
    // });
    app.get('/usercode/debug/launch', function (req, resp) {
        global.context.isDebugKill = true;
        var workDir = global.context.cpParamsWorkDir;
        // 杀死已经运行的用户组件程序
        if (global.context.runMode !== 'edit' && global.context.userCodePid) {
            eventlogger_1["default"].Instance.warn("\u7528\u6237\u70B9\u51FB\u8C03\u8BD5\u7A0B\u5E8F, \u4E3B\u52A8\u6740\u6B7B\u73B0\u6709\u8FDB\u7A0B, pid: " + global.context.userCodePid);
            common_1.killProcess(global.context.userCodePid);
            global.context.userCodePid = 0;
        }
        // 配置好launch.json
        try {
            writeJson(path_1["default"].join(workDir, '.vscode/launch.json'), createLaunchJson('launch'));
        }
        catch (err) {
            console.log("write launch.json failed: " + err);
            eventlogger_1["default"].Instance.info("write launch.json failed: " + err);
            resp.send({ success: false, msg: "" + err });
            return;
        }
        tryOpenVscode(workDir, req, resp);
    });
}
exports.init = init;
function writeJson(filePath, launch) {
    var data = JSON.stringify(launch, null, '\t');
    return fse.outputFileSync(filePath, data);
}
exports.writeJson = writeJson;
function tryOpenVscode(workDir, req, resp) {
    try {
        // 启动 vscode
        var child = child_process_1.spawn('code', ['-n', workDir], {
            cwd: workDir,
            detached: true,
            shell: true,
            windowsHide: true,
            stdio: 'ignore'
        });
        if (!child.pid) {
            throw new Error("\u7CFB\u7EDF\u5185\u90E8\u9519\u8BEF");
        }
        console.info("\u6253\u5F00 vscode \u6210\u529F");
        eventlogger_1["default"].Instance.info("\u6253\u5F00 vscode \u6210\u529F");
        resp.send({
            success: true,
            msg: "open vscode success"
        });
    }
    catch (err) {
        console.log("\u6253\u5F00 vscode \u5931\u8D25, err: " + err);
        eventlogger_1["default"].Instance.info("\u6253\u5F00 vscode \u5931\u8D25, err: " + err);
        resp.send({ success: false, msg: "" + err });
    }
}
exports.tryOpenVscode = tryOpenVscode;
function createLaunchJson(debugType) {
    switch (global.context.cpParamsLanguage) {
        case 'nodejs': {
            var launch = {
                version: '0.2.0',
                configurations: [
                    {
                        name: "sp-debug-" + global.context.cpLanguageCmd + "-launch",
                        type: 'node',
                        skipFiles: [
                            '<node_internals>/**',
                            // eslint-disable-next-line no-template-curly-in-string
                            '${workspaceFolder}/node_modules/**/*.js',
                        ],
                        request: 'launch'
                    },
                ]
            };
            if (debugType === 'attach') {
                launch.configurations[0].request = 'attach';
                // launch.configurations[0].processId = String(global.context.userCodePid), // 直接设置好已经启动的用户进程（组件）,但是该方式有效的前提是：用户进程启动时必须不能是debug模式启动的, 若是debug模式启动的,则只需要配置另一个选项即可，port，但是该程序并无法获知该端口信息
                // eslint-disable-next-line no-template-curly-in-string
                launch.configurations[0].processId = '${command:PickProcess}'; // 用户调试时一开始弹出进程选择器列表, 让用户自己选择调试对象，不过该方式原理同上。两者的区别是上者是直接指定了调试对象，而下者是让用自己选。
            }
            else {
                launch.configurations[0].program = global.context.cpParamsEntry;
                launch.configurations[0].env = process.env;
                launch.configurations[0].args = common_1.getSpArgsArrary(global.context.spParam);
            }
            return launch;
        }
        case 'python': {
            var launch = {
                version: '0.2.0',
                configurations: [
                    {
                        name: "sp-debug-" + global.context.cpLanguageCmd + "-launch",
                        type: 'python',
                        request: 'launch',
                        gevent: true
                    },
                ]
            };
            if (debugType === 'attach') {
                launch.configurations[0].request = 'attach';
                // eslint-disable-next-line no-template-curly-in-string
                launch.configurations[0].processId = '${command:PickProcess}'; // 用户调试时一开始弹出进程选择器列表, 让用户自己选择调试对象，不过该方式原理同上。两者的区别是上者是直接指定了调试对象，而下者是让用自己选。
            }
            else {
                launch.configurations[0].program = global.context.cpParamsEntry;
                launch.configurations[0].env = process.env;
                launch.configurations[0].args = common_1.getSpArgsArrary(global.context.spParam);
            }
            return launch;
        }
        default:
            return null;
    }
}
exports.createLaunchJson = createLaunchJson;
