import { defineStore } from 'pinia'
import { Course } from '@/types/course'
import { PaymentRecord } from '../types/PaymentRecord'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from "@/store/orgs"
import { Schedule } from '../types/schedule'

const course_co = uniCloud.importObject('course', {
	customUI: true
})

export const useCourseStore = defineStore('course', {
	state: () => {
		return {
			courses:[] as Course[],
			paymentRecords:[] as PaymentRecord[],
			courseConsumeRecords: [] as Schedule[]
		}
	},
	getters: {
		
	},
	actions: {
		async addCourse(
			param:{
				orgId:string,
				name:string, 
				icon:string, 
				desc?:string, 
				type:number, 
				duration:number
		}) {
			const {
				orgId, name, icon, type, duration, desc
			} = param
			if (typeof(orgId) === 'undefined' || orgId.length === 0 || 
				typeof(name) === 'undefined' || name.length === 0 || 
				typeof(icon) === 'undefined' || icon.length === 0 ||
				typeof(type) === 'undefined' || ![0, 1, 2, 3].includes(type)) {
				return ''
			}
			const courseId = await course_co.addCourse(param)
			if (typeof(courseId) !== 'undefined' && courseId.length > 0) {
				this.courses.push({
					_id: courseId,
					name: name,
					desc: desc ?? '',
					icon: icon,
					type: type,
					duration: duration
				})
				
				const orgStore = useOrgsStore()
				let result = orgStore.orgs.filter(org => org._id === orgId)
				if (result.length === 0 && orgStore.anonymousOrg._id === orgId) {
					result = [orgStore.anonymousOrg]
				}
				if (result.length > 0) {
					const org = result[0]
					org.courseIds?.push(courseId)
				}
			}
			return courseId
		},
		async fetchCourses(ids:string[]) {
			if (typeof(ids) === 'undefined' || ids.length === 0) {
				return []
			}
			const courseIds = this.courses.map(c => c._id)
			const ids1 = ids.filter(id => !courseIds.includes(id))
			let other = [] as Course[]
			if (ids1.length > 0) {
				other = await course_co.fetchCourses(ids1) as Course[]
				other.forEach(o => {
					if (!courseIds.includes(o._id)) {
						this.courses.push(o)
					}
				})
			}
			return this.courses.filter(course => ids.includes(course._id))
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
				type !== 2 && (typeof(duration) === 'undefined' || ![30, 35, 40, 45, 50, 60].includes(duration))) {
				return false
			}
			const result = await course_co.updateCourse(param)
			return result
		},
		async removeCourse(courseId:string, orgId:string) {
			if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(orgId) === 'undefined' || orgId.length === 0) {
				return false
			}
			const result = await course_co.removeCourse(courseId, orgId)
			if (result) {
				const index = this.courses.findIndex(course => course._id === courseId)
				if (index !== -1) {
					this.courses.splice(index, 1)
					
					const orgStore = useOrgsStore()
					let result = orgStore.orgs.filter(org => org._id === orgId)
					if (result.length === 0 && orgStore.anonymousOrg._id === orgId) {
						result = [orgStore.anonymousOrg]
					}
					if (result.length > 0) {
						const org = result[0]
						const position = org.courseIds?.findIndex(id => id === courseId) ?? -1
						if (position !== -1) {
							org.courseIds?.splice(position, 1)
						}
					}
				}
			}
			return result
		},
		async bindCourse(param:{
			orgId: string,
			teacherId: string,
			studentId: string,
			studentNo: string,
			courseId: string,
			total: number,
			consume: number,
			operatorId:string,
			date: number,
			price: number
		}) {
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
			const result = await course_co.bindCourse(param)
			const { entryId, paymentId, courseRecordId } = result as {
				entryId: string,
				paymentId: string,
				courseRecordId: string
			}
			if (paymentId.length > 0) {
				const payment: PaymentRecord = {
					_id: paymentId,
					orgId,
					studentId,
					date,
					courseId,
					count: total,
					price,
					status: 0,
					operatorId,
					modifyDate: Date.now(),
					isFrozen: false
				}
				this.paymentRecords.push(payment)
			}
			return entryId
		},
		async addPaymentRecord(param: {
			orgId: string,
			studentId: string,
			date: number,
			courseId: string,
			count: number,
			price: number,
			remark: string,
			entryId: string,
			delta: number,
			operatorId: string
		}) {
			const { orgId, studentId, date, courseId, count, price, entryId, delta, operatorId } = param
			if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(studentId) === 'undefined' || studentId.length === 0 ||
				typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(entryId) === 'undefined' || entryId.length === 0 ||
				typeof(operatorId) === 'undefined' || operatorId.length === 0 ||
				typeof(date) === 'undefined' ||
				typeof(count) === 'undefined' || count <= 0 ||
				typeof(price) === 'undefined' || price < 0 ||
				typeof(delta) === 'undefined' || delta < 0) {
				return false
			}
			const id = await course_co.addPaymentRecord({
				orgId, studentId, date, courseId, count, price, 
				operatorId: operatorId, entryId, delta
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
						operatorId: operatorId,
						modifyDate: Date.now(),
						status: 0,
						isFrozen: false
					}
					this.paymentRecords.push(r)
				}
			}
			return id
		},
		async revokePaymentRecord(id:string, entryId:string, delta:number) {
			if (typeof(id) === 'undefined' || id.length === 0 ||
				typeof(entryId) === 'undefined' || entryId.length === 0 ||
				typeof(delta) === 'undefined') {
				return false
			}
			const usersStore = useUsersStore()
			const res = await course_co.revokePaymentRecord(id, usersStore.owner._id, entryId, delta)
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
			courseId: string,
			delta: number,
			operatorId: string,
			entryId: string
		}) {
			const { orgId, studentId, courseId, operatorId, entryId, delta } = param
			if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(studentId) === 'undefined' || studentId.length === 0 ||
				typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(operatorId) === 'undefined' || operatorId.length === 0 ||
				typeof(entryId) === 'undefined' || entryId.length === 0 || 
				typeof(delta) === 'undefined') {
				return false
			}
			const id = await course_co.revokeAllPaymentRecords(orgId, studentId, courseId, operatorId, entryId, delta)
			if (typeof(id) !== 'undefined' && id.length > 0) {
				const date = Date.now()
				const index = this.paymentRecords.findIndex(r => r._id === id)
				if (index === -1) {
					const r:PaymentRecord = {
						_id: id,
						orgId,
						studentId,
						date: date,
						courseId,
						count: delta,
						price: 0,
						operatorId: operatorId,
						modifyDate: date,
						status: 3
					}
					this.paymentRecords.push(r)
					this.paymentRecords.forEach(r => {
						if (r.modifyDate < date) {
							r.isFrozen = true
						}
					})
				}
			}
			return id
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
				remark: string,
				entryId: string,
				delta: number
		}) {
			const { _id, date, count, price, entryId, delta } = param
			if (typeof(_id) === 'undefined' || 
				_id.length === 0 || 
				typeof(date) === 'undefined' ||
				typeof(count) === 'undefined' ||
				typeof(price) === 'undefined') {
				return false
			}
			if (delta !== 0 && (typeof(entryId) === 'undefined' || entryId.length === 0)) {
				return false
			}
			let { remark } = param
			if (typeof(remark) === 'undefined') {
				remark = ""
			}
			const usersStore = useUsersStore()
			const result = await course_co.modifyPaymentRecord({
				_id, date, count, price, remark,
				operatorId: usersStore.owner._id,
				entryId, delta
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
			if (result) {
				const usersStore = useUsersStore()
				const datas = usersStore.entries.filter(entry => entry._id === entryId)
				if (datas.length === 1) {
					const entry = datas[0]
					entry.teacherId = teacherId
				}
			}
			return result
		},
		async fetchPaymentRecords(courseId:string, studentNo:string, before:number) {
			if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(studentNo) === 'undefined' || studentNo.length === 0 ||
				typeof(before) === 'undefined') {
				return []
			}
			let records = await course_co.fetchPaymentRecords(courseId, studentNo, before) as PaymentRecord[]
			records.forEach(r => {
				const index = this.paymentRecords.findIndex(item => item._id === r._id)
				if (index === -1) {
					this.paymentRecords.push(r)
				}
			})
			return records.sort((r1, r2) => {
					return r2.date - r1.date
				})
		},
		async finishCourse(entryId: string, operatorId:string) {
			if (typeof(entryId) === 'undefined' || entryId.length === 0 ||
				typeof(operatorId) === 'undefined' || operatorId.length === 0) {
				return false
			}
			const res = await course_co.finishCourse(entryId, operatorId)
			return res
		}
	}
})