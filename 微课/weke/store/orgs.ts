import { defineStore } from 'pinia'
import { Org } from '@/types/org'
import { useUsersStore } from "@/store/users"
// @ts-ignore
import md5 from 'js-md5'
import { User } from '../types/user'

const orgs_co = uniCloud.importObject('orgs', {
	customUI: true
})

export const useOrgsStore = defineStore('orgs', {
	state: () => {
		return {
			orgs:[] as Org[],
			anonymousOrg: {
				_id: '',
				gradient: ["#4e54c8", "#8f94fb"],
				type: 1
			} as Org
		}
	},
	getters: {
		myOrgs(state) {
			const usersStore = useUsersStore()
			if (usersStore.owner.roles?.includes(1)) {
				// 管理员
				return state.orgs.filter(org => org.creatorId === usersStore.owner._id)
			}
			if (usersStore.owner.from === 'stuNo') {
				// 学生相关的机构数据
				return state.orgs.filter(org => org.studentIds?.includes(usersStore.owner._id))
			}
			return []
		}
	},
	actions: {
		// 创建或更新机构
		async createOrg(org: Org) {
			let result = false
			const orgId = org._id
			if (orgId.length > 0) {
				// modify
				const arr = this.orgs.filter(org => org._id === orgId)
				if (arr.length === 0) {
					result = false
				} else {
					const curOrg = arr[0]
					// TODO: 后期添加老师、学员、课程、班级验证
					if (org.name === curOrg.name &&
						org.tel === curOrg.tel &&
						org.desc === curOrg.desc &&
						org.addr === curOrg.addr &&
						org.logoId === curOrg.logoId &&
						org.createDate === curOrg.createDate &&
						org.gradient.toString() === curOrg.gradient.toString()) {
							result = true
						} else {
							try {
								const id = await orgs_co.createOrg(org)
								const index = this.orgs.findIndex((org) => org._id === id)
								result = id === curOrg._id && index !== -1
								if (result) {
									this.orgs.splice(index, 1, org)
								} else {
								}
							} catch(e) {
							}
						}
				}
			} else {
				// create
				try {
					const id = await orgs_co.createOrg(org)
					result = id.length > 0
					if (result) {
						org._id = id
						this.orgs.unshift(org)
					}
				} catch(e) {
				}
			}
			if (result) {
			} else {
			}
			return result
		},
		// 创建匿名机构
		async createAnonymousOrg() {
			const usersStore = useUsersStore()
			const userId = usersStore.owner._id
			if (this.anonymousOrg._id.length === 0) {
				const date = new Date(Date.now())
				const month = date.getMonth() + 1
				const createDate = date.getFullYear() + "-" + month + "-" + date.getDate()
				this.anonymousOrg.name = userId
				this.anonymousOrg.createDate = createDate
				this.anonymousOrg.creatorId = userId
				const orgId = await orgs_co.createOrg(this.anonymousOrg)
				if (orgId.length > 0) {
					this.anonymousOrg._id = orgId
				} else {
				}
			}
		},
		// 获取匿名机构
		async fetchAnonymousOrg() {
			const usersStore = useUsersStore()
			const userId = usersStore.owner._id
			if (this.anonymousOrg.creatorId === userId) {
				return this.anonymousOrg
			}
			const org = await orgs_co.fetchAnonymousOrg(userId)
			if (JSON.stringify(org) !== "{}") {
				this.anonymousOrg = {
					...this.anonymousOrg,
					...org
				}
			} else {
				await this.createAnonymousOrg()
			}
		},
		// 上传机构图标
		async uploadIcon(orgId: string, logoUrl:string) {
			if (logoUrl.length === 0) {
				return ""
			}
			let fileId = ""
			let flag = false
			const prefix = "ddkb/header/"
			if (orgId.length > 0) {
				// modify
				const result = this.orgs.filter(org => org._id === orgId)
				if (result.length === 0) {
				} else {
					const org:Org = result[0]
					if (org.logoUrl === logoUrl) {
						fileId = org.logoId ?? ''
					} else {
						flag = true
						// 删除旧图标
						uniCloud.deleteFile({
							fileList:[org.logoId]
						}).then((res)=>{
						}).catch(() => {
						})
					}
				}
			} else {
				// create
				flag = true
			}
			if (flag) {
				// @ts-ignore
				const res = await uniCloud.uploadFile({
					filePath: logoUrl,
					cloudPath: prefix + md5(logoUrl)
				})
				fileId = res.fileID
				if (fileId.length === 0) {
				}
			}
			return fileId
		},
		// 获取用户所有相关机构信息
		async loadOrgData() {
			const usersStore = useUsersStore()
			let result = true
			const didLoadedOrgIds = this.orgs.map(org => org._id)
			try {
				const orgs = await orgs_co.fetchOrgs(
					usersStore.owner._id,
					didLoadedOrgIds,
					usersStore.owner.from
				)
				this.orgs.push(...orgs)
				// 按创建时间降序排序
				this.orgs.sort((a, b) => {
					const date1 = new Date(a.createDate)
					const date2 = new Date(b.createDate)
					return date2.getTime() - date1.getTime()
				})
				this.fetchOrgIconUrl()
				this.fetchOrgCreator()
			} catch(e) {
				result = false
			}
			return result
		},
		// 获取机构图标url
		async fetchOrgIconUrl() {
			for (let org of this.orgs) {
				const checkUrl = typeof(org.logoUrl) === 'undefined' || 
					org.logoUrl.length === 0
				const checkFileId = typeof(org.logoId) !== 'undefined' && org.logoId.length > 0
				if (checkUrl && checkFileId) {
					const response = await uniCloud.getTempFileURL({
						fileList:[org.logoId]
					})
					const { tempFileURL } = response.fileList[0]
					org.logoUrl = tempFileURL
				}
			}
		},
		// 获取机构的创建者信息
		async fetchOrgCreator() {
			const usersStore = useUsersStore()
			for (let org of this.orgs) {
				const nickname = org.nickname ?? ''
				if (nickname.length === 0) {
					if (org.creatorId === usersStore.owner._id) {
						org.nickname = usersStore.owner.nickName
						org.tel = usersStore.owner.mobile ?? ''
					} else {
						// 获取
						const res = await usersStore.fetchUsers([org.creatorId]) as User[]
						if (res.length > 0) {
							const user = res[0]
							if (typeof(user) !== 'undefined' && JSON.stringify(user) !== '{}') {
								org.nickname = user.nickName
								org.tel = user.mobile ?? ''
							}
						}
					}
				}
			}
		},
		fetchOrgsByIds(orgIds:string[]) {
			if (typeof(orgIds) === 'undefined' || orgIds.length === 0) {
				return []
			}
			const orgs:Org[] = []
			orgIds.forEach(orgId => {
				const index = this.orgs.findIndex(org => org._id === orgId)
				orgs.push(this.orgs[index])
			})
			return orgs
		},
		fetchOrgById(orgId:string) {
			let result = this.orgs.filter(org => org._id === orgId)
			if (result.length === 0 && this.anonymousOrg._id === orgId) {
				result = [this.anonymousOrg]
			}
			return result[0]
		},
		/**
		 * 向机构添加老师
		 */
		addTeachers(orgId:string, teacherIds:string[]) {
			const res = this.orgs.filter(org => org._id === orgId)
			if (res.length > 0) {
				const org = res[0]
				const ids = teacherIds.filter(id => !org.teacherIds?.includes(id))
				if (ids.length > 0) {
					org.teacherIds?.push(...ids)
					orgs_co.addTeachers(orgId, ids)
				}
			}
		},
		/**
		 * 向机构添加学员
		 */
		addStudents(orgId:string, studentIds:string[]) {
			if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(studentIds) === 'undefined' || studentIds.length === 0) {
				return
			}
			
			let res = this.orgs.filter(org => org._id === orgId)
			if (res.length === 0 && this.anonymousOrg._id === orgId) {
				res = [this.anonymousOrg]
			}
			if (res.length > 0) {
				const org = res[0]
				const ids = studentIds.filter(id => !org.studentIds?.includes(id))
				if (ids.length > 0) {
					org.studentIds?.push(...ids)
					orgs_co.addStudents(orgId, ids)
				}
			}
		},
		/**
		 * 删除机构学员
		 */
		async removeStudents(orgId:string, studentIds:string[]) {
			let result = false
			if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(studentIds) === 'undefined' || studentIds.length === 0) {
				return result
			}
			const res = this.orgs.filter(org => org._id === orgId)
			if (res.length > 0) {
				result = await orgs_co.removeStudents(orgId, studentIds)
				if (result) {
					const org = res[0]
					studentIds.forEach(id => {
						const index = org.studentIds?.findIndex(sid => sid === id)
						if (typeof(index) !== 'undefined' && index !== -1) {
							org.studentIds?.splice(index, 1)
						}
					})
				}
			}
			return result
		},
		async removeTeachers(orgId:string, teacherIds:string[]) {
			let result = false
			if (typeof(orgId) === 'undefined' || orgId.length === 0 ||
				typeof(teacherIds) === 'undefined' || teacherIds.length === 0) {
				return result
			}
			const res = this.orgs.filter(org => org._id === orgId)
			if (res.length > 0) {
				result = await orgs_co.removeTeachers(orgId, teacherIds)
				if (result) {
					const org = res[0]
					teacherIds.forEach(id => {
						const index = org.teacherIds?.findIndex(tid => tid === id)
						if (typeof(index) !== 'undefined' && index !== -1) {
							org.teacherIds?.splice(index, 1)
						}
					})
				}
			}
			return result
		}
	}
})