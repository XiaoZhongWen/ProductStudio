// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
	_before: function () { // 通用预处理器

	},
	async createSchedule(param) {
		let {
			date, 
			orgId, 
			studentId, 
			classId, 
			presentIds, 
			courseId, 
			teacherId, 
			gradients, 
			startTime, 
			endTime, 
			remind, 
			repeatType, 
			repeat, 
			courseContent, 
			previewContent 
		} = param
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(courseId) === 'undefined' || courseId.length === 0 ||
			typeof(teacherId) === 'undefined' || teacherId.length === 0 ||
			typeof(gradients) === 'undefined' || gradients.length === 0 ||
			typeof(date) === 'undefined' || 
			typeof(startTime) === 'undefined' ||
			typeof(endTime) === 'undefined') {
			return ''
		}
		if ( (typeof(studentId) === 'undefined' || studentId.length === 0) &&
			 ((typeof(classId) === 'undefined' || classId.length === 0) ||
			 (typeof(presentIds) === 'undefined' || presentIds.length === 0)) ) {
			return ''
		}
		if ((typeof(remind) === 'undefined')) {
			remind = false
		}
		if ((typeof(repeatType) === 'undefined')) {
			repeatType = 0
		}
		if ((typeof(repeat) === 'undefined')) {
			repeat = []
		}
		if ((typeof(courseContent) === 'undefined')) {
			courseContent = ''
		}
		if ((typeof(previewContent) === 'undefined')) {
			previewContent = ''
		}
		
		const db = uniCloud.database()
		const res = await db.collection('wk-schedules').add({
			date,
			orgId, 
			studentId, 
			classId, 
			presentIds, 
			courseId, 
			teacherId, 
			gradients, 
			startTime, 
			endTime, 
			remind, 
			repeatType, 
			repeat, 
			courseContent, 
			previewContent
		})
		const { id, inserted } = res
		return id
	},
	async loadSchedules(param) {
		const { from, to, roles, orgIds, ids } = param
		if (typeof(from) === 'undefined' ||
			typeof(to) === 'undefined' ||
			typeof(roles) === 'undefined') {
			return []
		}
		if (roles.includes(1) && 
			(typeof(orgIds) === 'undefined' || orgIds.length === 0)) {
			return []
		}
		if (!roles.includes(1) && 
			(typeof(ids) === 'undefined' || ids.length === 0)) {
			return []
		}
		
		let schedules = []
		const db = uniCloud.database()
		const dbCmd = db.command
		
		if (roles.includes(1)) {
			const r1 = await db.collection('wk-schedules').where({
				startTime: dbCmd.gte(from),
				endTime: dbCmd.lte(to),
				orgId: dbCmd.in(orgIds)
			})
			schedules.push(...r1.data)
			if (roles.includes(2) && ids.length > 0) {
				const r2 = await db.collection('wk-schedules').where({
					startTime: dbCmd.gte(from),
					endTime: dbCmd.lte(to),
					teacherId: dbCmd.in(ids)
				})
				schedules.push(...r2.data)
			}
		} else {
			const result = await db.collection('wk-schedules').where({
				startTime: dbCmd.gte(from),
				endTime: dbCmd.lte(to),
				studentId: dbCmd.in(ids)
			})
			schedules = result.data
		}
		return schedules
	}
}
