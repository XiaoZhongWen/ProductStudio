import { defineStore } from 'pinia'
import { Schedule } from '../types/schedule'
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useGradesStore } from "@/store/grades"
import { useSenderStore } from "@/store/sender"
import { useOrgsStore } from './orgs'
import { hhmm, timestampForBeginOfMonth, timestampForEndOfMonth, ymd } from '@/utils/wk-date'
import { User } from '../types/user'
import { CancelNotification, ConsumeNotification } from '../types/notification'

const schedules_co = uniCloud.importObject('schedules', {
	customUI: true
})

export const useScheduleStore = defineStore('schedules', {
	state: () => {
		return {
			schedulesMap: new Map<string, Schedule[]>(),
			scheduleDatesMap: new Map<string, {date: string, status: number}[]>(),
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
			const userStore = useUsersStore()
			const orgStore = useOrgsStore()
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
					const orgs = orgStore.orgs.filter(o => o._id === orgId)
					if (orgs.length > 0) {
						const org = orgs[0]
						if (!ids.includes(org.creatorId)) {
							ids.push(org.creatorId)
						}
					}
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
						key = id + "-" + item.courseDate
						let isExist = false
						this.schedulesMap.forEach((v, k) => {
							if (k === key) {
								v.push(schedule)
								isExist = true
							}
						})
						if (!isExist && id === userStore.owner._id) {
							this.schedulesMap.set(key, [schedule])
						}
						
						// 更新scheduleDatesMap缓存
						key = id + "-" + from + "-" + to
						isExist = false
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
								isExist = true
							}
						})
						if (!isExist && id === userStore.owner._id) {
							this.scheduleDatesMap.set(key, [{
								date: item.courseDate,
								status: 0
							}])
						}
					})
				})
			}
			return items
		},
		async fetchSchedules(id:string, date: string) {
			if (typeof(id) === 'undefined' || id.length === 0 ||
				typeof(date) === 'undefined' || date.length === 0) {
				return []
			}
			const userStore = useUsersStore()
			let result:Schedule[] = []
			const key = id + "-" + date
			const schedules = this.schedulesMap.get(key)
			if (typeof(schedules) !== 'undefined' && schedules.length > 0) {
				result = schedules
			} else {
				const users = await userStore.fetchUsers([id]) as User[]
				if (users.length === 1) {
					const user = users[0]
					const roles = user.roles ?? []
					if (roles.includes(3) && roles.length === 1) {
						// 家长
						const children = await userStore.fetchChildren(id)
						if (children.length > 0) {
							const res = await schedules_co.fetchSchedules({
								date, roles,
								ids: children.map(s => s._id)
							})
							result.push(...res)
						}
					} else {
						// 管理员|老师
						const orgStore = useOrgsStore()
						const orgIds = orgStore.orgs.filter(org => org.creatorId === id).map(org => org._id)
						const res = await schedules_co.fetchSchedules({
							date, roles,
							ids: [id],
							orgIds
						}) as Schedule[]
						result.push(...res)
					}
				} else {
					// 学生
					const res = await schedules_co.fetchSchedules({
						date, 
						roles: [],
						ids: [id]
					}) as Schedule[]
					result.push(...res)
				}
				this.schedulesMap.set(key, result)
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
				if (courseIds.length > 0) {
					await courseStore.fetchCourses(courseIds)
				}
				if (userIds.length > 0) {
					await userStore.fetchUsers(userIds)
				}
				if (classIds.length > 0) {
					await gradesStore.fetchGrades(classIds)
				}
			}
			
			// 获取指定日期的日程时能够确定该日期的日程日期记录的准确信息
			// 此时更新日程日期记录能够处理不同用户日程日历的日期记录不同步的问题
			const count = result.length
			const index1 = result.findIndex(s => s.status === 0)
			
			const _date = new Date(date)
			const from = timestampForBeginOfMonth(_date)
			const to = timestampForEndOfMonth(_date)
			const _key = id + "-" + from + "-" + to
			const scheduleDates = this.scheduleDatesMap.get(_key)
			if (typeof(scheduleDates) !== 'undefined') {
				const index2 = scheduleDates.findIndex(item => item.date === date)
				if (index2 === -1) {
					if (count !== 0) {
						scheduleDates.push({
							date,
							status: index1 === -1? 1:0
						})
					}
				} else {
					if (count !== 0) {
						const scheduleDate = scheduleDates[index2]
						scheduleDate.status = index1 === -1? 1:0
					} else {
						scheduleDates.splice(index2, 1)
					}
				}
			}
			return result
		},
		/*
		*	获取from、to期间的排课日期, 排课日期不重复
		* 	某日期的排课既有排课课程又有消课课程的, 则返回的排课日期中的status记为0
		* 	自由该日期的所有课程状态不是排课状态, 则返回的排课日期中的status不记为0
		*/
		async fetchSchedulesDate(id:string, from: number, to:number) {
			if (typeof(id) === 'undefined' || id.length === 0 ||
				typeof(from) === 'undefined' || typeof(to) === 'undefined') {
				return []	
			}
			const key = id + "-" + from + "-" + to
			const scheduleDates = this.scheduleDatesMap.get(key)
			if (typeof(scheduleDates) !== 'undefined' && scheduleDates.length > 0) {
				return scheduleDates
			} else {
				const userStore = useUsersStore()
				const users = await userStore.fetchUsers([id]) as User[]
				const result:{date: string, status: number}[] = []
				if (users.length === 1) {
					const user = users[0]
					const roles = user.roles ?? []
					if (roles.includes(3) && roles.length === 1) {
						// 家长
						const children = await userStore.fetchChildren(id)
						if (children.length > 0) {
							const res = await schedules_co.fetchSchedulesDate({
								from, to, roles,
								ids: children.map(s => s._id)
							}) as {date: string, status: number}[]
							result.push(...res)
						}
					} else {
						// 管理员|老师
						const orgStore = useOrgsStore()
						const orgIds = orgStore.orgs.filter(org => org.creatorId === id).map(org => org._id)
						const res = await schedules_co.fetchSchedulesDate({
							from, to, roles,
							ids: [id],
							orgIds
						}) as {date: string, status: number}[]
						result.push(...res)
					}
				} else {
					// 学生
					const res = await schedules_co.fetchSchedulesDate({
						from, to, 
						roles: [],
						ids: [id]
					}) as {date: string, status: number}[]
					result.push(...res)
				}
				
				this.scheduleDatesMap.set(key, result)
				return result
			}
		},
		async fetchCourseConsumeRecords(courseId: string, studentId: string, before: number) {
			if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(studentId) === 'undefined' || studentId.length === 0 ||
				typeof(before) === 'undefined') {
				return []
			}
			const res:Schedule[] = await schedules_co.fetchCourseConsumeRecords(courseId, studentId, before)
			return res.sort((r1, r2) => {
				return r2.startTime - r1.startTime
			})
		},
		async modifyCourseConsumeRecord(
			param:{
				_id:string, 
				startTime:number,
				endTime: number,
				count: number,
				content: string,
				assignment: string,
				feedback: string,
				entryId: string,
				delta: number
		}) {
			const { _id, startTime, endTime, count, entryId, delta } = param
			if (typeof(_id) === 'undefined' || 
				_id.length === 0 ||
				typeof(startTime) === 'undefined' || 
				typeof(endTime) === 'undefined' ||
				typeof(count) === 'undefined') {
				return false
			}
			if (delta !== 0 && (typeof(entryId) === 'undefined' || entryId.length === 0)) {
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
			const result = await schedules_co.modifyCourseConsumeRecord({
				_id, startTime, endTime, count, content, assignment, feedback,
				operatorId: usersStore.owner._id,
				entryId, delta
			})
			return result
		},
		async revokeCourseConsumeRecord(_id:string, entryId:string, delta:number) {
			if (typeof(_id) === 'undefined' || _id.length === 0 ||
				typeof(entryId) === 'undefined' || entryId.length === 0 ||
				typeof(delta) === 'undefined') {
				return false
			}
			const usersStore = useUsersStore()
			const result = await schedules_co.revokeCourseConsumeRecord(_id, usersStore.owner._id, entryId, delta)
			return result
		},
		async fetchAbsenceRecords(courseId: string, studentId: string, before:number) {
			if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
				typeof(studentId) === 'undefined' || studentId.length === 0 ||
				typeof(before) === 'undefined') {
				return []
			}
			const res:Schedule[] = await schedules_co.fetchAbsenceRecords(courseId, studentId, before)
			return res.sort((r1, r2) => {
				return r2.startTime - r1.startTime
			})
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
			const courseStore = useCourseStore()
			const orgStore = useOrgsStore()
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
			const courses = courseStore.courses.filter(c => c._id === courseId)
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
				const schedules:Schedule[] = []
				this.schedulesMap.forEach((v, k) => {
					const datas = v.filter(s => s._id === scheduleId)
					schedules.push(...datas)
				})
				schedules.forEach(s => {
					s.status = status	
				})
				if (consume === 0) {
					return true
				}
				const notifications:ConsumeNotification[]&CancelNotification[] = []
				const schedule = schedules[0]
				const date = new Date(schedule.startTime)
				const endDate = new Date(schedule.endTime)
				const time = ymd(date) + " " + hhmm(date) + "~" + hhmm(endDate)
				const orgs = orgStore.orgs.filter(o => o._id === schedule.orgId)
				if (studentId.length > 0) {
					userStore.entries.forEach(e => {
						if (e.studentId === studentNo &&
							e.courseId === courseId &&
							e.teacherId === teacherId &&
							e.orgId === orgId) {
							if (status === 0) {
								e.consume -= consume
							} else if (status === 1 || status === 2) {
								if (status === 1) {
									e.consume += consume
								}
								const index = userStore.students.findIndex(s => s.studentNo === studentNo)
								if (index !== -1) {
									const s = userStore.students[index]
									s.associateIds?.forEach(id => {
										if (status === 1) {
											const item:ConsumeNotification = {
												userId: id,
												student: s.nickName,
												course: courses[0].name,
												consume,
												surplus: e.total - e.consume
											}
											notifications.push(item)
										} else if (status === 2) {
											const item:CancelNotification = {
												userId: id,
												orgName: orgs[0].name,
												student: s.nickName,
												course: courses[0].name,
												time,
												reason: "学生请假"
											}
											notifications.push(item)
										}
									})
								}
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
							} else if (status === 1 || status === 2) {
								if (status === 1) {
									e.consume += consume
								}
								const index = userStore.students.findIndex(s => s.studentNo === e.studentId)
								if (index !== -1) {
									const s = userStore.students[index]
									s.associateIds?.forEach(id => {
										if (status === 1) {
											const item:ConsumeNotification = {
												userId: id,
												student: s.nickName,
												course: courses[0].name,
												consume,
												surplus: e.total - e.consume
											}
											notifications.push(item)
										} else if (status === 2) {
											const item:CancelNotification = {
												userId: id,
												orgName: orgs[0].name,
												student: s.nickName,
												course: courses[0].name,
												time,
												reason: "学生请假"
											}
											notifications.push(item)
										}
									})
								}
							}		
						}
					})
				}
				if (notifications.length > 0) {
					const sender = useSenderStore()
					let type = "schedule_consume"
					if (status === 2) {
						type = "schedule_cancel"
					}
					sender.templateMessage(notifications, type)
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
				this.schedulesMap.forEach((v, k) => {
					const index = v.findIndex(s => s._id === scheduleId)
					if (index !== -1) {
						const schedule = v[index]
						const studentId = schedule.studentId ?? ""
						const userStore = useUsersStore()
						const orgStore = useOrgsStore()
						const courseStore = useCourseStore()
						let students = []
						if (studentId.length > 0) {
							students = userStore.students.filter(s => s._id === studentId)
						} else {
							students = userStore.students.filter(s => schedule.presentIds?.includes(s._id))
						}
						const date = new Date(schedule.startTime)
						const endDate = new Date(schedule.endTime)
						const orgs = orgStore.orgs.filter(o => o._id === schedule.orgId)
						const courses = courseStore.courses.filter(c => c._id === schedule.courseId)
						const time = ymd(date) + " " + hhmm(date) + "~" + hhmm(endDate)
						const notifications:CancelNotification[] = []
						students.forEach(s => {
							s.associateIds?.forEach(id => {
								const item:CancelNotification = {
									userId: id,
									orgName: orgs[0].name,
									student: s.nickName,
									course: courses[0].name,
									time,
									reason: "老师取消"
								}
								notifications.push(item)
							})
						})
						if (notifications.length > 0) {
							const sender = useSenderStore()
							sender.templateMessage(notifications, "schedule_cancel")
						}
						v.splice(index, 1)
					}
				})
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
				const cDate = new Date(startTime)
				const year = cDate.getFullYear()
				const month = String(cDate.getMonth() + 1).padStart(2, '0')
				const day = String(cDate.getDate()).padStart(2, '0')
				const courseDate = year + '-' + month + '-' + day
				
				this.schedulesMap.forEach((v, k) => {
					const items = v.filter(s => s._id === scheduleId)
					if (items.length === 1) {
						const schedule = items[0]
						if (schedule.courseDate !== courseDate) {
							const sections = k.split("-")
							const ownId = sections[0]
							const key1 = ownId + "-" + schedule.courseDate
							const v1 = this.schedulesMap.get(key1)
							const index1 = v1?.findIndex(s => s._id === scheduleId)
							if (index1 !== undefined && index1 !== -1) {
								v1?.splice(index1, 1)
							}
							const key2 = ownId + "-" + courseDate
							const v2 = this.schedulesMap.get(key2)
							if (typeof(v2) !== 'undefined') {
								v2.push(schedule)
							}
						}
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
					}
				})
				
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
			}
			return result
		},
		async updateScheduleNotified(scheduleId:string) {
			if (typeof(scheduleId) === 'undefined' || scheduleId.length === 0) {
				return false
			}
			const result = await schedules_co.updateScheduleNotified(scheduleId)
			if (result) {
				this.schedulesMap.forEach((v, k) => {
					const items = v.filter(s => s._id === scheduleId)
					if (items.length === 1) {
						const item = items[0]
						item.isNotified = true
					}
				})
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
				const schedules:Schedule[] = []
				this.schedulesMap.forEach((v, k) => {
					const items = v.filter(s => s._id === scheduleId)
					if (items.length === 1) {
						const item = items[0]
						schedules.push(item)
					}
				})
				
				schedules.forEach(schedule => {
					if (type === '0') {
						schedule.previewContent = content
					} else if (type === '1') {
						schedule.courseContent = content
					} else if (type === '2') {
						schedule.assignment = content
					} else if (type === '3') {
						schedule.feedback = content
					}
				})
			}
			return result
		},
		updateCachedScheduleDate(ownId:string, date:string) {
			if (typeof(ownId) === 'undefined' || ownId.length === 0 ||
				typeof(date) === 'undefined' || date.length === 0) {
				return
			}
			let key = ownId + "-" + date
			const schedules = this.schedulesMap.get(key)
			if (typeof(schedules) !== 'undefined') {
				const index = schedules.findIndex(s => s.courseDate === date && s.status === 0)
				const _date = new Date(date)
				const from = timestampForBeginOfMonth(_date)
				const to = timestampForEndOfMonth(_date)
				key = ownId + "-" + from + "-" + to
				const scheduleDates = this.scheduleDatesMap.get(key)
				if (typeof(scheduleDates) !== 'undefined') {
					const index2 = scheduleDates.findIndex(sd => sd.date === date)
					if (index2 !== -1) {
						const index3 = schedules.findIndex(s => s.courseDate === date)
						if (index3 === -1) {
							scheduleDates.splice(index2, 1)
						} else {
							const scheduleDate = scheduleDates[index2]
							scheduleDate.status = index === -1? 1: 0
						}
					}
				}
			}
		},
		modifyCachedScheduleDates(ownId:string, from: string, to:string, status:number) {
			if (typeof(ownId) === 'undefined' || ownId.length === 0 || 
				typeof(from) === 'undefined' || from.length === 0 ||
				typeof(to) === 'undefined' || to.length === 0 ||
				typeof(status) === 'undefined') {
				return
			}
			this.updateCachedScheduleDate(ownId, from)
			const date = new Date(to)
			const s = timestampForBeginOfMonth(date)
			const e = timestampForEndOfMonth(date)
			const key = ownId + "-" + s + "-" + e
			const scheduleDates = this.scheduleDatesMap.get(key)
			if (typeof(scheduleDates) !== 'undefined') {
				const index = scheduleDates.findIndex(sd => sd.date === to)
				if (index === -1) {
					scheduleDates.push({
						date: to,
						status
					})
				} else {
					const scheduleDate = scheduleDates[index]
					if(status === 0) {
						scheduleDate.status = 0
					}
				}
			}
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