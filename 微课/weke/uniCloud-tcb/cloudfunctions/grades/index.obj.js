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
	async addGrade(name, icon, desc) {
		if (typeof(name) === 'undefined' || name.length === 0 ||
			typeof(icon) === 'undefined' || icon.length === 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-classes').add({
			name, icon, desc
		})
		const { inserted } = result
		if (inserted === 1) {
			return result.id
		} else {
			return ''
		}
	},
	async addStudents(id, studentIds) {
		if (typeof(id) === 'undefined' || id.length === 0 ||
			typeof(studentIds) === 'undefined' || studentIds.length === 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-classes').where({
			_id: id
		}).update({
			studentIds
		})
		return res.updated === 1
	}
}
