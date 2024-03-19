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
		let tel = param.tel
		let addr = param.addr
		let desc = param.desc
		let logoId = param.logoId
		let teacherIds = param.teacherIds
		let studentIds = param.studentIds
		let courseIds = param.courseIds
		let classIds = param.classIds
		let type = param.type
		if (typeof(tel) === 'undefined') {
			tel = ""
		}
		if (typeof(addr) === 'undefined') {
			addr = ""
		}
		if (typeof(desc) === 'undefined') {
			desc = ""
		}
		if (typeof(logoId) === 'undefined') {
			logoId = ""
		}
		if (typeof(teacherIds) === 'undefined') {
			teacherIds = []
		}
		if (typeof(studentIds) === 'undefined') {
			studentIds = []
		}
		if (typeof(courseIds) === 'undefined') {
			courseIds = []
		}
		if (typeof(classIds) === 'undefined') {
			classIds = []
		}
		if (typeof(type) === 'undefined') {
			type = 0
		}
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
	async asyncFetchOrgById(orgId) {
		if (typeof(orgId) === 'undefined' || orgId.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const dbCmd = db.command
		const res = await db.collection("wk-orgs").where({
			_id: orgId
		}).get()
		return res.data
	},
	/**
	 * 获取所有与用户相关的机构信息
	 * @param {userId} 机构创建者id
	 */
	async fetchOrgs(userId, from="wx") {
		if (typeof(userId) === 'undefined' || userId.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const dbCmd = db.command
		let res_creator = {data:[]}
		let res_teacher = {data:[]}
		let res_parents = {data:[]}
		let res_students = {data:[]}
		
		// 1. 创建者
		res_creator = await db.collection("wk-orgs").where({
			creatorId: userId,
		}).get()
		
		// 2. 老师
		res_teacher = await db.collection("wk-orgs").where({
			teacherIds: userId,
		}).get()
		
		// 3. 家长
		const students = await db.collection('wk-student').where({
			associateIds: userId
		}).get()
		for (let student of students.data) {
			const res = await db.collection("wk-orgs").where({
				studentIds: student._id,
			}).get()
			res_parents.data.push(...res.data)
		}
		
		// 4. 学员
		if (from === 'stuNo') {
			res_students = await db.collection("wk-orgs").where({
				studentIds: userId,
			}).get()
		}
		
		let result = []
		let orgIds = []
		let total = [
			...res_creator.data, 
			...res_teacher.data, 
			...res_parents.data,
			...res_students.data
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
		return res.updated > 0
	},
	async removeStudents(orgId, sIds) {
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(sIds) === 'undefined' || sIds.length === 0) {
			return false
		}
		const db = uniCloud.database()
		let res = await db.collection('wk-orgs').where({
			_id: orgId
		}).field({studentIds:true}).get()
		const data = res.data
		let ids = []
		if (data.length > 0) {
			ids = data[0].studentIds
		}
		sIds.forEach(id => {
			const index = ids.findIndex(sid => sid === id)
			if (index !== -1) {
				ids.splice(index, 1)
			}
		})
		res = await db.collection('wk-orgs').where({
			_id: orgId
		}).update({
			studentIds: ids
		})
		return res.updated > 0
	},
	async removeTeachers(orgId, tIds) {
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(tIds) === 'undefined' || tIds.length === 0) {
			return false
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
		tIds.forEach(id => {
			const index = ids.findIndex(tid => tid === id)
			if (index !== -1) {
				ids.splice(index, 1)
			}
		})
		res = await db.collection('wk-orgs').where({
			_id: orgId
		}).update({
			teacherIds: ids
		})
		return res.updated > 0
	}
}
