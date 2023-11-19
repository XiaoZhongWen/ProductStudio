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
	async addGrade(param) {
		const { name, icon, desc } = param
		if (typeof(name) === 'undefined' || name.length === 0 ||
			typeof(icon) === 'undefined' || icon.length === 0) {
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
		const result = await db.collection('wk-classes').add({
			name, icon, desc, courseId, teacherId, studentIds
		})
		const { inserted } = result
		if (inserted === 1) {
			return result.id
		} else {
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
