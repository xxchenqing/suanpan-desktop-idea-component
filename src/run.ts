import { ChildProcess, spawn } from 'child_process';
import * as global from './global';
import logger from './eventlogger/eventlogger';
import { getSpArgsArrary, formatUserCodeProcessStdio } from './common';

export function init(app) {
}

export function startUserCode() {
	const child: ChildProcess = spawn(
		global.context.cpLanguageCmd,
		[`${global.context.cpParamsEntry}`].concat(
			getSpArgsArrary(global.context.spParam),
		),
		{
			cwd: global.context.cpParamsWorkDir,
			detached: false,
		},
	);

	// TODO: 目前是外面的代码逻辑控制是否 startUserCode, 底下的运行模式判断没必要
	child
		.on('error', (err) => {
			console.error(
				`启动用户组件程序失败, err: ${err}, 运行模式[${global.context.runMode}]`,
			);
			logger.Instance.error(
				`启动用户组件程序失败, err: ${err}, 运行模式[${global.context.runMode}]`,
			);

			if (global.context.runMode !== 'edit') {
				process.exit(1);
			}
		})
		.on('exit', (code) => {
			if (global.context.runMode !== 'edit' && !global.context.isDebugKill) {
				console.error(
					`用户组件程序关闭, 退出码（code: ${code}）, 运行模式[${global.context.runMode}]`,
				);
				logger.Instance.error(
					`用户组件程序关闭, 退出码（code: ${code}）, 运行模式[${global.context.runMode}]`,
				);

				process.exit(1);
			}
			global.context.isDebugKill = false;
		});

	child.stdout?.on('data', (data) => {
		console.log(formatUserCodeProcessStdio('stdout', data));
	});

	child.stderr?.on('data', (data) => {
		console.log(formatUserCodeProcessStdio('stderr', data));
	});

	if (child.pid) {
		global.context.userCodePid = child.pid;
		console.info(`启动用户组件程序成功, pid: ${child.pid}`);
		logger.Instance.info(`启动用户组件程序成功, pid: ${child.pid}`);
	}
}
