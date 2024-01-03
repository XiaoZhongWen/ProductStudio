// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
	_before: function () { // 通用预处理器

	},
	async addCourse(param) {
		const {
			orgId, name, icon, desc, type, duration
		} = param
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(name) === 'undefined' || name.length === 0 ||
			typeof(icon) === 'undefined' || icon.length === 0 ||
			typeof(type) === 'undefined' || ![0, 1, 2, 3].includes(type)) {
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
		let updated = false
		if (inserted === 1) {
			const dbCmd = db.command
			const data = await db.collection('wk-orgs').where({
				_id: orgId
			}).update({
				courseIds: dbCmd.push([id])
			})
			updated = data.updated === 1
		}
		return updated? id: ''
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
	async removeCourse(courseId, orgId) {
		if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
			typeof(orgId) === 'undefined' || orgId.length === 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-courses').where({
			_id: courseId
		}).remove()
		let updated = false
		if (result.deleted === 1) {
			const res = await db.collection('wk-orgs').where({
				_id: orgId
			}).get()
			const orgs = res.data
			if (orgs.length === 1) {
				const org = orgs[0]
				const index = org.courseIds.findIndex(cId => cId === courseId)
				if (index !== -1) {
					org.courseIds.splice(index, 1)
					const data = await db.collection('wk-orgs').where({
						_id: orgId
					}).update({
						courseIds: org.courseIds
					})
					updated = data.updated === 1
				}
			}
		}
		return updated
	},
	async bindCourse(param) {
		const { orgId, teacherId, studentId, studentNo, courseId, total, consume, operatorId, date, price } = param
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(teacherId) === 'undefined' || teacherId.length === 0 ||
			typeof(studentId) === 'undefined' || studentId.length === 0 ||
			typeof(studentNo) === 'undefined' || studentNo.length === 0 ||
			typeof(courseId) === 'undefined' || courseId.length === 0 || 
			typeof(operatorId) === 'undefined' || operatorId.length === 0 ||
			typeof(total) === 'undefined' || total <= 0 || 
			typeof(consume) === 'undefined' || consume < 0 ||
			typeof(date) === 'undefined' || typeof(price) === 'undefined') {
			return ''
		}
		const db = uniCloud.database()
		const result_mapping = await db.collection('wk-mapping').add({
			orgId,
			teacherId,
			studentId: studentNo,
			courseId,
			total,
			consume,
			status: 0,
			modifyDate: Date.now(),
			operatorId
		})
		const { inserted } = result_mapping
		const entryId = result_mapping.id
		if (inserted === 1) {
			const result_payment = await db.collection('wk-payment-records').add({
				orgId,
				studentId,
				courseId,
				date,
				count:total,
				price,
				operatorId,
				modifyDate: Date.now(),
				status: 0,
				isFrozen: false
			})
			const paymentId = result_payment.id
			let courseRecordId = ''
			if (consume > 0) {
				const result_course = await db.collection('wk-schedules').add({
					courseId, teacherId, studentId, 
					startTime: date,
					endTime: date,
					consume,
					status: 1,
					modifyDate: Date.now(),
					operatorId
				})
				courseRecordId = result_course.id
			}
			return {
				entryId,
				paymentId,
				courseRecordId
			}
		} else {
			return {
				entryId: '',
				paymentId: '',
				courseRecordId: ''
			}
		}
	},
	async addPaymentRecord(param) {
		const { orgId, studentId, date, courseId, count, price, operatorId, entryId, delta } = param
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(studentId) === 'undefined' || studentId.length === 0 ||
			typeof(operatorId) === 'undefined' || operatorId.length === 0 ||
			typeof(courseId) === 'undefined' || courseId.length === 0 ||
			typeof(entryId) === 'undefined' || entryId.length === 0 ||
			typeof(date) === 'undefined' ||
			typeof(count) === 'undefined' || count <= 0 ||
			typeof(price) === 'undefined' || price < 0 ||
			typeof(delta) === 'undefined' || delta < 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-payment-records').add({
			orgId,
			studentId,
			courseId,
			date,
			count,
			price,
			operatorId,
			modifyDate: Date.now(),
			status: 0,
			isFrozen: false
		})
		const { id, inserted } = result
		if (inserted === 1) {
			const dbCmd = db.command
			const data = await db.collection('wk-mapping').where({
				_id: entryId
			}).update({
				total: dbCmd.inc(delta),
				status: 0,
				date: Date.now(),
				operatorId
			})
		}
		return id
	},
	async revokePaymentRecord(id, operatorId, entryId, delta) {
		if (typeof(id) === 'undefined' || id.length === 0 ||
			typeof(operatorId) === 'undefined' || operatorId.length === 0 ||
			typeof(entryId) === 'undefined' || entryId.length === 0 ||
			typeof(delta) === 'undefined') {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-payment-records').where({
			_id: id
		}).update({
			operatorId,
			modifyDate: Date.now(),
			status: 2
		})
		if (result.updated === 1) {
			const dbCmd = db.command
			await db.collection('wk-mapping').where({
				_id: entryId
			}).update({
				total: dbCmd.inc(-delta)
			})
		}
		return result.updated === 1
	},
	async revokeAllPaymentRecords(orgId, studentId, courseId, operatorId, entryId, delta) {
		if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
			typeof(studentId) === 'undefined' || studentId.length === 0 ||
			typeof(courseId) === 'undefined' || courseId.length === 0 ||
			typeof(operatorId) === 'undefined' || operatorId.length === 0 ||
			typeof(entryId) === 'undefined' || entryId.length === 0 ||
			typeof(delta) === 'undefined') {
			return false
		}
		const date = Date.now()
		const db = uniCloud.database()
		const result = await db.collection('wk-payment-records').add({
			orgId,
			studentId,
			courseId,
			date: date,
			count: delta,
			price: 0,
			operatorId,
			modifyDate: date,
			status: 3
		})
		const dbCmd = db.command
		await db.collection('wk-payment-records').where({
			orgId,
			studentId,
			courseId,
			modifyDate: dbCmd.lt(date)
		}).update({
			isFrozen: true
		})
		const { id, inserted } = result
		if (inserted === 1) {
			await db.collection('wk-mapping').where({
				_id: entryId
			}).update({
				total: dbCmd.inc(-delta),
				status: 2
			})
		}
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
	async modifyPaymentRecord(param) {
		const { _id, date, count, price, remark, operatorId, entryId, delta } = param
		if (typeof(_id) === 'undefined' ||
			_id.length === 0 || 
			typeof(operatorId) === 'undefined' ||
			operatorId.length === 0 || 
			typeof(date) === 'undefined' ||
			typeof(count) === 'undefined' ||
			typeof(price) === 'undefined') {
			return false
		}
		if (delta !== 0 && (typeof(entryId) === 'undefined' || entryId.length === 0)) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-payment-records').where({
			_id: _id
		}).update({
			date,
			count,
			price,
			remark,
			operatorId,
			modifyDate: Date.now(),
			status: 1
		})
		if (result.updated === 1) {
			const dbCmd = db.command
			await db.collection('wk-mapping').where({
				_id: entryId
			}).update({
				total: dbCmd.inc(-delta)
			})
		}
		return result.updated === 1
	},
	async fetchPaymentRecords(courseId, studentId) {
		if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
			typeof(studentId) === 'undefined' || studentId.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-payment-records').where({
			studentId,
			courseId
		}).orderBy("date", "desc").get()
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
				creatorId: id
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
	async finishCourse(entryId, operatorId) {
		if (typeof(entryId) === 'undefined' || entryId.length === 0 ||
			typeof(operatorId) === 'undefined' || operatorId.length === 0) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-mapping').where({
			_id: entryId
		}).update({
			status: 1,
			date: Date.now(),
			operator: operatorId
		})
		return result.updated === 1
	},
	async fetchCourseConsumeRecords(courseId, studentId) {
		if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
			typeof(studentId) === 'undefined' || studentId.length === 0) {
			return []
		}
		const db = uniCloud.database()
		const dbCmd = db.command
		const result = await db.collection('wk-schedules').where(dbCmd.or({
			status: dbCmd.in([1, 3, 4]),
			courseId,
			studentId
		}, {
			status: dbCmd.in([1, 3, 4]),
			courseId,
			presentIds: studentId
		})).get()
		return result.data
	},
	async modifyCourseConsumeRecord(param) {
		const { 
			_id, 
			startTime, 
			endTime, 
			count, 
			content, 
			assignment, 
			feedback, 
			operatorId, 
			entryId, 
			delta } = param
		if (typeof(_id) === 'undefined' ||
			_id.length === 0 ||
			typeof(operatorId) === 'undefined' ||
			operatorId.length === 0 ||
			typeof(startTime) === 'undefined' || 
			typeof(endTime) === 'undefined' ||
			typeof(count) === 'undefined') {
			return false
		}
		if (delta !== 0 && (typeof(entryId) === 'undefined' || entryId.length === 0)) {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-schedules').where({
			_id
		}).update({
			startTime,
			endTime,
			consume: count,
			courseContent: content,
			assignment,
			feedback,
			operatorId,
			modifyDate: Date.now(),
			status: 3
		})
		if (result.updated === 1 && delta !== 0) {
			const dbCmd = db.command
			await db.collection('wk-mapping').where({
				_id: entryId
			}).update({
				consume: dbCmd.inc(-delta)
			})
		}
		return result.updated === 1
	},
	async revokeCourseConsumeRecord(_id, operatorId, entryId, delta) {
		if (typeof(_id) === 'undefined' || _id.length === 0 ||
			typeof(operatorId) === 'undefined' || operatorId.length === 0 ||
			typeof(entryId) === 'undefined' || entryId.length === 0 ||
			typeof(delta) === 'undefined') {
			return false
		}
		const db = uniCloud.database()
		const result = await db.collection('wk-schedules').where({
			_id
		}).update({
			operatorId,
			modifyDate: Date.now(),
			status: 2
		})
		if (result.updated === 1) {
			const dbCmd = db.command
			await db.collection('wk-mapping').where({
				_id: entryId
			}).update({
				consume: dbCmd.inc(-delta)
			})
		}
		return result.updated === 1
	}
}
