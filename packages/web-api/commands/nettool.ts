import { SlashCommandBuilder } from 'discord.js';
import dns from 'dns';
import axios from 'axios';
import ipRangeCheck from 'ip-range-check';
import { LANG, strFormat } from '../../../util/languages';
import { getIpInfo } from '../ip-api';
import assert from 'assert';
let cfIps = [];
axios
	.get('https://www.cloudflare.com/ips-v4')
	.then((res) => {
		cfIps = res.data.split('\n');
	})
	.catch(() => {
		console.log(LANG.commands.nettool.ipListFetchError);
	});
const dnsTypes = /** @type {const} */ [
	'A',
	'AAAA',
	'NS',
	'CNAME',
	'TXT',
	'MX',
	'SRV',
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.nettool.name)
		.setDescription(LANG.commands.nettool.description)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(LANG.commands.nettool.subcommands.isProxy.name)
				.setDescription(LANG.commands.nettool.subcommands.isProxy.description)
				.addStringOption((option) =>
					option
						.setName(LANG.commands.nettool.subcommands.isProxy.options.ip.name)
						.setDescription(
							LANG.commands.nettool.subcommands.isProxy.options.ip.description,
						)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(LANG.commands.nettool.subcommands.ipInfo.name)
				.setDescription(LANG.commands.nettool.subcommands.ipInfo.description)
				.addStringOption((option) =>
					option
						.setName(LANG.commands.nettool.subcommands.ipInfo.options.ip.name)
						.setDescription(
							LANG.commands.nettool.subcommands.ipInfo.options.ip.description,
						)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(LANG.commands.nettool.subcommands.nsLookup.name)
				.setDescription(LANG.commands.nettool.subcommands.nsLookup.description)
				.addStringOption((option) =>
					option
						.setName(
							LANG.commands.nettool.subcommands.nsLookup.options.domain.name,
						)
						.setDescription(
							LANG.commands.nettool.subcommands.nsLookup.options.domain
								.description,
						)
						.setRequired(true),
				),
		),

	execute: async function (
		/** @type {import("discord.js").ChatInputCommandInteraction} */ interaction,
	) {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === LANG.commands.nettool.subcommands.isProxy.name) {
			const ip = interaction.options
				.getString(
					LANG.commands.nettool.subcommands.isProxy.options.ip.name,
					true,
				)
				.replace(/@/g, '@\u200B');
			const { status, value: ipInfo } = await getIpInfo(ip, {
				fields: 'status,country,regionName,city,isp,proxy,hosting',
			});
			if (status == 'err') {
				interaction.reply(
					strFormat(LANG.commands.nettool.subcommands.isProxy.error, [
						ipInfo.message,
					]),
				);
				return;
			}
			console.log(ipInfo.proxy);
			console.log(ipInfo.hosting);
			if (ipInfo.proxy || ipInfo.hosting) {
				await interaction.reply({
					embeds: [
						{
							title:
								LANG.commands.nettool.subcommands.isProxy.detectionResult.title,
							description: strFormat(
								LANG.commands.nettool.subcommands.isProxy.detectionResult
									.description,
								[ip],
							),
							thumbnail: {
								url: `https://cdn.discordapp.com/attachments/1126424081630249002/1160444437453881344/unknown.jpg`,
							},
							color: 0xf2930d,
							fields: [
								{
									name: LANG.commands.nettool.subcommands.isProxy
										.detectionResult.country,
									value: ipInfo.country,
									inline: true,
								},
								{
									name: LANG.commands.nettool.subcommands.isProxy
										.detectionResult.isp,
									value: ipInfo.isp,
									inline: true,
								},
								{
									name: LANG.commands.nettool.subcommands.isProxy
										.detectionResult.isProxyOrHosting,
									value:
										strFormat(
											LANG.commands.nettool.subcommands.isProxy.detectionResult
												.isProxyValue,
											[ipInfo.proxy],
										) +
										'\n' +
										strFormat(
											LANG.commands.nettool.subcommands.isProxy.detectionResult
												.isHostingValue,
											[ipInfo.hosting],
										),
									inline: true,
								},
							],
						},
					],
				});
				return;
			}
			await interaction.reply(
				strFormat(LANG.commands.nettool.subcommands.isProxy.safeResult, [ip]),
			);
		}

		if (subcommand === LANG.commands.nettool.subcommands.ipInfo.name) {
			await interaction.deferReply();
			const ip = interaction.options.getString(
				LANG.commands.nettool.subcommands.ipInfo.options.ip.name,
				true,
			);
			const { status, value: data } = await getIpInfo(ip);
			if (status == 'err') {
				await interaction.editReply({
					embeds: [
						{
							title: LANG.commands.nettool.errorTitle,
							description: `${data.message}`,
							color: 0xff0000,
							footer: {
								text: LANG.commands.nettool.resultFooter,
							},
						},
					],
				});
			}
			console.log(
				strFormat(LANG.commands.nettool.subcommands.ipInfo.targetLog, [ip]),
			);
			console.log(
				strFormat(LANG.commands.nettool.subcommands.ipInfo.statusLog, [
					data.status,
				]),
			);
			if (data?.status == '404' || data?.bogon == true) {
				throw new Error(
					LANG.commands.nettool.subcommands.ipInfo.invalidIpError,
				);
			}
			console.log(data.hostname);
			console.log(data.country);
			console.log(data.city);
			console.log(data.region);
			console.log(data.org);
			await interaction.editReply({
				embeds: [
					{
						title: strFormat(
							LANG.commands.nettool.subcommands.ipInfo.result.title,
							[ip],
						),
						color: 0xfd75ff,
						footer: {
							text: LANG.commands.nettool.resultFooter,
						},
						fields: [
							{
								name: LANG.commands.nettool.subcommands.ipInfo.result.target,
								value: interaction.options.getString(
									LANG.commands.nettool.subcommands.ipInfo.options.ip.name,
								),
							},
							{
								name: LANG.commands.nettool.subcommands.ipInfo.result.country,
								value: data.country,
							},
							{
								name: LANG.commands.nettool.subcommands.ipInfo.result.city,
								value: data.city,
							},
							{
								name: LANG.commands.nettool.subcommands.ipInfo.result.region,
								value: data.region,
							},
							{
								name: LANG.commands.nettool.subcommands.ipInfo.result.org,
								value: data.org,
							},
						],
					},
				],
			});
		}
		if (subcommand === LANG.commands.nettool.subcommands.nsLookup.name) {
			await interaction.deferReply();
			const domainName = interaction.options.getString(
				LANG.commands.nettool.subcommands.nsLookup.options.domain.name,
				true,
			);
			try {
				const dnsResult = {};

				await Promise.all(
					dnsTypes.map(async (type) => {
						try {
							let res = await dns.promises.resolve(domainName, type);
							assert(res instanceof Array);
							if (res.length > 0) {
								if (type == 'MX') {
									res = res.sort((a, b) => b.priority - a.priority);
									dnsResult[type] =
										'```\n' +
										res
											.map((x) => {
												return strFormat(
													LANG.commands.nettool.subcommands.nsLookup.mxRecord,
													{
														exchange: x.exchange,
														priority: x.priority,
													},
												);
											})
											.join('\n') +
										'\n```';
									return;
								}
								dnsResult[type] =
									'```\n' +
									res
										.map((x) => {
											const isCf = ipRangeCheck(x, cfIps);
											return strFormat(
												LANG.commands.nettool.subcommands.nsLookup.record,
												{
													record: x,
													isCloudFlare: isCf
														? LANG.commands.nettool.subcommands.nsLookup
																.isCloudFlare.yes
														: LANG.commands.nettool.subcommands.nsLookup
																.isCloudFlare.no,
												},
											);
										})
										.join('\n') +
									'\n```';
							}
						} catch (e) {
							if (e.code == 'ENOTFOUND') {
								throw new Error(
									LANG.commands.nettool.subcommands.nsLookup.domainDoesNotExist,
								);
							}
						}
					}),
				);

				const fields = dnsTypes
					.filter((x) => dnsResult[x])
					.map((x) => {
						return /** @type {import("discord.js").APIEmbedField} */ {
							name: x,
							value: dnsResult[x],
						};
					});

				await interaction.editReply({
					embeds: [
						{
							title: `${domainName}`,
							color: 0xfd75ff,
							footer: {
								text: LANG.commands.nettool.resultFooter,
							},
							fields,
						},
					],
				});
			} catch (e) {
				await interaction.editReply({
					embeds: [
						{
							title: 'エラー',
							description: `${e.message}`,
							color: 0xff0000,
							footer: {
								text: LANG.commands.nettool.resultFooter,
							},
						},
					],
				});
			}
		}
	},
};
