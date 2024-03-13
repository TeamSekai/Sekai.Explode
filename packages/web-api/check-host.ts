const { setTimeout } = require('timers/promises');
const axios = require('axios').default;

/**
 * @template {CheckHostResult} R
 * @typedef {Object} CheckHostType
 * @property {(data: any) => R} castResult
 */

/**
 * @typedef {[string, string, string]} CheckHostNodeLocation
 */

/**
 * @typedef {Object} CheckHostNode
 * @property {string} name
 * @property {string} asn
 * @property {string} ip
 * @property {CheckHostNodeLocation} location
 */

/**
 * @typedef {Object} RequestData
 * @property {1} ok
 * @property {string} request_id
 * @property {string} permanent_link
 * @property {{[key: string]: string[]}} nodes
 */

/** @type {Map<string, CheckHostNode>} */
const nodeMap = new Map();

const axiosCheckHost = axios.create({
	baseURL: 'https://check-host.net/',
	headers: {
		Accept: 'application/json',
	},
});

/**
 * 名前からノードを取得する。
 * @param {string} name ノードの名前
 */
async function getCheckHostNode(name) {
	const value = nodeMap.get(name);
	if (value != null) {
		return value;
	}
	const res = await axiosCheckHost.get('/nodes/hosts');
	const nodes = res.data.nodes;
	for (const [key, value] of Object.entries(nodes)) {
		const mapValue = nodeMap.get(key);
		if (mapValue == null) {
			nodeMap.set(key, value);
		}
	}
	const result = nodeMap.get(name);
	if (result == null) {
		throw new TypeError(`Unknown node: ${name}`);
	}
	return result;
}

/**
 * @template {CheckHostResult} R
 */
class CheckHostRequest {
	/** @type {CheckHostType<R>} */
	checkType;

	/** @type {string} */
	requestId;

	/** @type {string} */
	permanentLink;

	/** @type {CheckHostNode[]} */
	nodes;

	/**
	 * @param {CheckHostType<R>} checkType
	 * @param {RequestData} data
	 */
	constructor(checkType, data) {
		this.checkType = checkType;
		this.requestId = data.request_id;
		this.permanentLink = data.permanent_link;
		const nodes = [];
		for (const [key, value] of Object.entries(data.nodes)) {
			const existingNode = nodeMap.get(key);
			if (existingNode != null) {
				nodes.push(existingNode);
			} else {
				/** @type {CheckHostNode} */
				const node = {
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
	 * @param {number} successRate この割合のノードが成功したら終了
	 * @param {number} time 問い合わせる最大の回数
	 * @param {number} period 問い合わせる周期
	 * @returns
	 */
	async checkResult(successRate = 0, time = 1, period = 2000) {
		/** @type {CheckHostResultMap<R>} */
		const result = new CheckHostResultMap();
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
	static async get(checkType, host, maxNodes) {
		const checkTypeObject = checkTypes[checkType];
		const res = await axiosCheckHost.get(`/check-${checkType}`, {
			params: { host, maxNodes },
		});
		return new CheckHostRequest(checkTypeObject, res.data);
	}
}

/**
 * @template {CheckHostResult} R
 * @extends {Map<CheckHostNode, R>}
 */
class CheckHostResultMap extends Map {
	/**
	 * 条件に一致するノードの個数を返す。
	 * @param {(node: CheckHostNode, result: R) => boolean} predicate
	 */
	count(predicate) {
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

	/**
	 * @param {'ok' | 'error' | 'processing'} state
	 */
	constructor(state) {
		this.state = state;
	}
}

// check-ping

class CheckPingResult extends CheckHostResult {
	/**
	 * @param {'ok' | 'error' | 'processing'} state
	 */
	constructor(state) {
		super(state);
	}
}

class CheckPingOk extends CheckPingResult {
	/** @type {string} */
	host;

	/** @type {{reply: 'OK' | 'TIMEOUT' | 'MALFORMED', ping: number}[]} */
	values;

	/**
	 * @param {any} payload
	 */
	constructor(payload) {
		super('ok');
		this.host = payload[0][2];
		this.values = payload.map((/** @type {any[]} */ a) => ({
			reply: a[0],
			ping: a[1],
		}));
	}
}

/** @type {CheckHostType<CheckPingResult>} */
const CHECK_PING = {
	castResult(/** @type {any} */ data) {
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
	constructor(state) {
		super(state);
	}
}

class CheckHttpComplete extends CheckHttpResult {
	/** @type {boolean} */
	success;

	/** @type {number} */
	time;

	/** @type {string} */
	statusMessage;

	/**
	 * @param {'ok' | 'error' | 'processing'} state
	 * @param {number} success
	 * @param {number} time
	 * @param {string} statusMessage
	 */
	constructor(state, success, time, statusMessage) {
		super(state);
		this.success = success != 0;
		this.time = time;
		this.statusMessage = statusMessage;
	}
}

class CheckHttpOk extends CheckHttpComplete {
	/** @type {number} */
	statusCode;

	/** @type {string} */
	host;

	/**
	 * @param {number} success
	 * @param {number} time
	 * @param {string} statusMessage
	 * @param {string} statusCode
	 * @param {string} host
	 */
	constructor(success, time, statusMessage, statusCode, host) {
		super('ok', success, time, statusMessage);
		this.statusCode = Number.parseInt(statusCode);
		this.host = host;
	}
}

class CheckHttpError extends CheckHttpComplete {
	/**
	 * @param {number} success
	 * @param {number} time
	 * @param {string} statusMessage
	 */
	constructor(success, time, statusMessage) {
		super('error', success, time, statusMessage);
	}
}

/** @type {CheckHostType<CheckHttpResult>} */
const CHECK_HTTP = {
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
	/**
	 * @param {'ok' | 'error' | 'processing'} state
	 */
	constructor(state) {
		super(state);
	}
}

class CheckTcpUdpOk extends CheckTcpUdpResult {
	/** @type {number} */
	time;

	/** @type {string} */
	address;

	/**
	 * @param {any} payload
	 */
	constructor(payload) {
		super('ok');
		this.time = payload.time;
		this.address = payload.address;
	}
}

class CheckTcpUdpError extends CheckTcpUdpResult {
	description;

	/**
	 * @param {string} description
	 */
	constructor(description) {
		super('error');
		this.description = description;
	}
}

/** @type {CheckHostType<CheckTcpUdpResult>} */
const CHECK_TCP_UDP = {
	castResult(/** @type {any} */ data) {
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
	/**
	 * @param {'ok' | 'error' | 'processing'} state
	 */
	constructor(state) {
		super(state);
	}
}

class CheckDnsOk extends CheckDnsResult {
	a;

	aaaa;

	ttl;

	/**
	 *
	 * @param {string[]} a
	 * @param {string[]} aaaa
	 * @param {number} ttl
	 */
	constructor(a, aaaa, ttl) {
		super('ok');
		this.a = a;
		this.aaaa = aaaa;
		this.ttl = ttl;
	}
}

/** @type {CheckHostType<CheckDnsResult>} */
const CHECK_DNS = {
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

function isValidHostname(str) {
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
