import { defineStore } from 'pinia'
import { Schedule } from '../types/schedule'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from "@/store/orgs"
import { useCourseStore } from "@/store/course"
import { useGradesStore } from "@/store/grades"
import { timestampForBeginOfMonth, timestampForEndOfMonth } from '@/utils/wk-date'

const schedules_co = uniCloud.importObject('schedules', {
	customUI: true
})

type Range = {
	from: number,
	to: number
}

/*
*	缓存策略 - 避免接口数据重复获取
*	1. 排课日期
*		- calendar tab页面
*		1.1 scheduleDates -> 排课日期集合
*		1.2. didLoadRanges -> 记录各排课日期集合对应的时间戳范围
*		- calendar2 页面
*		1.3 scheduleDatesMap -> 学生|老师 的排课日期集合
*	2. 日程
*		- calendar tab页面
*		2.1 schedules -> 日程集合
*		2.2 didLoadDates -> 记录日程集合对应的日期
*		- calendar2 页面
*		2.3 schedulesMap -> 学生|老师 的日程集合
*		- 课程详情页的课程记录
*		2.4 scheduleRecordsMap -> key(学生id、课程id、页序数、页大小) 对应的 日程集合
*/
export const useScheduleStore = defineStore('schedules', {
	state: () => {
		return {
			scheduleDates: [] as {date: string, status: number}[],
			didLoadRanges: [] as Range[],
			scheduleDatesMap: new Map<string, {date: string, status: number}[]>(),
			schedules: [] as Schedule[],
			didLoadDates: [] as string[],
			schedulesMap: new Map<string, Schedule[]>(),
			scheduleRecordsMap: new Map<string, Schedule[]>(),
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
					
					const ids:string[] = [teacherId]
					if (studentId.length > 0) {
						ids.push(studentId)
					} else if (classId.length > 0 && presentIds.length > 0) {
						ids.push(...presentIds)
					}
					
					let key = ''
					const _date = new Date(item.courseDate)
					const from = timestampForBeginOfMonth(_date)
					const to = timestampForEndOfMonth(_date)
					ids.forEach(id => {
						// 更新schedulesMap缓存
						if (id === teacherId) {
							key = id + "-" + "2" + "-" + item.courseDate
						} else {
							key = id + "-" + "4" + "-" + item.courseDate
						}
						this.schedulesMap.forEach((v, k) => {
							if (k === key) {
								v.push(schedule)
							}
						})
						
						// 更新scheduleDatesMap缓存
						if (id === teacherId) {
							key = id + "-" + "2" + "-" + from + "-" + to
						} else {
							key = id + "-" + "4" + "-" + from + "-" + to
						}
						this.scheduleDatesMap.forEach((v, k) => {
							if (k === key) {
								const index = v.findIndex(s => s.date === item.courseDate)
								if (index === -1) {
									v.push({
										date: item.courseDate,
										status: 0
									})
								} else {
									const scheduleDate = v[index]
									scheduleDate.status = 0
								}
							}
						})
						
						// 更新scheduleRecordsMap缓存
						// 创建的schedule无法确定最终的pageIndex, 所以需要删除scheduleRecordsMap中相关的schedule
						key = id + "-" + courseId
						this.scheduleRecordsMap.forEach((v, k) => {
							if (k.includes(key)) {
								this.scheduleRecordsMap.delete(k)
							}
						})
					})
					
					// 更新schedules缓存
					this.schedules.push(schedule)
					
					// 更新scheduleDates缓存
					const index = this.scheduleDates.findIndex(s => s.date === item.courseDate)
					if (index === -1) {
						this.scheduleDates.push({
							date: item.courseDate,
							status: 0
						})
					} else {
						const scheduleDate = this.scheduleDates[index]
						scheduleDate.status = 0
					}
				})
			}
			return items
		},
		async fetchSchedules(date: string) {
			if (typeof(date) === 'undefined' || date.length === 0) {
				return []
			}
			let result:Schedule[] = []
			let noCached:Schedule[] = []
			const userStore = useUsersStore()
			// 检查是否已经缓存过
			const index = this.didLoadDates.findIndex(item => item === date)
			if (index === -1) {
				// 没有缓存过
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
				// 添加缓存记录
				this.didLoadDates.push(date)
				// 添加result中没有被缓存的日程集合
				result.forEach(r => {
					const index = this.schedules.findIndex(s => s._id === r._id)
					if (index === -1) {
						this.schedules.push(r)
						noCached.push(r)
					}
				})
			} else {
				// 已经缓存过
				result = this.schedules.filter(s => s.courseDate === date)
			}
			const courseIds:string[] = []
			const userIds:string[] = []
			const classIds:string[] = []
			noCached.forEach(s => {
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
			if (courseIds.length > 0) {
				await courseStore.fetchCourses(courseIds)
			}
			if (userIds.length > 0) {
				await userStore.fetchUsers(userIds)
			}
			if (classIds.length > 0) {
				await gradesStore.fetchGrades(classIds)
			}
			return result
		},
		/*
		*	获取from、to期间的排课日期, 排课日期不重复
		* 	某日期的排课既有排课课程又有消课课程的, 则返回的排课日期中的status记为0
		* 	自由该日期的所有课程状态不是排课状态, 则返回的排课日期中的status不记为0
		*/
		async fetchSchedulesDate(from: number, to:number) {
			const index = this.didLoadRanges.findIndex(r => r.from === from && r.to === to)
			if (index !== -1) {
				return this.scheduleDates.filter(s => {
					const date = new Date(s.date).getTime()
					return date >= from && date <= to
				})
			} else {
				const userStore = useUsersStore()
				const orgStore = useOrgsStore()
				const userId = userStore.owner._id
				const roles = userStore.owner.roles
				const type = userStore.owner.from
				
				const result:{date: string, status: number}[] = []
				if (type === 'stuNo') {
					// 学生
					const res = await schedules_co.fetchSchedulesDate({
						from, to, 
						roles: [],
						ids: [userId]
					}) as {date: string, status: number}[]
					result.push(...res)
				} else if (type === 'wx') {
					if (roles?.includes(3) && roles.length === 1) {
						// 家长
						const children = userStore.students.filter(s => s.associateIds?.includes(userId))
						if (children.length > 0) {
							const res = await schedules_co.fetchSchedulesDate({
								from, to, roles,
								ids: children.map(s => s._id)
							}) as {date: string, status: number}[]
							result.push(...res)
						}
					} else {
						const orgs = orgStore.orgs.filter(org => org.creatorId === userId)
						// 管理员|老师
						const res = await schedules_co.fetchSchedulesDate({
							from, to, roles,
							orgIds: orgs.map(o => o._id),
							ids: [userId]
						}) as {date: string, status: number}[]
						result.push(...res)
					}
				}
				result.forEach(r => {
					const index = this.scheduleDates.findIndex(s => s.date === r.date)
					if (index === -1) {
						this.scheduleDates.push(r)
					} else {
						const scheduleDate = this.scheduleDates[index]
						scheduleDate.status = r.status
					}
				})
				if (result.length > 0) {
					this.didLoadRanges.push({
						from, to
					})
				}
				return result
			}
		},
		async fetchSpecialSchedules(
			id:string, 
			role:string,
			date: string) {
			if (typeof(id) === 'undefined' || id.length === 0 ||
				typeof(role) === 'undefined' || role.length === 0 ||
				typeof(date) === 'undefined' || date.length === 0) {
				return []
			}
			const key = id + "-" + role + "-" + date
			let schedules = this.schedulesMap.get(key)
			if (!schedules) {
				schedules = await schedules_co.fetchSpecialSchedules(id, role, date)
			} else {
				return schedules
			}
			const courseIds:string[] = []
			const userIds:string[] = []
			const classIds:string[] = []
			const count = schedules?.length ?? 0
			if (count > 0 && schedules) {
				schedules.forEach(s => {
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
				const userStore = useUsersStore()
				const courseStore = useCourseStore()
				const gradesStore = useGradesStore()
				if (courseIds.length > 0) {
					await courseStore.fetchCourses(courseIds)
				}
				if (userIds.length > 0) {
					await userStore.fetchUsers(userIds)
				}
				if (classIds.length > 0) {
					await gradesStore.fetchGrades(classIds)
				}
				this.schedulesMap.set(key, schedules)
			}
			return schedules ?? []
		},
		async fetchSpecialSchedulesDate(
			id:string, 
			role:string, 
			from: number, 
			to:number) {
			if (typeof(id) === 'undefined' || id.length === 0 ||
				typeof(role) === 'undefined' || role.length === 0 ||
				typeof(from) === 'undefined' || typeof(to) === 'undefined') {
				return []
			}
			const key = id + "-" + role + "-" + from + "-" + to
			const s = this.scheduleDatesMap.get(key)
			if (!s) {
				const scheduleDates = await schedules_co.fetchSpecialSchedulesDate(id, role, from, to)
				if (scheduleDates.length > 0) {
					this.scheduleDatesMap.set(key, scheduleDates)
				}
			}
			return this.scheduleDatesMap.get(key) ?? []
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
					// 更新schedules缓存
					schedule.status = status
					
					// 更新scheduleDates缓存
					// 获取scheduleDates中排课日期与schedule相同的排课日期记录
					let index = this.scheduleDates.findIndex(s => s.date === schedule.courseDate)
					if (index !== -1) {
						const scheduleDate = this.scheduleDates[index]
						if (status === 0) {
							// 排课状态
							if (scheduleDate.status !== 0) {
								// 将排课日期记录的状态改为0
								scheduleDate.status = 0
							}
						} else {
							// 非排课状态
							// 检查该日期的日程中是否还存在排课状态的日程
							index = this.schedules.findIndex(s => s.courseDate === schedule.courseDate && s.status === 0)
							if (index === -1) {
								// 不存在, 则变更scheduleDates中相应日期的排课日期记录的status
								scheduleDate.status = status
							}
						}
					}
					
					// 更新scheduleDatesMap缓存
					const date = new Date(schedule.courseDate)
					const from = timestampForBeginOfMonth(date)
					const to = timestampForEndOfMonth(date)
					const key1 = teacherId + "-" + "2" + "-" + from + "-" + to
					const key2 = studentId + "-" + "4" + "-" + from + "-" + to
					this.scheduleDatesMap.forEach((v, k) => {
						if (k === key1 || k === key2) {
							const index = v.findIndex(s => s.date === schedule.courseDate)
							if (index === -1) {
								v.push({
									date: schedule.courseDate,
									status: 0
								})
							} else {
								const scheduleDate = v[index]
								scheduleDate.status = 0
							}
						}
					})
					
					
					// 更新schedulesMap缓存
					this.schedulesMap.forEach((v, k) => {
						const items = v.filter(s => s._id === scheduleId)
						if (items.length === 1) {
							const item = items[0]
							item.status = status
							this.schedulesMap.set(k, items)
						}
					})
					
					// 更新scheduleRecordsMap缓存
					this.scheduleRecordsMap.forEach((v, k) => {
						const items = v.filter(s => s._id === scheduleId)
						if (items.length === 1) {
							const item = items[0]
							item.status = status
							this.schedulesMap.set(k, items)
						}
					})
					
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
					
					if (schedule.status === 0) {
						// 删除的日程的状态为排课状态
						// 检查日程中是否还存在与之课程日期相同的状态为排课状态的日程
						index = this.schedules.findIndex(s => s.courseDate === schedule.courseDate && s.status === 0)
						if (index === -1) {
							// 不存在, 则变更scheduleDates中相应日期的排课日期记录的状态
							index = this.scheduleDates.findIndex(s => s.date === schedule.courseContent)
							if (index !== -1) {
								const scheduleDate = this.scheduleDates[index]
								scheduleDate.status = 1
							}
						}
					}
					// 检查该日期是否还有其他日程
					index = this.schedules.findIndex(s => s.courseDate === schedule.courseDate)
					if (index === -1) {
						// 删除scheduleDates中相应日期的排课日期记录
						index = this.scheduleDates.findIndex(s => s.date === schedule.courseContent)
						this.scheduleDates.splice(index, 1)
					}
				}
			}
			return result
		},
		async updateSchedule2(param: {
			scheduleId: string,
			studentId: string,
			classId: string,
			status: number,
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
			consume: number,
			preConsume: number
		}) {
			const { 
				scheduleId,
				studentId,
				classId,
				status,
				date, 
				orgId, 
				presentIds, 
				courseId,
				teacherId, 
				gradients, 
				startTime, 
				endTime, 
				remind, 
				courseContent, 
				previewContent, 
				consume,
				preConsume } = param
			if (typeof(scheduleId) === 'undefined' || 
				scheduleId.length === 0 || 
				typeof(status) === 'undefined' ||
				typeof(preConsume) === 'undefined') {
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
			
			const result = await schedules_co.updateSchedule2({
				scheduleId,
				studentId: studentNo,
				classId,
				status,
				date,
				orgId,
				presentIds,
				studentNos,
				courseId,
				teacherId,
				gradients,
				startTime,
				endTime,
				remind,
				courseContent,
				previewContent,
				consume,
				preConsume
			})
			if (result) {
				const res = this.schedules.filter(s => s._id === scheduleId)
				if (res.length === 1) {
					const cDate = new Date(startTime)
					const year = cDate.getFullYear()
					const month = String(cDate.getMonth() + 1).padStart(2, '0')
					const day = String(cDate.getDate()).padStart(2, '0')
					const courseDate = year + '-' + month + '-' + day
					const schedule = res[0]
					const preCourseDate = schedule.courseDate
					schedule.date = date
					schedule.courseDate = courseDate
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
					const offset = consume - preConsume
					if (status === 1 && offset !== 0) {
						if (studentId.length > 0) {
							userStore.entries.forEach(e => {
								if (e.studentId === studentNo &&
									e.courseId === courseId &&
									e.teacherId === teacherId &&
									e.orgId === orgId) {
									e.consume += offset
								}
							})
						} else if (classId.length > 0 && presentIds.length > 0) {
							userStore.entries.forEach(e => {
								if (studentNos.includes(e.studentId) &&
									e.courseId === courseId &&
									e.teacherId === teacherId &&
									e.orgId === orgId) {
									e.consume += offset		
								}
							})
						}
					}
					
					// 更新日程日期
					if (preCourseDate !== courseDate) {
						// 检查旧课程日期中是否还有相应课程状态的日程
						let index = this.schedules.findIndex(s => s.courseDate === preCourseDate && s.status === 0)
						if (schedule.status === 0) {
							if (index === -1) {
								// 将scheduleDates中相应日期的排课日期记录的status改为1
								index = this.scheduleDates.findIndex(s => s.date === preCourseDate)
								if (index !== -1) {
									const scheduleDate = this.scheduleDates[index]
									scheduleDate.status = 1
								}
							}
							// 检查scheduleDates中是否存在新课程日期的排课日期记录
							index = this.scheduleDates.findIndex(s => s.date === courseDate)
							if (index === -1) {
								// 不存在, 则添加
								this.scheduleDates.push({
									date: courseDate,
									status: 0
								})
							} else {
								// 存在, 则将状态设置为0
								const scheduleDate = this.scheduleDates[index]
								scheduleDate.status = 0
							}
						} else {
							// 检查scheduleDates中是否存在新课程日期的排课日期记录
							index = this.scheduleDates.findIndex(s => s.date === courseDate)
							if (index === -1) {
								// 不存在, 则添加
								this.scheduleDates.push({
									date: courseDate,
									status: schedule.status
								})
							}
						}
						// 检查旧课程日期中是否还有日程
						index = this.schedules.findIndex(s => s.courseDate === preCourseDate)
						if (index === -1) {
							index = this.scheduleDates.findIndex(s => s.date === preCourseDate)
							this.scheduleDates.splice(index, 1)
						}
					}
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