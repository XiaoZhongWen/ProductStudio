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
	},
	async bindCourse(param) {
		const { orgId, teacherId, studentId, courseId, total, consume } = param
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(teacherId) === 'undefined' || teacherId.length === 0 ||
			typeof(studentId) === 'undefined' || studentId.length === 0 ||
			typeof(courseId) === 'undefined' || courseId.length === 0 || 
			typeof(total) === 'undefined' || total <= 0 || 
			typeof(consume) === 'undefined' || consume < 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-mapping').add({
			orgId,
			teacherId,
			studentId,
			courseId,
			total,
			consume
		})
		const { inserted } = result
		return inserted === 1
	},
	async addPaymentRecord(param) {
		const { orgId, studentId, date, courseId, count, price } = param
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(studentId) === 'undefined' || studentId.length === 0 ||
			typeof(courseId) === 'undefined' || courseId.length === 0 ||
			typeof(date) === 'undefined' ||
			typeof(count) === 'undefined' || count <= 0 ||
			typeof(price) === 'undefined' || price < 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-payment-records').add({
			orgId,
			studentId,
			courseId,
			date,
			count,
			price
		})
		const { inserted } = result
		return inserted === 1
	},
	async fetchEntriesWithStudentNo(studentNo, ordIds) {
		if (typeof(studentNo) === 'undefined' || studentNo.length === 0 ||
			typeof(ordIds) === 'undefined' || ordIds.length === 0) {
			return []
		}
	}
}
