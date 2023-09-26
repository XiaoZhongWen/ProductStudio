import { defineStore } from 'pinia'
import { RoleId, Student, User, WxIdentity } from '@/types/user'
// @ts-ignore
import md5 from 'js-md5'

enum IdentityType {
	UseUnionId = 'unionid',
	UseOpenId = 'openid'
}

let identityType = IdentityType.UseOpenId
const users_co = uniCloud.importObject('users', {
	customUI: true
})

export const useUsersStore = defineStore('users', {
	state: () => {
		return {
			isLogin: false,
			owner: {
				_id: '',
				expireDate: 0,
				unionid: '',
				openid: '',
				session_key: '',
				avatarId: '',
				avatarUrl: '',
				tempFileUrl: '',
				nickName: '',
				roles: [],
				studentNo: '',
				status: 0,
				from: 'wx'
			} as User & WxIdentity & {studentNo:string, status: number, from:string},
			lastLoginInfo: {
				unionid: '',
				openid: '',
				nickName: '',
				tempFileUrl: ''
			},
			students: [] as Student[],
			users: [] as User[]
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
			let date = state.owner.expireDate
			const current = Date.now()
			return current > date
		},
		roles(state) {
			return state.owner.roles
		}
	},
	
	actions: {
		// 登录
		// 当from为stuNo时, stuNo、pwd为传入的学号和密码
		async login(from="wx", stuNo?:string, pwd?:string) {
			if (this.isLogin === false) {
				if (from === 'wx') {
					try {
						// 1. 获取openid、unionid, session_key
						console.info("开始微信登录")
						const res = await uni.login({
							provider: 'weixin'
						})
						const session = await users_co.code2Session(res.code)
						const { session_key, openid, unionid } = session.data
						// 2. 云端验证openid、unionid
						const userInfo = await users_co.authIdentity({
							openid: openid,
							unionid: (identityType === IdentityType.UseUnionId)? unionid: "",
							type: (identityType === IdentityType.UseUnionId)? 'wx_unionid': 'wx_openid'
						}) as User & WxIdentity
						// 3. 通过验证则返回用户信息
						if (JSON.stringify(userInfo) !== '{}') {
							// 更新owner对象
							this.owner.openid = openid
							this.owner.unionid = (identityType === IdentityType.UseUnionId)? unionid: ""
							this.owner.session_key = session_key
							this.isLogin = true
							
							const { 
								_id, 
								nickName, 
								expireDate,
								avatarId, 
								roles, 
								mobile,  
								signature
							} = userInfo
							this.owner._id = _id
							this.owner.nickName = nickName
							this.owner.expireDate = expireDate
							this.owner.avatarId = avatarId
							if (typeof(roles) !== 'undefined') {
								this.owner.roles = roles
							}
							if (typeof(mobile) !== 'undefined') {
								this.owner.mobile = mobile
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
							this.fetchStudents()
							console.info("微信用户存在:" + this.owner)
							console.info("微信用户头像url:" + tempFileURL)
						} else {
							this.owner.openid = openid
							this.owner.unionid = unionid
							this.owner.session_key = session_key
							console.info("微信用户不存在")
						}
						uni.setStorage({
							key: "wk-login",
							data: {
								from: 'wx'
							}
						})
					} catch (e) {
						console.error("登录报错: " + e)
					}
				} else if (from === 'stuNo') {
					if (typeof(stuNo) !== 'undefined' && stuNo.length &&
						typeof(pwd) !== 'undefined' && pwd.length) {
						const student = await users_co.authStuIdentity(stuNo, pwd)
						if (JSON.stringify(student) !== '{}') {
							this.isLogin = true
							const { _id, avatarId, mobile, nickName, status, studentNo, signature } = student
							this.owner._id = _id
							this.owner.mobile = mobile
							this.owner.nickName = nickName
							this.owner.status = status
							this.owner.studentNo = studentNo
							this.owner.from = 'stuNo'
							this.owner.signature = signature
							if (typeof(avatarId) !== 'undefined' && avatarId.length > 0) {
								this.owner.avatarId = avatarId
								const result = await uniCloud.getTempFileURL({
									fileList:[this.owner.avatarId]
								})
								const { tempFileURL } = result.fileList[0]
								this.updateAvatarUrl(tempFileURL)
							}
							uni.setStorage({
								key: "wk-login",
								data: {
									from: 'stuNo',
									stuNo: stuNo
								}
							})
						}
					}
				}
			} else {
				console.info("用户是已登录状态")
			}
		},
		// 上传头像
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
				if (this.owner.from === 'wx') {
					await users_co.updateUser({
						...this.owner,
						type: (identityType === IdentityType.UseUnionId)? 'wx_unionid': 'wx_openid'
					})
					if (this.isLogin === false) {
						this.isLogin = true
						this.fetchStudents()
					}
				} else {
					await users_co.updateStudent({...this.owner})
				}
				console.info("更新云端用户信息成功, " + this.owner)
				result = true
			} catch (e) {
				console.error("更新云端用户信息失败, " + e)
			}
			return result
		},
		// 更新学生头像
		async updateStudentAvatar(id:string, avatarUrl:string) {
			if (typeof(id) === 'undefined' || id.length === 0 ||
				typeof(avatarUrl) === 'undefined' || avatarUrl.length === 0) {
				return
			}
			const res = this.students.filter(student => student._id === id)
			if (res.length === 1) {
				const student = res[0]
				const prefix = "ddkb/header/"
				// @ts-ignore
				const result = await uniCloud.uploadFile({
					filePath: avatarUrl,
					cloudPath: prefix + md5(avatarUrl)
				})
				const { fileID } = result
				if (fileID.length > 0) {
					const success = await users_co.updateStudentAvatarId(student.studentNo, fileID)
					if (success === true &&
						typeof(student.avatarId) !== 'undefined' &&
						student.avatarId.length > 0) {
						uniCloud.deleteFile({
							fileList:[student.avatarId]
						}).then((res)=>{
							console.info("删除头像文件成功: " + res)
						}).catch(() => {
							console.error("删除头像文件失败: " + student.avatarId)
						})
						student.avatarId = fileID
						student.avatarUrl = avatarUrl
					}
				}
			}
		},
		// 更新头像url
		updateAvatarUrl(avatarUrl:string) {
			this.owner.avatarUrl = avatarUrl
			this.lastLoginInfo.tempFileUrl = avatarUrl
		},
		// 更新头像url
		updateTempFileUrl(tempFileUrl:string) {
			this.owner.tempFileUrl = tempFileUrl
		},
		// 更新头像文件id
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
			users_co.updateRoles(this.owner._id, roleIds)
		},
		// 更新个性签名
		updateSignature(signature: string) {
			this.owner.signature = signature
			users_co.updateSignature(this.owner._id, signature, this.owner.from)
		},
		// 获取students信息
		async fetchStudents() {
			const result = await users_co.fetchStudents(this.owner._id)
			for (let item of result) {
				const res = await uniCloud.getTempFileURL({
					fileList:[item.avatarId]
				})
				const { tempFileURL } = res.fileList[0]
				item.avatarUrl = tempFileURL
				this.students.push(item)
			}
		},
		// 获取用户信息
		async fetchUser(userId: string) {
			if (typeof(userId) === 'undefined' || userId.length === 0) {
				return {}
			}
			const index = this.users.findIndex(user => user._id === userId)
			if (index !== -1) {
				return this.users[index]
			} else {
				const user = await users_co.fetchUser(userId) as User
				if (typeof(user) !== 'undefined' && JSON.stringify(user) !== '{}') {
					this.users.push(user)
					const response = await uniCloud.getTempFileURL({
						fileList:[user.avatarId]
					})
					const { tempFileURL } = response.fileList[0]
					user.avatarUrl = tempFileURL
				}
				return user
			}
		},
		async fetchUserByPhoneNumber(phoneNumber: string) {
			console.info("fetchUserByPhoneNumber...")
			if (typeof(phoneNumber) === 'undefined' || phoneNumber.length === 0) {
				console.info("fetchUserByPhoneNumber: param phoneNumber error")
				return {}
			}
			const index = this.users.findIndex(user => user.mobile === phoneNumber)
			console.info("fetchUserByPhoneNumber, fetch from users")
			if (index !== -1) {
				console.info("fetchUserByPhoneNumber, be fetched from users")
				return this.users[index]
			} else {
				const user = await users_co.fetchUserByPhoneNumber(phoneNumber) as User
				console.info("fetchUserByPhoneNumber, fetch from cloud obj")
				if (typeof(user) !== 'undefined' && JSON.stringify(user) !== '{}') {
					console.info("fetchUserByPhoneNumber, be fetched from cloud obj")
					console.info(user)
					this.users.push(user)
					const response = await uniCloud.getTempFileURL({
						fileList:[user.avatarId]
					})
					const { tempFileURL } = response.fileList[0]
					user.avatarUrl = tempFileURL
				} else {
					console.info("fetchUserByPhoneNumber: user is not exist")
				}
				return user
			}
		},
		async fetchUsers(userIds: string[], type = '') {
			if (typeof(userIds) === 'undefined' || userIds.length === 0) {
				return []
			}
			let loadedUserIds:string[] = []
			if (type === 'student') {
				loadedUserIds = this.students.map(student => student._id)
			} else {
				loadedUserIds = this.users.map(user => user._id)
			}
			const s = userIds.filter(userId => !loadedUserIds.includes(userId))
			if (s.length > 0) {
				let res = []
				if (type === 'student') {
					res = await users_co.fetchStudentsByIds(s) as Student[]
					if (res.length > 0) {
						this.students.push(...res)
					}
				} else {
					res = await users_co.fetchUsers(s) as User[]
					if (res.length > 0) {
						this.users.push(...res)
					}
				}
				if (res.length > 0) {
					const fileIds = res.map(user => user.avatarId)
					const response = await uniCloud.getTempFileURL({
						fileList:fileIds
					})
					const fileList = response.fileList as {code:string, fileID:string, tempFileURL:string}[]
					res.forEach(user => {
						fileList.forEach(item => {
							if (item.code === "SUCCESS" && item.fileID === user.avatarId) {
								user.avatarUrl = item.tempFileURL
							}
						})
					})
				}
			}
			if (type === 'student') {
				return this.students.filter(student => userIds.includes(student._id))
			} else {
				return this.users.filter(user => userIds.includes(user._id))
			}
		}
	}
})