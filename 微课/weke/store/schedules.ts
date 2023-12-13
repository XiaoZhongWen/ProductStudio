import { defineStore } from 'pinia'
import { Schedule } from '../types/schedule'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from "@/store/orgs"
import { timestampForBeginOfMonth, timestampForEndOfMonth } from '@/utils/wk-date'

const schedules_co = uniCloud.importObject('schedules', {
	customUI: true
})

export const useScheduleStore = defineStore('schedules', {
	state: () => {
		return {
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
			repeat: number[],
			courseContent: string,
			previewContent: string
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
				remind,
				repeatType,
				repeat,
				courseContent,
				previewContent
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
					remind,
					repeatType,
					repeat,
					courseContent,
					previewContent
				}
				this.schedules.push(schedule)
			} else {
				result = false
			}
			return result
		},
		async loadSchedules(date:Date) {
			const from = timestampForBeginOfMonth(date)
			const to = timestampForEndOfMonth(date)
			
			const res = this.schedules.filter(s => s.startTime > from && s.endTime < to)
			if (res.length > 0) {
				return
			}
			
			const userStore = useUsersStore()
			const orgStore = useOrgsStore()
			const userId = userStore.owner._id
			const roles = userStore.owner.roles
			const type = userStore.owner.from
			
			if (type === 'stuNo') {
				// 学生
				const schedules = await schedules_co.loadSchedules({
					from, to, 
					roles: [],
					ids: [userId]
				}) as Schedule[]
				this.schedules.push(...schedules)
				return
			} else if (type === 'wx') {
				if (roles?.includes(3) && roles.length === 1) {
					// 家长
					const children = userStore.students.filter(s => s.associateIds?.includes(userId))
					if (children.length > 0) {
						const schedules = await schedules_co.loadSchedules({
							from, to, roles,
							ids: children.map(s => s._id)
						})
						this.schedules.push(...schedules)
						return
					}
				} else {
					const orgs = orgStore.orgs.filter(org => org.creatorId === userId)
					// 管理员|老师
					const schedules = await schedules_co.loadSchedules({
						from, to, roles,
						orgIds: orgs.map(o => o._id),
						ids: [userId]
					}) as Schedule[]
					this.schedules.push(...schedules)
				}
			}
		}
	}
})