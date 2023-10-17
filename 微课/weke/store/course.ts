import { defineStore } from 'pinia'
import { Course } from '@/types/course'

const course_co = uniCloud.importObject('course', {
	customUI: true
})

export const useCourseStore = defineStore('course', {
	state: () => {
		return {
			course:[] as Course[]
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
				typeof(type) === 'undefined' || ![0, 1, 2, 3].includes(type) ||
				typeof(duration) === 'undefined' || ![30, 35, 40, 45, 50, 60].includes(duration)) {
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
			consume: number
		}) {
			const { orgId, teacherId, studentId, courseId, total, consume } = param
			if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(teacherId) === 'undefined' || teacherId.length === 0 ||
				typeof(studentId) === 'undefined' || studentId.length === 0 ||
				typeof(courseId) === 'undefined' || courseId.length === 0 || 
				typeof(total) === 'undefined' || total <= 0 || 
				typeof(consume) === 'undefined' || consume < 0) {
				return false
			}
			const result = await course_co.bindCourse(param)
			return result
		},
		async addPaymentRecord(param: {
			orgId: string,
			studentId: string,
			date: number,
			courseId: string,
			count: number,
			price: number
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
			const result = await course_co.addPaymentRecord(param)
			return result
		}
	}
})