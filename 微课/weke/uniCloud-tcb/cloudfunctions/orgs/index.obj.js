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
		const teacherIds = param.teacherIds ?? []
		const studentIds = param.studentIds ?? []
		const courseIds = param.courseIds ?? []
		const classIds = param.classIds ?? []
		if (isCreate) {
			// 机构不存在
			let res = await db.collection('wk-orgs').add({
				name: param.name,
				tel: tel,
				addr: addr,
				desc: desc,
				logoId: logoId,
				createDate: param.createDate,
				gradient: param.gradient,
				creatorId: param.creatorId,
				teacherIds: teacherIds,
				studentIds: studentIds,
				courseIds: courseIds,
				classIds: classIds
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
				gradient: param.gradient,
				teacherIds: teacherIds,
				studentIds: studentIds,
				courseIds: courseIds,
				classIds: classIds
			})
			orgId = _id
		}
		return orgId
	},
	/**
	 * 获取所有与用户相关的机构信息
	 * @param {userId} 机构创建者id
	 * @param {excludes} 排除的机构id集合
	 */
	async fetchOrgs(userId, excludes) {
		if (typeof(userId) === 'undefined' || userId.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const dbCmd = db.command
		// 1. 创建者
		const res_creator = await db.collection("wk-orgs").where({
			_id: dbCmd.nin(excludes),
			creatorId: userId
		}).get()
		// 2. 老师
		const res_teacher = await db.collection("wk-orgs").where({
			_id: dbCmd.nin(excludes),
			teacherIds: userId
		}).get()
		// 3. 学员
		const res_student = await db.collection("wk-orgs").where({
			_id: dbCmd.nin(excludes),
			studentIds: userId
		}).get()
		return [...res_creator.data, ...res_teacher.data, ...res_student.data]
	},
}
