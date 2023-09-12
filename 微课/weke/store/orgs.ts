import { defineStore } from 'pinia'
import { Org } from '@/types/org'
import { useUsersStore } from "@/store/users"
// @ts-ignore
import md5 from 'js-md5'

const usersStore = useUsersStore()

const orgs_co = uniCloud.importObject('orgs', {
	customUI: true
})
const users_co = uniCloud.importObject('users', {
	customUI: true
})

export const useOrgsStore = defineStore('orgs', {
	state: () => {
		return {
			orgs:[] as Org[]
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
					let gradientDidChanged = false
					if (org.gradient.length === curOrg.gradient.length) {
						for (let item of org.gradient) {
							if (!curOrg.gradient.includes(item)) {
								gradientDidChanged = true
								break
							}
						}
					} else {
						gradientDidChanged = true
					}
					org.gradient.filter(item => curOrg.gradient.includes(item))
					if (org.name === curOrg.name &&
						org.tel === curOrg.tel &&
						org.desc === curOrg.desc &&
						org.logoId === curOrg.logoId &&
						org.createDate === curOrg.createDate &&
						!gradientDidChanged) {
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
						usersStore.updateOrgsByCreate(id)
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
			const orgIdsByCreate = usersStore.owner.orgIdsByCreate ?? []
			const orgIdsByJoin = usersStore.owner.orgIdsByJoin ?? []
			const orgIds = [...orgIdsByCreate, ...orgIdsByJoin]
			const didLoadedOrgIds = this.orgs.map(org => org._id)
			const needToLoadOrgIds = orgIds.filter(orgId => !didLoadedOrgIds.includes(orgId))
			try {
				if (needToLoadOrgIds.length > 0) {
					const orgs = await orgs_co.fetchOrgs(needToLoadOrgIds)
					this.orgs.push(...orgs)
					// 按创建时间降序排序
					this.orgs.sort((a, b) => {
						const date1 = new Date(a.createDate)
						const date2 = new Date(b.createDate)
						return date2.getTime() - date1.getTime()
					})
					this.fetchOrgIconUrl()
					this.fetchOrgCreator()
				}
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
			const orgIdsByCreate = usersStore.owner.orgIdsByCreate ?? []
			const other:string[] = []
			for (let org of this.orgs) {
				if (orgIdsByCreate.includes(org._id)) {
					org.nickname = usersStore.owner.nickName
				} else {
					other.push(org._id)
				}
			}
			if (other.length) {
				const res:{orgId: string, nickName:string}[] = await users_co.fetchOrgCreator(other)
				console.info(res)
				this.orgs.forEach(org => {
					if (other.includes(org._id)) {
						res.forEach(item => {
							if (item.orgId === org._id) {
								org.nickname = item.nickName
							}
						})
					}
				})
			}
		},
		fetchOrgById(orgId:string) {
			const result = this.orgs.filter(org => org._id === orgId)
			return result[0]
		}
	}
})