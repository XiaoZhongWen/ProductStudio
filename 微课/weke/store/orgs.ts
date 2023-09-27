import { defineStore } from 'pinia'
import { Org } from '@/types/org'
import { useUsersStore } from "@/store/users"
// @ts-ignore
import md5 from 'js-md5'
import { User } from '../types/user'

const usersStore = useUsersStore()

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
			if (usersStore.owner.roles?.includes(1)) {
				// 机构负责人
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
				console.info("modify org data, orgId: " + orgId)
				const arr = this.orgs.filter(org => org._id === orgId)
				if (arr.length === 0) {
					console.error("org data [" + orgId + "] not in orgs store, modify org icon failure.")
					result = false
				} else {
					const curOrg = arr[0]
					org.gradient.filter(item => curOrg.gradient.includes(item))
					// TODO: 后期添加老师、学员、课程、班级验证
					if (org.name === curOrg.name &&
						org.tel === curOrg.tel &&
						org.desc === curOrg.desc &&
						org.logoId === curOrg.logoId &&
						org.createDate === curOrg.createDate &&
						org.gradient.toString() === curOrg.gradient.toString()) {
							result = true
							console.info("org data not change.")
						} else {
							try {
								const id = await orgs_co.createOrg(org)
								const index = this.orgs.findIndex((org) => org._id === id)
								result = id === curOrg._id && index !== -1
								if (result) {
									this.orgs.splice(index, 1, org)
									console.info("update org data success.")
								} else {
									console.error("update org data failure.")
								}
							} catch(e) {
								console.error("update org failure.")
							}
						}
				}
			} else {
				console.info("create org data")
				// create
				try {
					const id = await orgs_co.createOrg(org)
					result = id.length > 0
					if (result) {
						org._id = id
						this.orgs.unshift(org)
					}
				} catch(e) {
					console.error("create org failure.")
				}
			}
			if (result) {
				console.info("update org data success.")
			} else {
				console.error("update org data failure.")
			}
			return result
		},
		// 创建匿名机构
		async createAnonymousOrg() {
			console.info("create anonymous org")
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
					console.info("userId: " + userId + ", 创建机构成功")
					this.anonymousOrg._id = orgId
				} else {
					console.info("userId: " + userId + ", 创建机构失败")
				}
			}
		},
		// 获取匿名机构
		async fetchAnonymousOrg() {
			console.info("fetch anonymous org...")
			const userId = usersStore.owner._id
			if (this.anonymousOrg.creatorId === userId) {
				console.info("fetched anonymous org from store")
				return this.anonymousOrg
			}
			const org = await orgs_co.fetchAnonymousOrg(userId)
			if (JSON.stringify(org) !== "{}") {
				console.info("fetched anonymous org from db")
				this.anonymousOrg = {
					...this.anonymousOrg,
					...org
				}
			} else {
				this.createAnonymousOrg()
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
					console.error("org data [" + orgId + "] not in orgs store, modify org icon failure.")
				} else {
					const org:Org = result[0]
					if (org.logoUrl === logoUrl) {
						fileId = org.logoId ?? ''
						console.info("org icon not change.")
					} else {
						flag = true
						// 删除旧图标
						uniCloud.deleteFile({
							fileList:[org.logoId]
						}).then((res)=>{
							console.info("删除机构图标文件成功: " + res)
						}).catch(() => {
							console.error("删除机构图标文件失败: " + org.logoId)
						})
						console.info("start modify org icon")
					}
				}
			} else {
				// create
				flag = true
				console.info("start upload org icon")
			}
			if (flag) {
				// @ts-ignore
				const res = await uniCloud.uploadFile({
					filePath: logoUrl,
					cloudPath: prefix + md5(logoUrl)
				})
				fileId = res.fileID
				if (fileId.length === 0) {
					console.info("upload org icon failure")
				}
			}
			return fileId
		},
		// 获取用户所有相关机构信息
		async loadOrgData() {
			let result = true
			const didLoadedOrgIds = this.orgs.map(org => org._id)
			try {
				const orgs = await orgs_co.fetchOrgs(
					usersStore.owner._id, 
					usersStore.owner.roles, 
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
			for (let org of this.orgs) {
				const nickname = org.nickname ?? ''
				if (nickname.length === 0) {
					if (org.creatorId === usersStore.owner._id) {
						org.nickname = usersStore.owner.nickName
						org.tel = usersStore.owner.mobile ?? ''
					} else {
						// 获取
						const user = await usersStore.fetchUser(org.creatorId) as User
						if (typeof(user) !== 'undefined' && JSON.stringify(user) !== '{}') {
							org.nickname = user.nickName
							org.tel = user.mobile ?? ''
						}
					}
				}
			}
		},
		fetchOrgById(orgId:string) {
			const result = this.orgs.filter(org => org._id === orgId)
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
			const res = this.orgs.filter(org => org._id === orgId)
			if (res.length > 0) {
				const org = res[0]
				const ids = studentIds.filter(id => !org.studentIds?.includes(id))
				if (ids.length > 0) {
					// org.studentIds?.push(...ids)
					orgs_co.addStudents(orgId, ids)
				}
			}
		}
	}
})