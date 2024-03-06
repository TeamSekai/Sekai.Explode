// @ts-check

const { LANG, strFormat } = require('../util/languages');
const {
	CheckHostRequest,
	CHECK_PING,
	CheckPingOk,
	isValidHostname,
} = require('../util/check-host');
const { formatTable } = require('../util/strings');
const { SimpleSlashCommandBuilder } = require('../common/SimpleCommand');

module.exports = SimpleSlashCommandBuilder.create(
	LANG.commands.checkping.name,
	LANG.commands.checkping.description,
)
	.addStringOption({
		name: LANG.commands.checkping.options.ip.name,
		description: LANG.common.optionDescription.ipAddress,
		required: true,
	})
	.build(async (interaction, url) => {
		if (!isValidHostname(url)) {
			// IPアドレスが間違っています。(IPv4、またはドメインのみ対応しています。
			await interaction.reply(LANG.commands.checkping.invalidIpError);
			return;
		}
		const request = await CheckHostRequest.get(CHECK_PING, url, 40);
		const msg = await interaction.reply(LANG.common.message.checking);
		const resultMap = await request.checkResult(1.0, 7);
		const table = [...resultMap.entries()].map(([node, result]) => {
			const nodeName = node.name.replace('.node.check-host.net', '');
			const prefix = `[${nodeName}]`;
			console.log(strFormat(LANG.common.message.dataFor, [nodeName]), result);
			if (result instanceof CheckPingOk) {
				const values = result.values;
				const average =
					values.reduce((a, { ping: b }) => a + b, 0) / values.length;
				return [
					prefix,
					values[3].reply + ',',
					values[3].ping,
					'/',
					values[2].reply + ',',
					values[2].ping,
					'| Ping:',
					`${Math.floor(average * 1000)} ms`,
				];
			}
			return [prefix, result.state];
		});
		const str = formatTable(table, {
			align: ['left', 'left', 'left', 'left', 'left', 'left', 'left', 'right'],
		});
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
