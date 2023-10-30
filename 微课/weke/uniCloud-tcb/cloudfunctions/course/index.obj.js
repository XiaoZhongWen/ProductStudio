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
			return ''
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
		if (inserted === 1) {
			return result.id
		} else {
			return ''
		}
	},
	async addPaymentRecord(param) {
		const { orgId, studentId, date, courseId, count, price, remark } = param
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(studentId) === 'undefined' || studentId.length === 0 ||
			typeof(courseId) === 'undefined' || courseId.length === 0 ||
			typeof(date) === 'undefined' ||
			typeof(count) === 'undefined' || count <= 0 ||
			typeof(price) === 'undefined' || price < 0) {
			return false
		}
		if (typeof(remark) === 'undefined') {
			remark = ''
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-payment-records').add({
			orgId,
			studentId,
			courseId,
			date,
			count,
			price,
			remark
		})
		const { id } = result
		return id
	},
	async removePaymentRecord(id) {
		if (typeof(id) === 'undefined' || id.length === 0) {
			return
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-payment-records').remove({
			_id:id
		})
		return result.deleted === 1
	},
	async fetchLastestPaymentRecord(studentId, courseId) {
		if (typeof(studentId) === 'undefined' || studentId.length === 0 ||
			typeof(courseId) === 'undefined' || courseId.length === 0) {
			return {}
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-payment-records').where({
			studentId,
			courseId,
		}).orderBy("date", "desc").limit(1).get()
		return result.data
	},
	async fetchEntriesWithStudentNo(studentNo, ordIds) {
		if (typeof(studentNo) === 'undefined' || studentNo.length === 0 ||
			typeof(ordIds) === 'undefined' || ordIds.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const dbCmd = db.command
		const result = await db.collection('wk-mapping').where({
			studentId: studentNo,
			orgId: dbCmd.in(ordIds)
		}).get()
		return result.data
	},
	async loadAllEntries(id, studentNo, from = 'wx') {
		const db = uniCloud.database()
		const dbCmd = db.command
		const s = []
		if (from === 'wx') {
			const forCreator = []
			let res = await db.collection("wk-orgs").where({
				creatorId: id,
				type: 0
			}).get()
			if (res.data.length > 0) {
				const orgIds = res.data.map(org => org._id)
				// 1. 获取所有机构相关的实体
				res = await db.collection('wk-mapping').where({
					orgId: dbCmd.in(orgIds)
				}).get()
				if (res.data.length > 0) {
					forCreator.push(...res.data)
				}
			}
			
			const forTeacher = []
			// 2. 获取老师相关的所有实体
			res = await db.collection('wk-mapping').where({
				teacherId: id
			}).get()
			if (res.data.length > 0) {
				forTeacher.push(...res.data)
			}
			
			const forParents = []
			// 3. 获取所有孩子相关的实体
			res = await db.collection('wk-student').where({
				associateIds: id
			}).get()
			if (res.data.length > 0) {
				const students = res.data
				const studentNos = students.map((student) => student.studentNo)
				res = await db.collection('wk-mapping').where({
					studentId: dbCmd.in(studentNos)
				}).get()
				if (res.data.length > 0) {
					const courseIds = res.data.map(entry => entry.courseId)
					res = await db.collection('wk-mapping').where({
						courseId: dbCmd.in(courseIds)
					}).get()
					forParents.push(...res.data)
				}
			}
			s.push(...forCreator, ...forTeacher, ...forParents)
		} else if (from === 'stuNo') {
			const forStudents = []
			res = await db.collection('wk-mapping').where({
				studentId: studentNo
			}).get()
			if (res.data.length > 0) {
				const courseIds = res.data.map(entry => entry.courseId)
				res = await db.collection('wk-mapping').where({
					courseId: dbCmd.in(courseIds)
				}).get()
				forStudents.push(...res.data)
			}
			s.push(...forStudents)
		}
		const entries = []
		s.forEach(entry => {
			const index = entries.findIndex(e => e._id === entry._id)
			if (index === -1) {
				entries.push(entry)
			}
		})
		return entries
	},
	/**
	 * 变更课程老师
	 */
	async changeCourseTeacher(entryId, teacherId) {
		if (typeof(entryId) === 'undefined' || entryId.length === 0 ||
			typeof(teacherId) === 'undefined' || teacherId.length === 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-mapping').where({
			_id: entryId
		}).update({
			teacherId
		})
		return result.updated === 1
	},
	async renewCourse(entryId, count) {
		if (typeof(entryId) === 'undefined' ||
			entryId.length === 0 || 
			count <= 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-mapping').where({
			_id: entryId
		}).update({
			total: count
		})
		return result.updated === 1
	}
}
