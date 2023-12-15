import { defineStore } from 'pinia'
import { Schedule } from '../types/schedule'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from "@/store/orgs"
import { timestampForBeginOfMonth, timestampForEndOfMonth } from '@/utils/wk-date'

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
			startTime: string,
			endTime: string,
			startDate: number,
			endDate: number,
			remind: boolean,
			repeatType: number,
			repeat: number[],
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
				startDate,
				endDate,
				remind, 
				repeatType, 
				repeat, 
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
				typeof(startDate) === 'undefined' ||
				typeof(endDate) === 'undefined' ||
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
			if ((typeof(repeat) === 'undefined')) {
				repeat = []
			}
			if ((typeof(courseContent) === 'undefined')) {
				courseContent = ''
			}
			if ((typeof(previewContent) === 'undefined')) {
				previewContent = ''
			}
			
			let result = true
			const scheduleId = await schedules_co.createSchedule({
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
				startDate,
				endDate,
				remind,
				repeatType,
				repeat,
				courseContent,
				previewContent,
				consume
			})
			if (typeof(scheduleId) !== 'undefined' &&
				scheduleId.length > 0) {
				const schedule: Schedule = {
					_id: scheduleId,
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
					startDate,
					endDate,
					remind,
					repeatType,
					repeat,
					courseContent,
					previewContent,
					consume,
					status: 0
				}
				this.schedules.push(schedule)
			} else {
				result = false
			}
			return result
		},
		async fetchSchedules(date:Date) {
			const from = timestampForBeginOfMonth(date)
			const to = timestampForEndOfMonth(date)
			
			const index = this.didLoadRanges.findIndex(r => r.from === from && r.to === to)
			if (index === -1) {
				await this.loadSchedules(date)
			}
			const schedules = this.schedules.filter(s => s.startTime >= from && s.endTime <= to)
			return schedules
		},
		async loadSchedules(date:Date) {
			const from = timestampForBeginOfMonth(date)
			const to = timestampForEndOfMonth(date)
			
			const index = this.didLoadRanges.findIndex(r => r.from === from && r.to === to)
			if (index !== -1) {
				return
			}
			
			const userStore = useUsersStore()
			const orgStore = useOrgsStore()
			const userId = userStore.owner._id
			const roles = userStore.owner.roles
			const type = userStore.owner.from
			
			const schedules:Schedule[] = []
			if (type === 'stuNo') {
				// 学生
				const res = await schedules_co.loadSchedules({
					from, to, 
					roles: [],
					ids: [userId]
				}) as Schedule[]
				schedules.push(...res)
			} else if (type === 'wx') {
				if (roles?.includes(3) && roles.length === 1) {
					// 家长
					const children = userStore.students.filter(s => s.associateIds?.includes(userId))
					if (children.length > 0) {
						const res = await schedules_co.loadSchedules({
							from, to, roles,
							ids: children.map(s => s._id)
						})
						schedules.push(...res)
					}
				} else {
					const orgs = orgStore.orgs.filter(org => org.creatorId === userId)
					// 管理员|老师
					const res = await schedules_co.loadSchedules({
						from, to, roles,
						orgIds: orgs.map(o => o._id),
						ids: [userId]
					}) as Schedule[]
					schedules.push(...res)
				}
			}
			
			if (schedules.length > 0) {
				schedules.forEach(s => {
					const index = this.schedules.findIndex(item => item._id === s._id)
					if (index === -1) {
						this.schedules.push(s)
					}
				})
				this.didLoadRanges.push({
					from, to
				})
			}
		}
	}
})