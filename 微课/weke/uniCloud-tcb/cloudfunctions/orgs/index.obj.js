// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
	_before: function () { // 通用预处理器

	},
	/**
	 * @param {Object} param 机构信息
	 */
	async createOrg(param) {
		let orgId = ""
		let isCreate = false
		const { _id } = param
		const db = uniCloud.database()
		if (_id.length === 0) {
			isCreate = true
		} else {
			let res = await db.collection("wk-orgs").where({
				_id: _id
			}).get()
			isCreate = res.data.length === 0
		}
		const tel = param.tel ?? ""
		const addr = param.addr ?? ""
		const desc = param.desc ?? ""
		const logoId = param.logoId ?? ""
		if (isCreate) {
			// 机构不存在
			let res = await db.collection('wk-orgs').add({
				name: param.name,
				tel: tel,
				addr: addr,
				desc: desc,
				logoId: logoId,
				createDate: param.createDate,
				gradient: param.gradient
			})
			const { id } = res
			if (typeof(id) !== 'undefined' && id.length > 0) {
				orgId = id
			}
		} else {
			// 机构存在
			let res = await db.collection("wk-orgs").where({
				_id: _id,
			}).update({
				name: param.name,
				tel: tel,
				addr: addr,
				desc: desc,
				logoId: logoId,
				createDate: param.createDate,
				gradient: param.gradient
			})
			orgId = _id
		}
		return orgId
	},
	/**
	 * 获取机构信息
	 * @param {orgId} 机构id
	 */
	async fetchOrg(orgId) {
		if (typeof(orgId) === 'undefined' || orgId.length === 0) {
			return {}
		}
		const db = uniCloud.database()
		const res = await db.collection("wk-orgs").where({
			_id: orgId
		}).get()
		return res.data[0];
	},
	/**
	 * 获取机构信息
	 * @param {orgIds} 机构id
	 */
	async fetchOrgs(orgIds) {
		if (typeof(orgIds) === 'undefined' || orgIds.length === 0) {
			return {}
		}
		const db = uniCloud.database()
		const dbCmd = db.command
		const res = await db.collection("wk-orgs").where({
			_id: dbCmd.in(orgIds)
		}).get()
		return res.data;
	},
}
