import {ideaEnv} from './types';
import path from 'path';
import * as global from './global';
import { killProcess } from './common';
import logger from './eventlogger/eventlogger';
const fse = require('fs-extra');
const xml2js = require('xml2js');
import { exec } from "child_process";


export function init(app) {
	app.get('/usercode/debug/launch', (req, resp) => {
		global.context.isDebugKill = true;
		const workDir = global.context.cpParamsWorkDir;

		// 杀死已经运行的用户组件程序
		if (global.context.runMode !== 'edit' && global.context.userCodePid) {
			logger.Instance.warn(
				`用户点击调试程序, 主动杀死现有进程, pid: ${global.context.userCodePid}`,
			);
			killProcess(global.context.userCodePid);
			global.context.userCodePid = 0;
		}
		logger.Instance.info(`idea项目路径为：${workDir}`);
		exec(`idea ${workDir}`, { windowsHide: true }, (err, stdout, stderr) => {
			if (err) {
				resp.send({
					success: false,
					msg: `open VS Code error!`,
				});
				return;
			}
			resp.send({
				success: true,
			});
		});
	});
}
export function writeIdeaXml(workDir: string, xmlJson: object) {
	const filePath = path.join(workDir, '.idea/workspace.xml');
	const builder = new xml2js.Builder();
	const xml = builder.buildObject(xmlJson);
	fse.outputFileSync(filePath, xml);
}

// @ts-ignore
export async function updateWorkSpaceXml(workDir: string, debugType: string) {
	const data = fse.readFileSync(path.join(workDir, '.idea/workspace.xml'), {encoding: 'utf-8'});
	let xmlJson;
	await xml2js.parseString(data, (err, result) => {
		if (err) {
			console.error(err);
			throw new Error(`修改配置文件错误${err}`);
		}
		result.project.component.forEach((com) => {
			console.log('---------------------------------------------');
			if (com.hasOwnProperty('configuration')) {
				com.configuration.forEach((each) => {
					if (each.$.type === 'SpringBootApplicationConfigurationType') {
						for (const envKey in process.env) {
							const env: ideaEnv = {
								$: {
									name: envKey,
									value: process.env[envKey],
								},
							};
							each.option.push(env);
						}
					}
				});
			}
		});
		xmlJson = result;
	});
	return xmlJson;
}
