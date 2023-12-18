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
			repeatDays, 
			repeatDates,
			endRepeatDate,
			courseContent, 
			previewContent,
			consume
		} = param
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(courseId) === 'undefined' || courseId.length === 0 ||
			typeof(teacherId) === 'undefined' || teacherId.length === 0 ||
			typeof(gradients) === 'undefined' || gradients.length === 0 ||
			typeof(date) === 'undefined' || 
			typeof(startTime) === 'undefined' ||
			typeof(endTime) === 'undefined' ||
			typeof(consume) === 'undefined') {
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
		if ((typeof(repeatDays) === 'undefined')) {
			repeatDays = []
		}
		if ((typeof(repeatDates) === 'undefined')) {
			repeatDates = []
		}
		if ((typeof(endRepeatDate) === 'undefined')) {
			endRepeatDate = ''
		}
		if ((typeof(courseContent) === 'undefined')) {
			courseContent = ''
		}
		if ((typeof(previewContent) === 'undefined')) {
			previewContent = ''
		}
		
		const start = new Date(startTime)
		const end = new Date(endTime)
		
		const db = uniCloud.database()
		const ranges = []
		let daysOfWeek = []
		if (repeatType === 0) {
			// 无
			ranges.push({startTime, endTime})
		} else if (repeatType === 1) {
			// 每天
			daysOfWeek = [0, 1, 2, 3, 4, 5, 6]
		} else if (repeatType === 2) {
			// 每周
			const cur = new Date()
			daysOfWeek = [cur.getDay()]
		} else if (repeatType === 3) {
			// 自定义
			daysOfWeek = repeatDays
		} else if (repeatType === 4) {
			// 自选
			repeatDates.forEach(rd => {
				const s = new Date(rd)
				s.setHours(start.getHours())
				s.setMinutes(start.getMinutes())
				const e = new Date(rd)
				e.setHours(end.getHours())
				e.setMinutes(end.getMinutes())
				ranges.push({
					startTime: s.getTime(),
					endTime: e.getTime()
				})
			})
		}
		
		if (daysOfWeek.length > 0) {
			let from = new Date(start)
			from.setHours(0, 0, 0, 0)
			const to = new Date(endRepeatDate)
			to.setHours(23, 59, 59, 999)
			while (from <= to) {
			    const currentDayOfWeek = from.getDay(); // 获取当前日期的星期几（0 表示星期日，1 表示星期一，以此类推）
			    // 检查当前日期是否在指定的排课日期内
			    if (daysOfWeek.includes(currentDayOfWeek)) {
					const s = new Date(from)
					s.setHours(start.getHours())
					s.setMinutes(start.getMinutes())
					const e = new Date(from)
					e.setHours(end.getHours())
					e.setMinutes(end.getMinutes())
					ranges.push({
						startTime: s.getTime(),
						endTime: e.getTime()
					})
			    }
			    // 将日期增加一天
			    from.setDate(from.getDate() + 1);
			}
		}
		
		const transaction = await db.startTransaction()
		try {
			const items = []
			for (let r of ranges) {
				const cDate = new Date(r.startTime)
				const year = courseDate.getFullYear()
				const month = String(courseDate.getMonth() + 1).padStart(2, '0')
				const day = String(courseDate.getDate()).padStart(2, '0')
				const courseDate = year + '-' + month + '-' + day
				const res = await db.collection('wk-schedules').add({
					date,
					courseDate,
					orgId, 
					studentId, 
					classId, 
					presentIds, 
					courseId, 
					teacherId, 
					gradients, 
					startTime: r.startTime, 
					endTime: r.endTime,
					remind,
					courseContent, 
					previewContent,
					consume,
					status: 0
				})
				const { id, inserted } = res
				items.push({id, startTime: r.startTime, endTime: r.endTime, courseDate})
			}
			return items
		} catch(e) {
			await transaction.commit()
			return []
		}
	},
	async fetchSchedules(param) {
		const { date, roles, orgIds, ids } = param
		if (typeof(date) === 'undefined' || date.length === 0 ||
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
				courseDate: date,
				orgId: dbCmd.in(orgIds)
			}).get()
			schedules.push(...r1.data)
			if (roles.includes(2) && ids.length > 0) {
				const r2 = await db.collection('wk-schedules').where({
					courseDate: date,
					teacherId: dbCmd.in(ids)
				}).get()
				r2.data.forEach(r => {
					const index = schedules.findIndex(s => s._id === r._id)
					if (index === -1) {
						schedules.push(r)
					}
				})
			}
		} else {
			const result = await db.collection('wk-schedules').where({
				courseDate: date,
				studentId: dbCmd.in(ids)
			}).get()
			schedules = result.data
		}
		return schedules
	},
	async fetchSchedulesDate(param) {
		const { from, to, roles, orgIds, ids } = param
		if (typeof(from) === 'undefined' ||
			typeof(to) === 'undefined' ||
			from > to ||
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
		
		let scheduleDates = []
		const db = uniCloud.database()
		const dbCmd = db.command
		
		if (roles.includes(1)) {
			const r1 = await db.collection('wk-schedules').where({
				startTime: dbCmd.gte(from),
				endTime: dbCmd.lte(to),
				orgId: dbCmd.in(orgIds),
				status: 0
			}).field({ 'courseDate': true }).get()
			r1.data.forEach(r => {
				if (!scheduleDates.includes(r.courseDate)) {
					scheduleDates.push(r.courseDate)
				}
			})
			if (roles.includes(2) && ids.length > 0) {
				const r2 = await db.collection('wk-schedules').where({
					startTime: dbCmd.gte(from),
					endTime: dbCmd.lte(to),
					teacherId: dbCmd.in(ids),
					status: 0
				}).field({ 'courseDate': true }).get()
				r2.data.forEach(r => {
					if (!scheduleDates.includes(r.courseDate)) {
						scheduleDates.push(r.courseDate)
					}
				})
			}
		} else {
			const result = await db.collection('wk-schedules').where({
				startTime: dbCmd.gte(from),
				endTime: dbCmd.lte(to),
				studentId: dbCmd.in(ids),
				status: 0
			}).field({ 'courseDate': true }).get()
			scheduleDates = result.data.map(item => item.courseDate)
		}
		return scheduleDates
	}
}
