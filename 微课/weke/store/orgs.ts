import { defineStore } from 'pinia'
import { Org } from '@/types/org'
import { useUsersStore } from "@/store/users"
// @ts-ignore
import md5 from 'js-md5'

const usersStore = useUsersStore()

const orgs_co = uniCloud.importObject('orgs', {
	customUI: true
})

export const useOrgsStore = defineStore('orgs', {
	state: () => {
		return {
			orgs:[] as Org[]
		}
	},
	actions: {
		async createOrg(org: Org) {
			let result = false
			const orgId = org._id
			if (orgId.length > 0) {
				// modify
				console.info("modify org data, orgId: ", + orgId)
				const arr = this.orgs.filter(org => org._id === orgId)
				if (arr.length === 0) {
					console.error("org data [" + orgId + "] not in orgs store, modify org icon failure.")
					result = false
				} else {
					const curOrg = arr[0]
					if (org.name === curOrg.name &&
						org.tel === curOrg.tel &&
						org.desc === curOrg.desc &&
						org.logoId === curOrg.logoId &&
						org.createDate === curOrg.createDate &&
						org.gradient.length === curOrg.gradient.length &&
						org.gradient.filter(item => curOrg.gradient.includes(item))) {
							result = true
							console.info("org data not change.")
						} else {
							try {
								const id = await orgs_co.createOrg(org)
								result = id === curOrg._id
								if (result) {
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
						this.orgs.push(org)
						usersStore.updateOrgs(id)
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
					const org = result[0]
					if (org.logoUrl === logoUrl) {
						fileId = org._id
						console.info("org icon not change.")
					} else {
						flag = true
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
		async loadOrgData() {
			// 1. 获取用户关联的机构id集合
			const orgIds = usersStore.owner.orgIds ?? []
			// 2. 获取已经添加到orgs中的机构数据
			const orgs = this.orgs.filter(org => orgIds.includes(org._id))
			// 3. 获取还未添加到orgs中的机构数据
			const s = orgs.map(org => org._id)
			const others = orgIds.filter(id => !s.includes(id))
			let array = []
			for (let orgId of others) {
				const org = await orgs_co.fetchOrg(orgId)
				if (JSON.stringify(org) !== "{}") {
					array.push(org)
				}
			}
			// 4. 将array中的数据添加到orgs中
			this.orgs.push(...array)
			// 5. 返回相关机构数据
			return [...orgs, ...array]
		}
	}
})