// @ts-check

const axios = require('axios').default;
const { Ok, Err } = require('../../util/result');

/**
 * @typedef {Object} IpApiGeolocationFullData
 * @property {string} status
 * @property {string} message
 * @property {string} continent
 * @property {string} continentCode
 * @property {string} country
 * @property {string} countryCode
 * @property {string} region
 * @property {string} regionName
 * @property {string} city
 * @property {string} district
 * @property {string} zip
 * @property {number} lat
 * @property {number} lon
 * @property {string} timezone
 * @property {number} offset
 * @property {string} isp
 * @property {string} org
 * @property {string} as
 * @property {string} asname
 * @property {string} reverse
 * @property {boolean} mobile
 * @property {boolean} proxy
 * @property {boolean} hosting
 * @property {string} query
 */

/**
 * @template {string} F
 * @typedef {Object} IpApiGeolocationOption
 * @property {F=} fields
 * @property {(
 *     "en" |
 *     "de" |
 *     "es" |
 *     "pt-BR" |
 *     "fr" |
 *     "ja" |
 *     "zh-CN" |
 *     "ru"
 * )=} lang
 */

/**
 * @template {string} T
 * @typedef {Partial<IpApiGeolocationFullData> & ({
 *     [K in import("../../util/types").Split<T, ","> & keyof IpApiGeolocationFullData]: IpApiGeolocationFullData[K]
 * })} IpApiGeolocationData
 */

/**
 * @template {string} F
 * @param {string} ip IP アドレス
 * @param {IpApiGeolocationOption<F>=} params 情報を取得する項目
 * @returns {Promise<import("../../util/result").Result<IpApiGeolocationData<F>>>} 結果を Result 型でラップしたもの
 */
async function getIpInfo(ip, params) {
	try {
		const res = await axios.get(
			`http://ip-api.com/json/${encodeURI(ip)}?${new URLSearchParams(params)}`,
		);
		return new Ok(/** @type {IpApiGeolocationData<F>} */ (res.data));
	} catch (e) {
		return new Err(e);
	}
}

module.exports = { getIpInfo };
