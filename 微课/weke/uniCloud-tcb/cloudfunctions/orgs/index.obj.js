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
			if (res.data.length === 0) {
				return orgId
			}
		}
		const tel = param.tel ?? ""
		const addr = param.addr ?? ""
		const desc = param.desc ?? ""
		const logoId = param.logoId ?? ""
		const teacherIds = param.teacherIds ?? []
		const studentIds = param.studentIds ?? []
		const courseIds = param.courseIds ?? []
		const classIds = param.classIds ?? []
		const type = param.type ?? 0
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
				classIds: classIds,
				type: type
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
	 * @param {roles} 角色id集合
	 * @param {excludes} 排除的机构id集合
	 */
	async fetchOrgs(userId, roles, excludes) {
		if (typeof(userId) === 'undefined' || userId.length === 0 ||
			typeof(roles) === 'undefined' || roles.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const dbCmd = db.command
		let res_creator = {data:[]}
		let res_teacher = {data:[]}
		let res_student = {data:[]}
		let res_parents = {data:[]}
		
		// 1. 创建者
		if (roles.includes(1)) {
			res_creator = await db.collection("wk-orgs").where({
				_id: dbCmd.nin(excludes),
				creatorId: userId,
				type: 0
			}).get()
		}
		
		// 2. 老师
		if (roles.includes(2)) {
			res_teacher = await db.collection("wk-orgs").where({
				_id: dbCmd.nin(excludes),
				teacherIds: userId,
				type: 0
			}).get()
		}
		
		// 3. 家长 
		if (roles.includes(3)) {
			const children = await db.collection('wk-student').where({
				parentIds: userId
			}).get()
			for (let child of children.data) {
				const res = await db.collection("wk-orgs").where({
					_id: dbCmd.nin(excludes),
					studentIds: child._id,
					type: 0
				}).get()
				res_parents.data.push(...res.data)
			}
		}
		
		// 4. 学员
		if (roles.includes(4)) {
			res_student = await db.collection("wk-orgs").where({
				_id: dbCmd.nin(excludes),
				studentIds: userId,
				type: 0
			}).get()
		}
		
		let result = []
		let orgIds = []
		let total = [
			...res_creator.data, 
			...res_teacher.data, 
			...res_student.data, 
			...res_parents.data
		]
		total.forEach(org => {
			if (!orgIds.includes(org._id)) {
				orgIds.push(org._id)
				result.push(org)
			}
		})
		
		return result
	},
	/**
	 * @param {Object} userId 机构创建者
	 */
	async fetchAnonymousOrg(userId) {
		let org = {}
		if (typeof(userId) !== 'undefined' && userId.length !== 0) {
			const db = uniCloud.database()
			const res = await db.collection('wk-orgs').where({
				creatorId: userId,
				type: 1
			}).get()
			if (res.data.length > 0) {
				org = res.data[0]
			}
		}
		return org
	},
	async addTeachers(orgId, tIds) {
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(tIds) === 'undefined' || tIds.length === 0) {
			return
		}
		const db = uniCloud.database()
		let res = await db.collection('wk-orgs').where({
			_id: orgId
		}).field({teacherIds:true}).get()
		const data = res.data
		let ids = []
		if (data.length > 0) {
			ids = data[0].teacherIds
		}
		tIds.forEach(teacherId => {
			if (!ids.includes(teacherId)) {
				ids.push(teacherId)
			}
		})
		res = db.collection('wk-orgs').where({
			_id: orgId
		}).update({
			teacherIds: ids
		})
	}
}
