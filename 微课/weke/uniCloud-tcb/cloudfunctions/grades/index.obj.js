// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
	_before: function () { // 通用预处理器

	},
	async fetchGrades(gIds) {
		if (typeof(gIds) === 'undefined' || gIds.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const dbCmd = db.command
		const result = await db.collection('wk-classes').where({
			_id: dbCmd.in(gIds)
		}).get()
		return result.data
	},
	async fetchGradesByStudentId(sid) {
		if (typeof(sid) === 'undefined' || sid.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-classes').where({
			studentIds: sid
		}).get()
		return result.data
	},
	async createGrade(param) {
		const { name, icon, desc, orgId } = param
		if (typeof(name) === 'undefined' || name.length === 0 ||
			typeof(icon) === 'undefined' || icon.length === 0 ||
			typeof(orgId) === 'undefined' || orgId.length === 0) {
			return false
		}
		let { courseId, teacherId, studentIds } = param
		if (typeof(courseId) === 'undefined') {
			courseId = ''
		}
		if (typeof(teacherId) === 'undefined') {
			teacherId = ''
		}
		if (typeof(studentIds) === 'undefined') {
			studentIds = []
		}
		const db = uniCloud.database()
		const transaction = await db.startTransaction()
		try {
			const dbCmd = db.command
			// 1. 创建班级记录
			let result = await db.collection('wk-classes').add({
				name, icon, desc, courseId, teacherId, studentIds,orgId,
				createTime: Date.now()
			})
			const gradeId = result.id
			const { inserted } = result
			
			// 2. 将班级记录id添加到相应机构
			result = await db.collection('wk-orgs').where({
				_id: orgId
			}).update({
				classIds: dbCmd.push(gradeId)
			})
			const { updated } = result
			if (inserted === 1 && updated === 1) {
				return gradeId
			} else {
				return ''
			}
		} catch(e) {
			await transaction.commit()
			return ''
		}
	},
	async updateGrade(param) {
		const { _id, name, icon, desc, courseId, teacherId, studentIds } = param
		if (typeof(_id) === 'undefined' || _id.length === 0 ||
			typeof(name) === 'undefined' || name.length === 0 ||
			typeof(icon) === 'undefined' || icon.length === 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-classes').where({
			_id
		}).update({
			name, icon, desc, courseId, teacherId, studentIds
		})
		return result.updated === 1
	}
}
