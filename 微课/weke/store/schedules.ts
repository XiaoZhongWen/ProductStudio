import { defineStore } from 'pinia'
import { Schedule } from '../types/schedule'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from "@/store/orgs"

const schedules_co = uniCloud.importObject('schedules', {
	customUI: true
})

type Range = {
	from: number,
	to: number
}

export const useScheduleStore = defineStore('schedules', {
	state: () => {
		return {
			didLoadRanges: [] as Range[],
			scheduleDates: [] as Number[],
			schedules: [] as Schedule[]
		}
	},
	
	actions: {
		async createSchedule(param: {
			date: number,
			orgId: string,
			studentId: string,
			classId: string,
			presentIds: string[],
			courseId: string,
			teacherId: string,
			gradients: string[],
			startTime: number,
			endTime: number,
			remind: boolean,
			repeatType: number,
			repeatDays: number[],
			repeatDates: string[],
			endRepeatDate: string,
			courseContent: string,
			previewContent: string,
			consume: number
		}) {
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
				return false
			}
			if ( (typeof(studentId) === 'undefined' || studentId.length === 0) &&
				 ((typeof(classId) === 'undefined' || classId.length === 0) ||
				 (typeof(presentIds) === 'undefined' || presentIds.length === 0)) ) {
				return false
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
			
			let result = true
			const items = await schedules_co.createSchedule({
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
			}) as {id:string, startTime: number, endTime: number, courseDate: string}[]
			if (typeof(items) !== 'undefined' &&
				items.length > 0) {
				items.forEach(item => {
					const schedule: Schedule = {
						_id: item.id,
						date, 
						courseDate: item.courseDate,
						orgId, 
						studentId, 
						classId, 
						presentIds, 
						courseId, 
						teacherId,
						gradients,
						startTime: item.startTime,
						endTime: item.endTime,
						remind,
						courseContent,
						previewContent,
						consume,
						status: 0
					}
					this.schedules.push(schedule)
				})
			} else {
				result = false
			}
			return result
		},
		async fetchSchedules(date: string) {
			if (typeof(date) === 'undefined' || date.length === 0) {
				return []
			}
			let result = []
			result = this.schedules.filter(s => s.courseDate === date)
			if (result.length === 0) {
				const userStore = useUsersStore()
				const orgStore = useOrgsStore()
				const userId = userStore.owner._id
				const roles = userStore.owner.roles
				const type = userStore.owner.from
				if (type === 'stuNo') {
					// 学生
					const res = await schedules_co.fetchSchedules({
						date, 
						roles: [],
						ids: [userId]
					}) as Schedule[]
					result.push(...res)
				} else if (type === 'wx') {
					if (roles?.includes(3) && roles.length === 1) {
						// 家长
						const children = userStore.students.filter(s => s.associateIds?.includes(userId))
						if (children.length > 0) {
							const res = await schedules_co.fetchSchedules({
								date, roles,
								ids: children.map(s => s._id)
							})
							result.push(...res)
						}
					} else {
						const orgs = orgStore.orgs.filter(org => org.creatorId === userId)
						// 管理员|老师
						const res = await schedules_co.fetchSchedules({
							date, roles,
							orgIds: orgs.map(o => o._id),
							ids: [userId]
						}) as Schedule[]
						result.push(...res)
					}
				}
				result.forEach(r => {
					const index = this.schedules.findIndex(s => s._id === r._id)
					if (index === -1) {
						this.schedules.push(r)
					}
				})
			}
			return result
		},
		async fetchSchedulesDate(from: number, to:number) {
			const index = this.didLoadRanges.findIndex(r => r.from === from && r.to === to)
			if (index !== -1) {
				return this.scheduleDates.filter(s => s >= from && s <= to)
			} else {
				const userStore = useUsersStore()
				const orgStore = useOrgsStore()
				const userId = userStore.owner._id
				const roles = userStore.owner.roles
				const type = userStore.owner.from
				
				const result = []
				if (type === 'stuNo') {
					// 学生
					const res = await schedules_co.fetchSchedulesDate({
						from, to, 
						roles: [],
						ids: [userId]
					}) as Schedule[]
					result.push(...res)
				} else if (type === 'wx') {
					if (roles?.includes(3) && roles.length === 1) {
						// 家长
						const children = userStore.students.filter(s => s.associateIds?.includes(userId))
						if (children.length > 0) {
							const res = await schedules_co.fetchSchedulesDate({
								from, to, roles,
								ids: children.map(s => s._id)
							})
							result.push(...res)
						}
					} else {
						const orgs = orgStore.orgs.filter(org => org.creatorId === userId)
						// 管理员|老师
						const res = await schedules_co.fetchSchedulesDate({
							from, to, roles,
							orgIds: orgs.map(o => o._id),
							ids: [userId]
						}) as Schedule[]
						result.push(...res)
					}
				}
				this.scheduleDates.push(...result)
				if (result.length > 0) {
					this.didLoadRanges.push({
						from, to
					})
				}
				return result
			}
		}
	}
})