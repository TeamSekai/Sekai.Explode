import { LANG, strFormat } from '../../../util/languages';
import {
	CheckHostRequest,
	CheckPingOk,
	isValidHostname,
	CheckTcpUdpOk,
	CheckTcpUdpError,
	CheckHttpOk,
	CheckHttpComplete,
	CheckDnsOk,
	CheckHostResult,
} from '../check-host';
import { FormatTableOption, formatTable } from '../../../util/strings';
import { SimpleSlashCommandBuilder } from '../../../common/SimpleCommand';

const MAX_NODES = 40;

async function getFormattedResult<T extends CheckHostResult>(
	request: CheckHostRequest<T>,
	rowFormat: (result: T) => unknown[],
	options: FormatTableOption,
) {
	const resultMap = await request.checkResult(1.0, 7);
	const table = [...resultMap.entries()].map(([node, result]) => {
		const nodeName = node.name.replace('.node.check-host.net', '');
		const prefix = `[${nodeName}]`;
		console.log(strFormat(LANG.common.message.dataFor, [nodeName]), result);
		const row = rowFormat(result);
		if (row.length == 0) {
			return [prefix];
		}
		return [prefix + ' ' + row[0], ...row.slice(1)];
	});
	return formatTable(table, {
		align: ['left', ...(options.align ?? [])],
		...(options ?? {}),
	});
}

async function checkPing(hostname: string) {
	const request = await CheckHostRequest.get('ping', hostname, MAX_NODES);
	return async () =>
		await getFormattedResult(
			request,
			(result) => {
				if (!(result instanceof CheckPingOk)) {
					return [result.state];
				}
				const values = result.values;
				const average =
					values.reduce((a, { ping: b }) => a + b, 0) / values.length;
				return [
					values[3].reply + ',',
					values[3].ping,
					'/',
					values[2].reply + ',',
					values[2].ping,
					'| Ping:',
					`${Math.floor(average * 1000)} ms`,
				];
			},
			{
				align: ['left', 'left', 'left', 'left', 'left', 'left', 'right'],
			},
		);
}

async function checkHttp(hostname: string) {
	const request = await CheckHostRequest.get('http', hostname, MAX_NODES);
	return async () =>
		await getFormattedResult(
			request,
			(result) => {
				const row: unknown[] = [result.state + ','];
				if (result instanceof CheckHttpComplete) {
					const { time, statusMessage } = result;
					row.push(time + ',');
					if (result instanceof CheckHttpOk) {
						const { statusCode, host } = result;
						row.push(statusMessage + ',', statusCode + ',', host);
					} else {
						row.push(statusMessage);
					}
				}
				return row;
			},
			{
				align: ['left', 'right', 'left', 'right', 'left'],
			},
		);
}

async function checkTcpUdp(type: 'tcp' | 'udp', hostname: string) {
	const request = await CheckHostRequest.get(type, hostname, MAX_NODES);
	return async () =>
		await getFormattedResult(
			request,
			(result) => {
				if (result instanceof CheckTcpUdpOk) {
					return [
						'OK,',
						result.time,
						'| Ping:',
						`${Math.floor(result.time * 1000)} ms`,
					];
				}
				if (result instanceof CheckTcpUdpError) {
					return ['ERROR,', result.description];
				}
				return [result.state];
			},
			{
				align: ['left', 'left', 'left', 'right'],
			},
		);
}

async function checkDns(hostname: string) {
	const request = await CheckHostRequest.get('dns', hostname, MAX_NODES);
	return async () =>
		await getFormattedResult(
			request,
			(result) => {
				if (!(result instanceof CheckDnsOk)) {
					return [result.state];
				}
				return [
					'TTL:',
					result.ttl,
					...[...result.a, ...result.aaaa].map((e, i, { length }) =>
						i == length - 1 ? e : e + ', ',
					),
				];
			},
			{
				align: ['left', 'right', 'left'],
			},
		);
}

function check(
	type: 'ping' | 'http' | 'tcp' | 'dns' | 'udp',
	hostname: string,
) {
	switch (type) {
		case 'ping':
			return checkPing(hostname);
		case 'http':
			return checkHttp(hostname);
		case 'tcp':
		case 'udp':
			return checkTcpUdp(type, hostname);
		case 'dns':
			return checkDns(hostname);
	}
}

module.exports = SimpleSlashCommandBuilder.create(
	LANG.commands.check.name,
	LANG.commands.check.description,
)
	.addStringOption({
		name: LANG.commands.check.options.type.name,
		description: LANG.commands.check.options.type.description,
		required: true,
		choices: [
			{
				name: LANG.commands.check.options.type.choices.ping,
				value: 'ping',
			},
			{
				name: LANG.commands.check.options.type.choices.http,
				value: 'http',
			},
			{
				name: LANG.commands.check.options.type.choices.tcp,
				value: 'tcp',
			},
			{
				name: LANG.commands.check.options.type.choices.dns,
				value: 'dns',
			},
			{
				name: LANG.commands.check.options.type.choices.udp,
				value: 'udp',
			},
		],
	})
	.addStringOption({
		name: LANG.commands.check.options.hostname.name,
		description: LANG.commands.check.options.hostname.description,
		required: true,
	})
	.build(async (interaction, type, hostname) => {
		if (!isValidHostname(hostname)) {
			// IPアドレスが間違っています。(IPv4、またはドメインのみ対応しています。
			await interaction.reply(LANG.commands.check.invalidHostnameError);
			return;
		}
		const getResult = await check(type, hostname);
		const msg = await interaction.reply(LANG.common.message.checking);
		const str = await getResult();
		msg.edit({
			content: LANG.common.message.result,
			files: [
				{
					attachment: Buffer.from(str),
					name: 'result.txt',
				},
			],
		});
	});
