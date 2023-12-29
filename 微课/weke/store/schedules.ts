import { defineStore } from 'pinia'
import { Schedule } from '../types/schedule'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from "@/store/orgs"
import { useCourseStore } from "@/store/course"
import { useGradesStore } from "@/store/grades"

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
			scheduleDates: [] as string[],
			schedules: [] as Schedule[],
			checkedAudioFileId: "cloud://tcb-pwxt7mejf8zs8rb-1cwte216d53a.7463-tcb-pwxt7mejf8zs8rb-1cwte216d53a-1319472732/ddkb/audio/jingle.aac",
			checkedAudioUrl: ''
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
				return []
			}
			if ( (typeof(studentId) === 'undefined' || studentId.length === 0) &&
				 ((typeof(classId) === 'undefined' || classId.length === 0) ||
				 (typeof(presentIds) === 'undefined' || presentIds.length === 0)) ) {
				return []
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
					if (!this.scheduleDates.includes(item.courseDate)) {
						this.scheduleDates.push(item.courseDate)
					}
				})
			}
			return items
		},
		async fetchSchedules(date: string) {
			if (typeof(date) === 'undefined' || date.length === 0) {
				return []
			}
			let result = []
			const userStore = useUsersStore()
			result = this.schedules.filter(s => s.courseDate === date)
			if (result.length === 0) {
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
			}
			const courseIds:string[] = []
			const userIds:string[] = []
			const classIds:string[] = []
			result.forEach(s => {
				// 课程
				if (!courseIds.includes(s.courseId)) {
					courseIds.push(s.courseId)
				}
				// 老师
				if (!userIds.includes(s.teacherId)) {
					userIds.push(s.teacherId)
				}
				// 班级
				if (typeof(s.classId) !== 'undefined' && 
					s.classId.length > 0 &&
					!classIds.includes(s.classId)) {
					classIds.push(s.classId)
				}
			})
			const courseStore = useCourseStore()
			const gradesStore = useGradesStore()
			await courseStore.fetchCourses(courseIds)
			await userStore.fetchUsers(userIds)
			await gradesStore.fetchGrades(classIds)
			result.forEach(r => {
				const index = this.schedules.findIndex(s => s._id === r._id)
				if (index === -1) {
					this.schedules.push(r)
				}
			})
			return result
		},
		async fetchSchedulesDate(from: number, to:number) {
			const index = this.didLoadRanges.findIndex(r => r.from === from && r.to === to)
			if (index !== -1) {
				return this.scheduleDates.filter(s => {
					const date = new Date(s).getTime()
					return date >= from && date <= to
				})
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
					}) as string[]
					result.push(...res)
				} else if (type === 'wx') {
					if (roles?.includes(3) && roles.length === 1) {
						// 家长
						const children = userStore.students.filter(s => s.associateIds?.includes(userId))
						if (children.length > 0) {
							const res = await schedules_co.fetchSchedulesDate({
								from, to, roles,
								ids: children.map(s => s._id)
							}) as string[]
							result.push(...res)
						}
					} else {
						const orgs = orgStore.orgs.filter(org => org.creatorId === userId)
						// 管理员|老师
						const res = await schedules_co.fetchSchedulesDate({
							from, to, roles,
							orgIds: orgs.map(o => o._id),
							ids: [userId]
						}) as string[]
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
		},
		async dealSchedule(param: {
			scheduleId: string,
			orgId: string,
			teacherId: string,
			studentId: string,
			courseId: string,
			classId: string,
			presentIds: string[],
			consume: number,
			status: number
		}) {
			const {
				scheduleId, 
				orgId, 
				teacherId, 
				studentId, 
				courseId, 
				classId, 
				presentIds, 
				consume,
				status} = param
			if (typeof(scheduleId) === 'undefined' || scheduleId.length === 0 ||
				typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(teacherId) === 'undefined' || teacherId.length === 0 ||
				typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(consume) === 'undefined' ||
				typeof(status) === 'undefined') {
				return false
			}
			if ((typeof(studentId) === 'undefined' || studentId.length === 0) &&
				((typeof(classId) === 'undefined' || classId.length === 0) ||
				(typeof(presentIds) === 'undefined' || presentIds.length === 0))) {
				return false
			}
			const userStore = useUsersStore()
			let studentNo = ''
			if (studentId.length > 0) {
				const students = userStore.students.filter(s => s._id === studentId)
				if (students.length === 1) {
					const student = students[0]
					studentNo = student.studentNo
				}
			}
			
			let studentNos:string[] = []
			if (classId.length > 0 && presentIds.length > 0) {
				const students = userStore.students.filter(s => presentIds.includes(s._id))
				studentNos = students.map(s => s.studentNo)
			}
			const result = await schedules_co.dealSchedule({
				status,
				scheduleId,
				orgId,
				teacherId,
				studentId: studentNo,
				courseId,
				classId: classId ?? '',
				presentIds: studentNos,
				consume,
				operatorId: userStore.owner._id
			})
			if (result) {
				const res = this.schedules.filter(s => s._id === scheduleId)
				if (res.length === 1) {
					const schedule = res[0]
					schedule.status = status
					if (status === 0) {
						if (!this.scheduleDates.includes(schedule.courseDate)) {
							this.scheduleDates.push(schedule.courseDate)
						}
					}
					if (status === 1 || status === 2) {
						let index = this.schedules.findIndex(s => s.status === 0 && s.courseDate === schedule.courseDate)
						if (index === -1) {
							index = this.scheduleDates.findIndex(date => date === schedule.courseDate)
							if (index !== -1) {
								this.scheduleDates.splice(index, 1)
							}
						}
					}
					if (status === 2 || consume === 0) {
						return true
					}
					if (studentId.length > 0) {
						userStore.entries.forEach(e => {
							if (e.studentId === studentNo &&
								e.courseId === courseId &&
								e.teacherId === teacherId &&
								e.orgId === orgId) {
								if (status === 0) {
									e.consume -= consume
								} else if (status === 1) {
									e.consume += consume
								}
							}
						})
					} else if (classId.length > 0 && presentIds.length > 0) {
						userStore.entries.forEach(e => {
							if (studentNos.includes(e.studentId) &&
								e.courseId === courseId &&
								e.teacherId === teacherId &&
								e.orgId === orgId) {
								if (status === 0) {
									e.consume -= consume
								} else if (status === 1) {
									e.consume += consume
								}		
							}
						})
					}
				}
			}
			return result
		},
		async deleteSchedule(scheduleId: string) {
			if (typeof(scheduleId) === 'undefined' || 
				scheduleId.length === 0) {
				return false
			}
			const result = await schedules_co.deleteSchedule(scheduleId)
			if (result) {
				let index = this.schedules.findIndex(s => s._id === scheduleId)
				if (index !== -1) {
					const schedule = this.schedules[index]
					this.schedules.splice(index, 1)
					index = this.scheduleDates.findIndex(date => date === schedule.courseDate)
					if (index !== -1) {
						this.scheduleDates.splice(index, 1)
					}
				}
			}
			return result
		},
		async updateSchedule2(param: {
			scheduleId: string,
			date: number,
			orgId: string,
			presentIds: string[],
			courseId: string,
			teacherId: string,
			gradients: string[],
			startTime: number,
			endTime: number,
			remind: boolean,
			courseContent: string,
			previewContent: string,
			consume: number
		}) {
			const { 
				date, 
				startTime, 
				endTime, 
				scheduleId, 
				orgId, 
				presentIds, 
				courseId, 
				teacherId, 
				gradients, 
				remind, 
				courseContent, 
				previewContent, 
				consume } = param
			if (typeof(scheduleId) === 'undefined' || scheduleId.length === 0) {
				return false
			}
			const result = await schedules_co.updateSchedule2(param)
			if (result) {
				const res = this.schedules.filter(s => s._id === scheduleId)
				if (res.length === 1) {
					const cDate = new Date(startTime)
					const year = cDate.getFullYear()
					const month = String(cDate.getMonth() + 1).padStart(2, '0')
					const day = String(cDate.getDate()).padStart(2, '0')
					const courseDate = year + '-' + month + '-' + day
					const schedule = res[0]
					if (schedule.courseDate !== courseDate) {
						const datas = this.schedules.filter(s => s.courseDate === schedule.courseDate)
						if (datas.length === 1) {
							const index = this.scheduleDates.findIndex(item => item === schedule.courseDate)
							if (index !== -1) {
								this.scheduleDates.splice(index, 1)
							}
						}
					} else {
						schedule.courseDate = courseDate
						const index = this.scheduleDates.findIndex(item => item === courseDate)
						if (index === -1) {
							this.scheduleDates.push(courseDate)
						}
					}
					schedule.date = date
					schedule.orgId = orgId
					schedule.presentIds = presentIds
					schedule.courseId = courseId
					schedule.teacherId = teacherId
					schedule.gradients = gradients
					schedule.startTime = startTime
					schedule.endTime = endTime
					schedule.remind = remind
					schedule.courseContent = courseContent
					schedule.previewContent = previewContent
					schedule.consume = consume
				}
			}
			return result
		},
		async updateSchedule(scheduleId:string, content:string, type:string) {
			if (typeof(scheduleId) === 'undefined' || scheduleId.length === 0 ||
				typeof(content) === 'undefined' || content.length === 0 ||
				typeof(type) === 'undefined' || type.length === 0) {
				return false
			}
			const result = await schedules_co.updateSchedule(scheduleId, content, type)
			if (result) {
				const res = this.schedules.filter(s => s._id === scheduleId)
				if (res.length === 1) {
					const schedule = res[0]
					if (type === '0') {
						schedule.previewContent = content
					} else if (type === '1') {
						schedule.courseContent = content
					} else if (type === '2') {
						schedule.assignment = content
					} else if (type === '3') {
						schedule.feedback = content
					}
				}
			}
			return result
		},
		async playChecked() {
			if (this.checkedAudioUrl.length === 0) {
				const result = await uniCloud.getTempFileURL({
					fileList: [this.checkedAudioFileId]
				})
				const { tempFileURL } = result.fileList[0]
				this.checkedAudioUrl = tempFileURL
			}
			const innerAudioContext = uni.createInnerAudioContext();
			innerAudioContext.autoplay = true;
			innerAudioContext.src = this.checkedAudioUrl
			innerAudioContext.onPlay(() => {})
		}
	}
})