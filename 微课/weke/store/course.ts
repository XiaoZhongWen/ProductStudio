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
		}
	}
})