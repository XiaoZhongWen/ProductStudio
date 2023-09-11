import { defineStore } from 'pinia'
import { RoleId, User, WxIdentity } from '@/types/user'
// @ts-ignore
import md5 from 'js-md5'

enum IdentityType {
	UseUnionId = 'unionid',
	UseOpenId = 'openid'
}

let identityType = IdentityType.UseOpenId
const users = uniCloud.importObject('users', {
	customUI: true
})

export const useUsersStore = defineStore('users', {
	state: () => {
		return {
			isLogin: false,
			owner: {
				_id: '',
				familyExpireDate: 0,
				orgExpireDate: 0,
				inputCount: 0,
				unionid: '',
				openid: '',
				session_key: '',
				avatarId: '',
				avatarUrl: '',
				tempFileUrl: '',
				nickName: '',
				roles: [],
				orgIds: []
			} as User & WxIdentity,
			lastLoginInfo: {
				unionid: '',
				openid: '',
				nickName: '',
				tempFileUrl: ''
			},
			children: [] as User[]
		}
	},
	
	getters: {
		roleNames(state) {
			return state.owner.roles?.map((roleId:RoleId) => {
				let name = ''
				switch(roleId) {
					case 1:
						name = "机构负责人"
						break
					case 2:
						name = "老师"
						break
					case 3:
						name = "学生"
						break
					case 4:
						name = "家长"
						break
				}
				return name
			})
		},
		signature(state) {
			return state.owner.signature ?? '个性签名'
		},
		isExpired(state) {
			let date = state.owner.orgExpireDate
			const set = new Set(state.owner.roles)
			// 角色为学生或者角色为家长且不叠加机构负责人和老师
			if (set.has(3) || 
				(set.has(4) && !set.has(1) && !set.has(2))) {
				date = state.owner.familyExpireDate
			}
			const current = Date.now()
			return current > date
		},
		expiredDate(state) {
			let date = state.owner.orgExpireDate
			const set = new Set(state.owner.roles)
			// 角色为学生或者角色为家长且不叠加机构负责人和老师
			if (set.has(3) || 
				(set.has(4) && !set.has(1) && !set.has(2))) {
				date = state.owner.familyExpireDate
			}
			return date
		},
		roles(state) {
			return state.owner.roles
		}
	},
	
	actions: {
		async login() {
			if (this.isLogin === false) {
				try {
					// 1. 获取openid、unionid, session_key
					console.info("开始微信登录")
					const res = await uni.login({
						provider: 'weixin'
					})
					const session = await users.code2Session(res.code)
					const { session_key, openid, unionid } = session.data
					// 2. 云端验证openid、unionid
					const userInfo = await users.authIdentity({
						openid: openid,
						unionid: (identityType === IdentityType.UseUnionId)? unionid: "",
						type: (identityType === IdentityType.UseUnionId)? 'wx_unionid': 'wx_openid'
					})
					// 3. 通过验证则返回用户信息
					if (JSON.stringify(userInfo) !== '{}') {
						// 更新owner对象
						this.owner.openid = openid
						this.owner.unionid = (identityType === IdentityType.UseUnionId)? unionid: ""
						this.owner.session_key = session_key
						this.isLogin = true
						const { _id, nickName, familyExpireDate, orgExpireDate, inputCount, avatarId, birthday, roles, mobile, orgIds, status, parentIds, signature } = userInfo as User & WxIdentity
						this.owner._id = _id
						this.owner.nickName = nickName
						this.owner.familyExpireDate = familyExpireDate
						this.owner.orgExpireDate = orgExpireDate
						this.owner.inputCount = inputCount
						this.owner.avatarId = avatarId
						if (typeof(birthday) !== 'undefined') {
							this.owner.birthday = birthday
						}
						if (typeof(roles) !== 'undefined') {
							this.owner.roles = roles
						}
						if (typeof(mobile) !== 'undefined') {
							this.owner.mobile = mobile
						}
						if (typeof(orgIds) !== 'undefined') {
							this.owner.orgIds = orgIds
						}
						if (typeof(status) !== 'undefined') {
							this.owner.status = status
						}
						if (typeof(parentIds) !== 'undefined') {
							this.owner.parentIds = parentIds
						}
						if (typeof(signature) !== 'undefined') {
							this.owner.signature = signature
						}
						// 更新lastLoginInfo对象
						this.lastLoginInfo.unionid = (identityType === IdentityType.UseUnionId)? unionid: ""
						this.lastLoginInfo.openid = openid
						this.lastLoginInfo.nickName = this.owner.nickName ?? ''
						const result = await uniCloud.getTempFileURL({
							fileList:[this.owner.avatarId]
						})
						const { tempFileURL } = result.fileList[0]
						this.updateAvatarUrl(tempFileURL)
						this.fetchChildren()
						console.info("微信用户存在:" + this.owner)
					} else {
						this.owner.openid = openid
						this.owner.unionid = unionid
						this.owner.session_key = session_key
						console.info("微信用户不存在")
					}
				} catch (e) {
					console.error("登录报错: " + e)
				}
			} else {
				console.info("用户是已登录状态")
			}
		},
		async uploadPortrait() {
			const lastAvatarUrl = this.lastLoginInfo.tempFileUrl ?? ''
			const avatarUrl = this.owner.tempFileUrl ?? ''
			let result = false
			if (lastAvatarUrl !== avatarUrl || avatarUrl.length === 0) {
				console.info("开始更新头像...")
				console.info("当前头像url: " + lastAvatarUrl)
				console.info("更新头像url: " + avatarUrl)
				const url = this.owner.tempFileUrl?.trim() ?? ""
				const prefix = "ddkb/header/"
				const oldFileId = this.owner.avatarId ?? ''
				console.info("待删除头像文件id: " + oldFileId)
				// @ts-ignore
				const res = await uniCloud.uploadFile({
					filePath: url,
					cloudPath: prefix + md5(url)
				})
				const { fileID } = res
				this.updateAvatarId(fileID)
				try {
					const response = await uniCloud.getTempFileURL({
						fileList:[fileID]
					})
					const { tempFileURL } = response.fileList[0]
					this.updateAvatarUrl(tempFileURL)
					console.info("更新头像成功, url: " + tempFileURL)
					result = true
					if (oldFileId.length > 0) {
						// 删除旧头像
						uniCloud.deleteFile({
							fileList:[oldFileId]
						}).then((res)=>{
							console.info("删除头像文件成功: " + res)
						}).catch(() => {
							console.error("删除头像文件失败: " + oldFileId)
						})
					}
				} catch (error) {
					console.error("获取头像临时url失败, " + error)
				}
			} else {
				console.info("头像未修改")
				console.info("原头像url: " + lastAvatarUrl)
				console.info("更新头像url: " + avatarUrl)
			}
			return result
		},
		// 更新云端用户信息
		async updateCloudUser() {
			let result = false
			try {
				 await users.updateUser({
					...this.owner,
					type: (identityType === IdentityType.UseUnionId)? 'wx_unionid': 'wx_openid'
				})
				this.isLogin = true
				this.fetchChildren()
				console.info("更新云端用户信息成功, " + this.owner)
				result = true
			} catch (e) {
				console.error("更新云端用户信息失败, " + e)
			}
			return result
		},
		// 更新头像url
		updateAvatarUrl(avatarUrl:string) {
			this.owner.avatarUrl = avatarUrl
			this.lastLoginInfo.tempFileUrl = avatarUrl
		},
		updateTempFileUrl(tempFileUrl:string) {
			this.owner.tempFileUrl = tempFileUrl
		},
		updateAvatarId(fileId: string) {
			this.owner.avatarId = fileId
		},
		// 更新昵称
		updateNickname(nickName:string) {
			const result = nickName !== this.lastLoginInfo.nickName
			this.owner.nickName = nickName
			return result;
		},
		// 更新身份id
		updateIdentity(openid:string = '', unionid:string = '', session_key:string = '') {
			if (typeof(openid) !== 'undefined') {
				this.owner.openid = openid
			}
			if (typeof(unionid) !== 'undefined') {
				this.owner.unionid = unionid
			}
			if (typeof(session_key) !== 'undefined') {
				this.owner.session_key = session_key
			}
		},
		// 更新角色
		updateRoles(roleIds: RoleId[]) {
			this.owner.roles = roleIds
			users.updateRoles(this.owner._id, roleIds)
		},
		// 更新个性签名
		updateSignature(signature: string) {
			this.owner.signature = signature
			users.updateSignature(this.owner._id, signature)
		},
		// 获取children信息
		async fetchChildren() {
			const roles = new Set(this.owner.roles)
			if (roles.has(4)) {
				// 家长
				const result = await users.fetchChildren(this.owner._id)
				for (let item of result) {
					const res = await uniCloud.getTempFileURL({
						fileList:[item.avatarId]
					})
					const { tempFileURL } = res.fileList[0]
					item.avatarUrl = tempFileURL
					this.children.push(item)
				}
			}
		},
		// 更新机构信息
		updateOrgs(orgId: string) {
			const orgIds = this.owner.orgIds ?? []
			if (orgId.length > 0 && !orgIds.includes(orgId)) {
				this.owner.orgIds?.push(orgId)
				users.updateOrgIds(this.owner._id, this.owner.orgIds ?? [])
			}
		}
	}
})