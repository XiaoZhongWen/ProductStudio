import { defineStore } from 'pinia'
import { Course, CourseConsumeRecord } from '@/types/course'
import { PaymentRecord } from '../types/PaymentRecord'
import { useUsersStore } from "@/store/users"

const course_co = uniCloud.importObject('course', {
	customUI: true
})

export const useCourseStore = defineStore('course', {
	state: () => {
		return {
			course:[] as Course[],
			paymentRecords:[] as PaymentRecord[],
			courseConsumeRecords: [] as CourseConsumeRecord[]
		}
	},
	getters: {
		
	},
	actions: {
		async addCourse(
			param:{
				name:string, 
				icon:string, 
				desc?:string, 
				type:number, 
				duration:number
		}) {
			const {
				name, icon, type, duration, desc
			} = param
			if (typeof(name) === 'undefined' || name.length === 0 || 
				typeof(icon) === 'undefined' || icon.length === 0 ||
				typeof(type) === 'undefined' || ![0, 1, 2, 3].includes(type)) {
				return ''
			}
			const result = await course_co.addCourse(param)
			if (typeof(result) !== 'undefined' && result.length > 0) {
				this.course.push({
					_id:result,
					name: name,
					desc: desc ?? '',
					icon: icon,
					type: type,
					duration: duration
				})
			}
			return result
		},
		async fetchCourses(ids:string[]) {
			if (typeof(ids) === 'undefined' || ids.length === 0) {
				return []
			}
			const g1 = this.course.filter(course => ids.includes(course._id))
			const ids1 = g1.map(course => course._id)
			const ids2 = ids.filter(id => !ids1.includes(id))
			let other = [] as Course[]
			if (ids2.length > 0) {
				other = await course_co.fetchCourses(ids2) as Course[]
				this.course.push(...other)
			}
			return [...g1, ...other]
		},
		async updateCourse(
			param:{
				_id: string,
				name:string, 
				icon:string, 
				desc?:string, 
				type:number, 
				duration:number
		}) {
			const {
				_id, name, icon, type, duration
			} = param
			if (typeof(_id) === 'undefined' || _id.length === 0 ||
				typeof(name) === 'undefined' || name.length === 0 ||
				typeof(icon) === 'undefined' || icon.length === 0 ||
				typeof(type) === 'undefined' || ![0, 1, 2, 3].includes(type) ||
				typeof(duration) === 'undefined' || ![30, 35, 40, 45, 50, 60].includes(duration)) {
				return false
			}
			const result = await course_co.updateCourse(param)
			return result
		},
		async removeCourse(courseId:string) {
			if (typeof(courseId) === 'undefined' || courseId.length === 0) {
				return false
			}
			const result = await course_co.removeCourse(courseId)
			if (result) {
				const index = this.course.findIndex(course => course._id === courseId)
				if (index !== -1) {
					this.course.splice(index, 1)
				}
			}
			return result
		},
		async bindCourse(param:{
			orgId: string,
			teacherId: string,
			studentId: string,
			courseId: string,
			total: number,
			consume: number,
			info: {status:number, date:number, operator:string}
		}) {
			const { orgId, teacherId, studentId, courseId, total, consume, info } = param
			if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(teacherId) === 'undefined' || teacherId.length === 0 ||
				typeof(studentId) === 'undefined' || studentId.length === 0 ||
				typeof(courseId) === 'undefined' || courseId.length === 0 || 
				typeof(total) === 'undefined' || total <= 0 || 
				typeof(consume) === 'undefined' || consume < 0 ||
				typeof(info) === 'undefined') {
				return ''
			}
			const entryId = await course_co.bindCourse(param)
			return entryId
		},
		async addPaymentRecord(param: {
			orgId: string,
			studentId: string,
			date: number,
			courseId: string,
			count: number,
			price: number,
			remark: string
		}) {
			const { orgId, studentId, date, courseId, count, price } = param
			if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(studentId) === 'undefined' || studentId.length === 0 ||
				typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(date) === 'undefined' ||
				typeof(count) === 'undefined' || count <= 0 ||
				typeof(price) === 'undefined' || price < 0) {
				return false
			}
			const usersStore = useUsersStore()
			const id = await course_co.addPaymentRecord({
				orgId, studentId, date, courseId, count, price, 
				operatorId: usersStore.owner._id
			})
			if (typeof(id) !== 'undefined' && id.length > 0) {
				const index = this.paymentRecords.findIndex(r => r._id === id)
				if (index === -1) {
					const r:PaymentRecord = {
						_id: id,
						orgId,
						studentId,
						date,
						courseId,
						count,
						price,
						operatorId: usersStore.owner._id,
						modifyDate: Date.now(),
						status: 0
					}
					this.paymentRecords.push(r)
				}
			}
			return id
		},
		async revokePaymentRecord(id:string) {
			if (typeof(id) === 'undefined' || id.length === 0) {
				return false
			}
			const usersStore = useUsersStore()
			const res = await course_co.revokePaymentRecord(id, usersStore.owner._id)
			if (res) {
				this.paymentRecords.forEach(r => {
					if (r._id === id) {
						r.operatorId = usersStore.owner._id
						r.modifyDate = Date.now()
						r.status = 2
					}
				})
			}
			return res
		},
		async revokeAllPaymentRecords(param: {
			orgId: string,
			studentId: string,
			courseId: string
		}) {
			const { orgId, studentId, courseId } = param
			if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(studentId) === 'undefined' || studentId.length === 0 ||
				typeof(courseId) === 'undefined' || courseId.length === 0) {
				return false
			}
			const usersStore = useUsersStore()
			const res = await course_co.revokeAllPaymentRecords(orgId, studentId, courseId, usersStore.owner._id)
			if (res) {
				this.paymentRecords.forEach(r => {
					if (r.orgId === orgId &&
						r.studentId === studentId &&
						r.courseId === courseId) {
						r.operatorId = usersStore.owner._id
						r.modifyDate = Date.now()
						r.status = 2
					}
				})
			}
			return res
		},
		async removePaymentRecord(id:string) {
			if (typeof(id) === 'undefined' || id.length === 0) {
				return
			}
			
		},
		async modifyPaymentRecord(param:{
				_id:string, 
				date:number,
				count: number,
				price: number,
				remark: string
		}) {
			const { _id, date, count, price } = param
			if (typeof(_id) === 'undefined' || 
				_id.length === 0 || 
				typeof(date) === 'undefined' ||
				typeof(count) === 'undefined' ||
				typeof(price) === 'undefined') {
				return false
			}
			let { remark } = param
			if (typeof(remark) === 'undefined') {
				remark = ""
			}
			const usersStore = useUsersStore()
			const result = await course_co.modifyPaymentRecord({
				_id, date, count, price, remark,
				operatorId: usersStore.owner._id
			})
			if (result) {
				const records = this.paymentRecords.filter(r => r._id === _id)
				if (records.length > 0) {
					const r = records[0]
					r.date = date
					r.count = count
					r.price = price
					r.remark = remark
					r.operatorId = usersStore.owner._id
					r.modifyDate = Date.now()
					r.status = 1
				}
			}
			return result
		},
		async changeCourseTeacher(entryId:string, teacherId: string) {
			if (typeof(entryId) === 'undefined' || entryId.length === 0 ||
				typeof(teacherId) === 'undefined' || teacherId.length === 0) {
				return false
			}
			const result = await course_co.changeCourseTeacher(entryId, teacherId)
			return result
		},
		async fetchPaymentRecords(courseId:string, studentNo:string) {
			if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(studentNo) === 'undefined' || studentNo.length === 0) {
				return []
			}
			let records = this.paymentRecords.filter(r => r.courseId === courseId && r.studentId === studentNo)
			if (records.length === 0) {
				records = await course_co.fetchPaymentRecords(courseId, studentNo)
				if (records.length > 0) {
					const res = this.paymentRecords.filter(r => r.courseId === courseId && r.studentId === studentNo)
					if (res.length === 0) {
						this.paymentRecords.push(...records)
					}
				}
			}
			return records.sort((r1, r2) => {
					return r2.date - r1.date
				})
		},
		async renewCourse(entryId:string, count:number, operator:string) {
			if (typeof(entryId) === 'undefined' || 
				entryId.length === 0 || 
				typeof(operator) === 'undefined' ||
				operator.length === 0 ||
				count <= 0) {
				return false
			}
			const res = await course_co.renewCourse(entryId, count, operator)
			return res
		},
		async finishCourse(entryId: string, operatorId:string) {
			if (typeof(entryId) === 'undefined' || entryId.length === 0 ||
				typeof(operatorId) === 'undefined' || operatorId.length === 0) {
				return false
			}
			const res = await course_co.finishCourse(entryId, operatorId)
			return res
		},
		async revokeCourse(entryId: string, operatorId:string, total:number) {
			if (typeof(entryId) === 'undefined' || entryId.length === 0 ||
				typeof(operatorId) === 'undefined' || operatorId.length === 0) {
				return false
			}
			const res = await course_co.revokeCourse(entryId, operatorId, total)
			if (res) {
				const usersStore = useUsersStore()
				const entries = usersStore.entries.filter(entry => entry._id === entryId)
				if (entries.length > 0) {
					const entry = entries[0]
					entry.total = total
				}
			}
			return res
		},
		async modifyCourseCount(entryId: string, total:number, consume:number) {
			if (typeof(entryId) === 'undefined' || entryId.length === 0 ||
				typeof(total) === 'undefined' || typeof(consume) === 'undefined') {
				return false
			}
			const res = await course_co.modifyCourseCount(entryId, total, consume)
			return res
		},
		async fetchCourseConsumeRecords(courseId: string, studentId: string) {
			if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(studentId) === 'undefined' || studentId.length === 0) {
				return []
			}
			const records = this.courseConsumeRecords.filter(r => r.courseId === courseId && r.studentId === studentId)
			if (records.length === 0) {
				const res:CourseConsumeRecord[] = await course_co.fetchCourseConsumeRecords(courseId, studentId)
				if (res.length > 0) {
					this.courseConsumeRecords.push(...res)
				}
				return res.sort((r1, r2) => {
					return r2.startTime - r1.startTime
				})
			} else {
				return records.sort((r1, r2) => {
					return r2.startTime - r1.startTime
				})
			}
		},
		async modifyCourseConsumeRecord(
			param:{
				_id:string, 
				startTime:number,
				endTime: number,
				count: number,
				content: string,
				assignment: string,
				feedback: string
		}) {
			const { _id, startTime, endTime, count } = param
			if (typeof(_id) === 'undefined' || 
				_id.length === 0 ||
				typeof(startTime) === 'undefined' || 
				typeof(endTime) === 'undefined' ||
				typeof(count) === 'undefined') {
				return false
			}
			let { content, assignment, feedback } = param
			if (typeof(content) === 'undefined') {
				content = ''
			}
			if (typeof(assignment) === 'undefined') {
				assignment = ''
			}
			if (typeof(feedback) === 'undefined') {
				feedback = ''
			}
			const usersStore = useUsersStore()
			const result = await course_co.modifyCourseConsumeRecord({
				_id, startTime, endTime, count, content, assignment, feedback,
				operatorId: usersStore.owner._id
			})
			if (result) {
				const records = this.courseConsumeRecords.filter(r => r._id === _id)
				if (records.length > 0) {
					const r = records[0]
					r.startTime = startTime
					r.endTime = endTime
					r.count = count
					r.content = content
					r.assignment = assignment
					r.feedback = feedback
					r.operatorId = usersStore.owner._id
					r.modifyDate = Date.now()
					r.status = 1
				}
			}
			return result
		},
		async revokeCourseConsumeRecord(_id:string) {
			if (typeof(_id) === 'undefined' || _id.length === 0) {
				return false
			}
			const usersStore = useUsersStore()
			const result = await course_co.revokeCourseConsumeRecord(_id, usersStore.owner._id)
			if (result) {
				const records = this.courseConsumeRecords.filter(r => r._id === _id)
				if (records.length > 0) {
					const r = records[0]
					r.operatorId = usersStore.owner._id
					r.modifyDate = Date.now()
					r.status = 2
				}
			}
			return result
		}
	}
})