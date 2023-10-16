// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
	_before: function () { // 通用预处理器

	},
	async addCourse(param) {
		const {
			name, icon, desc, type, duration
		} = param
		if (typeof(name) === 'undefined' || name.length === 0 ||
			typeof(icon) === 'undefined' || icon.length === 0 ||
			typeof(type) === 'undefined' || ![0, 1, 2, 3].includes(type) ||
			typeof(duration) === 'undefined' || ![30, 35, 40, 45, 50, 60].includes(duration)) {
			return ''
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-courses').add({
			name: name,
			desc: desc,
			icon: icon,
			type: type,
			duration: duration
		})
		const { id, inserted } = result
		return inserted === 1? id: ''
	},
	async fetchCourses(courseIds) {
		if (typeof(courseIds) === 'undefined' || courseIds.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const dbCmd = db.command
		const result = await db.collection('wk-courses').where({
			_id: dbCmd.in(courseIds)
		}).get()
		return result.data
	},
	async updateCourse(param) {
		const {
			_id, name, icon, desc, type, duration
		} = param
		if (typeof(_id) === 'undefined' || _id.length === 0 ||
			typeof(name) === 'undefined' || name.length === 0 ||
			typeof(icon) === 'undefined' || icon.length === 0 ||
			typeof(type) === 'undefined' || ![0, 1, 2, 3].includes(type) ||
			typeof(duration) === 'undefined' || ![30, 35, 40, 45, 50, 60].includes(duration)) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-courses').where({
			_id: _id
		}).update({
			name: name,
			desc: desc,
			icon: icon,
			type: type,
			duration: duration
		})
		return result.updated === 1
	},
	async removeCourse(courseId) {
		if (typeof(courseId) === 'undefined' || courseId.length === 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-courses').where({
			_id: courseId
		}).remove()
		return result.deleted === 1
	}
}
