import { setTimeout } from 'timers/promises';
import axios from 'axios';

interface CheckHostType<R extends CheckHostResult> {
	castResult: (data: any) => R;
}

type CheckHostNodeLocation = [string, string, string];

interface CheckHostNode {
	name: string;
	asn: string;
	ip: string;
	location: CheckHostNodeLocation;
}

interface RequestData {
	ok: 1;
	request_id: string;
	permanent_link: string;
	nodes: { [key: string]: string[] };
}

const nodeMap = new Map<string, CheckHostNode>();

const axiosCheckHost = axios.create({
	baseURL: 'https://check-host.net/',
	headers: {
		Accept: 'application/json',
	},
});

/**
 * 名前からノードを取得する。
 * @param name ノードの名前
 */
async function getCheckHostNode(name: string) {
	const value = nodeMap.get(name);
	if (value != null) {
		return value;
	}
	const res = await axiosCheckHost.get('/nodes/hosts');
	const nodes = res.data.nodes;
	for (const [key, value] of Object.entries(nodes)) {
		const mapValue = nodeMap.get(key);
		if (mapValue == null) {
			nodeMap.set(key, value as CheckHostNode);
		}
	}
	const result = nodeMap.get(name);
	if (result == null) {
		throw new TypeError(`Unknown node: ${name}`);
	}
	return result;
}

class CheckHostRequest<R extends CheckDnsResult> {
	checkType: CheckHostType<R>;

	requestId: string;

	permanentLink: string;

	nodes: CheckHostNode[];

	constructor(checkType: CheckHostType<R>, data: RequestData) {
		this.checkType = checkType;
		this.requestId = data.request_id;
		this.permanentLink = data.permanent_link;
		const nodes = [];
		for (const [key, value] of Object.entries(data.nodes)) {
			const existingNode = nodeMap.get(key);
			if (existingNode != null) {
				nodes.push(existingNode);
			} else {
				const node: CheckHostNode = {
					name: key,
					asn: value[4],
					ip: value[3],
					location: [value[0], value[1], value[2]],
				};
				nodeMap.set(key, node);
				nodes.push(node);
			}
		}
		this.nodes = nodes;
	}

	/**
	 * 結果を問い合わせる。
	 * @param successRate この割合のノードが成功したら終了
	 * @param time 問い合わせる最大の回数
	 * @param period 問い合わせる周期
	 * @returns
	 */
	async checkResult(
		successRate: number = 0,
		time: number = 1,
		period: number = 2000,
	) {
		const result = new CheckHostResultMap<R>();
		const successThreshold = this.nodes.length * successRate;
		for (let i = 0; i < time; i++) {
			await setTimeout(period);
			const res = await axiosCheckHost.get(`/check-result/${this.requestId}`);
			for (const [key, value] of Object.entries(res.data)) {
				result.set(
					await getCheckHostNode(key),
					this.checkType.castResult(value),
				);
			}
			if (result.ok() + result.error() >= successThreshold) {
				break;
			}
		}
		return result;
	}

	/**
	 * @overload
	 * @param {'ping'} checkType
	 * @param {string} host
	 * @param {number} maxNodes
	 * @returns {Promise<CheckHostRequest<CheckPingResult>>}
	 */

	/**
	 * @overload
	 * @param {'http'} checkType
	 * @param {string} host
	 * @param {number} maxNodes
	 * @returns {Promise<CheckHostRequest<CheckHttpResult>>}
	 */

	/**
	 * @overload
	 * @param {'tcp' | 'udp'} checkType
	 * @param {string} host
	 * @param {number} maxNodes
	 * @returns {Promise<CheckHostRequest<CheckTcpUdpResult>>}
	 */

	/**
	 * @overload
	 * @param {'dns'} checkType
	 * @param {string} host
	 * @param {number} maxNodes
	 * @returns {Promise<CheckHostRequest<CheckDnsResult>>}
	 */

	/**
	 * Check Host の API にリクエストを送る。
	 * @param {'ping' | 'http' | 'tcp' | 'dns' | 'udp'} checkType チェックを行う項目
	 * @param {string} host チェックを行うホスト名
	 * @param {number} maxNodes チェックに用いる最大ノード数
	 * @returns {Promise<CheckHostRequest<CheckHostResult>>} リクエストを表すオブジェクト
	 */
	static async get(
		checkType: 'ping' | 'http' | 'tcp' | 'dns' | 'udp',
		host: string,
		maxNodes: number,
	): Promise<CheckHostRequest<CheckHostResult>> {
		const checkTypeObject = checkTypes[checkType];
		const res = await axiosCheckHost.get(`/check-${checkType}`, {
			params: { host, maxNodes },
		});
		return new CheckHostRequest(checkTypeObject, res.data);
	}
}

class CheckHostResultMap<R extends CheckHostResult> extends Map<
	CheckHostNode,
	R
> {
	/**
	 * 条件に一致するノードの個数を返す。
	 * @param {(node: CheckHostNode, result: R) => boolean} predicate
	 */
	count(predicate: (node: CheckHostNode, result: R) => boolean) {
		let count = 0;
		for (const [node, result] of this.entries()) {
			if (predicate(node, result)) {
				count++;
			}
		}
		return count;
	}

	ok() {
		return this.count((node, result) => result.state == 'ok');
	}

	error() {
		return this.count((node, result) => result.state == 'error');
	}

	processing() {
		return this.count((node, result) => result.state == 'processing');
	}
}

class CheckHostResult {
	state;

	constructor(state: 'ok' | 'error' | 'processing') {
		this.state = state;
	}
}

// check-ping

class CheckPingResult extends CheckHostResult {
	constructor(state: 'ok' | 'error' | 'processing') {
		super(state);
	}
}

class CheckPingOk extends CheckPingResult {
	host: string;

	values: { reply: 'OK' | 'TIMEOUT' | 'MALFORMED'; ping: number }[];

	constructor(payload: any) {
		super('ok');
		this.host = payload[0][2];
		this.values = payload.map((a: any[]) => ({
			reply: a[0],
			ping: a[1],
		}));
	}
}

const CHECK_PING: CheckHostType<CheckPingResult> = {
	castResult(data: any) {
		if (data == null) {
			return new CheckPingResult('processing');
		}
		const payload = data[0];
		if (payload[0] == null) {
			return new CheckPingResult('error');
		}
		return new CheckPingOk(payload);
	},
};

// check-http

class CheckHttpResult extends CheckHostResult {
	constructor(state: 'ok' | 'error' | 'processing') {
		super(state);
	}
}

class CheckHttpComplete extends CheckHttpResult {
	success: boolean;

	time: number;

	statusMessage: string;

	constructor(
		state: 'ok' | 'error' | 'processing',
		success: number,
		time: number,
		statusMessage: string,
	) {
		super(state);
		this.success = success != 0;
		this.time = time;
		this.statusMessage = statusMessage;
	}
}

class CheckHttpOk extends CheckHttpComplete {
	statusCode: number;

	host: string;

	constructor(
		success: number,
		time: number,
		statusMessage: string,
		statusCode: string,
		host: string,
	) {
		super('ok', success, time, statusMessage);
		this.statusCode = Number.parseInt(statusCode);
		this.host = host;
	}
}

class CheckHttpError extends CheckHttpComplete {
	constructor(success: number, time: number, statusMessage: string) {
		super('error', success, time, statusMessage);
	}
}

/** @type {CheckHostType<CheckHttpResult>} */
const CHECK_HTTP: CheckHostType<CheckHttpResult> = {
	castResult(data) {
		if (!(data instanceof Array)) {
			return new CheckHttpResult('processing');
		}
		const [success, time, statusMessage, statusCode, host] = data[0];
		if (statusCode != null) {
			return new CheckHttpOk(success, time, statusMessage, statusCode, host);
		} else {
			return new CheckHttpError(success, time, statusMessage);
		}
	},
};

// check-tcp, check-udp

class CheckTcpUdpResult extends CheckHostResult {
	constructor(state: 'ok' | 'error' | 'processing') {
		super(state);
	}
}

class CheckTcpUdpOk extends CheckTcpUdpResult {
	time: number;

	address: string;

	constructor(payload: any) {
		super('ok');
		this.time = payload.time;
		this.address = payload.address;
	}
}

class CheckTcpUdpError extends CheckTcpUdpResult {
	description;

	constructor(description: string) {
		super('error');
		this.description = description;
	}
}

const CHECK_TCP_UDP: CheckHostType<CheckTcpUdpResult> = {
	castResult(data: any) {
		if (data == null) {
			return new CheckTcpUdpResult('processing');
		}
		const payload = data[0];
		if ('error' in payload) {
			return new CheckTcpUdpError(payload.error);
		}
		if ('timeout' in payload) {
			return new CheckTcpUdpError('Connection timed out');
		}
		return new CheckTcpUdpOk(payload);
	},
};

// check-dns

class CheckDnsResult extends CheckHostResult {
	constructor(state: 'ok' | 'error' | 'processing') {
		super(state);
	}
}

class CheckDnsOk extends CheckDnsResult {
	a;

	aaaa;

	ttl;

	constructor(a: string[], aaaa: string[], ttl: number) {
		super('ok');
		this.a = a;
		this.aaaa = aaaa;
		this.ttl = ttl;
	}
}

const CHECK_DNS: CheckHostType<CheckDnsResult> = {
	castResult(data) {
		if (data == null) {
			return new CheckDnsResult('processing');
		}
		const { A, AAAA, TTL } = data[0];
		if (TTL == null) {
			return new CheckDnsResult('error');
		}
		return new CheckDnsOk(A, AAAA, TTL);
	},
};

// util

const checkTypes = Object.freeze({
	ping: CHECK_PING,
	tcp: CHECK_TCP_UDP,
	http: CHECK_HTTP,
	dns: CHECK_DNS,
	udp: CHECK_TCP_UDP,
});

const ipv4Regex =
	/^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

const hostnameRegex =
	/^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*\.?$/;

function isValidHostname(str: string) {
	if (!ipv4Regex.test(str) && !hostnameRegex.test(str)) {
		try {
			new URL(str);
			return true;
		} catch {
			return false;
		}
	}
	return true;
}

export {
	CheckHostRequest,
	CheckHostResult,
	CheckPingResult,
	CheckPingOk,
	CheckTcpUdpResult,
	CheckTcpUdpOk,
	CheckTcpUdpError,
	CheckHttpResult,
	CheckHttpComplete,
	CheckHttpOk,
	CheckHttpError,
	CheckDnsResult,
	CheckDnsOk,
	isValidHostname,
};
