import { defineStore } from 'pinia'

enum IdentityType {
	UseUnionId = 'unionid',
	UseOpenId = 'openid'
}

var identityType = IdentityType.UseOpenId
const users = uniCloud.importObject('users', {
	customUI: true
})

export const useUsersStore = defineStore('users', {
	state: () => {
		return {
			owner: {
				isLogin: false,
				avatarUrl: '',
				nickName: '',
				session_key: '',
				unionid: '',
				openid: ''
			}
		}
	},
	
	getters: {},
	
	actions: {
		async login() {
			try {
				// 1. 获取openid、unionid
				const res = await uni.login({
					provider: 'weixin'
				})
				const session = await users.code2Session(res.code)
				const {session_key, openid, unionid} = session.data
				// 2. 云端验证openid、unionid
				// 3. 通过验证则返回用户信息
			} catch (e) {
				console.log(e)
			}
		},
		// 更新头像url
		updateAvatarUrl(avatarUrl:string) {
			this.owner.avatarUrl = avatarUrl
		},
		// 更新昵称
		updateNickname(nickName:string) {
			this.owner.nickName = nickName
		},
		// 更新身份id
		updateIdentity(openid:string = '', unionid:string = '') {
			if (typeof(openid) !== 'undefined') {
				this.owner.openid = openid
			}
			if (typeof(unionid) !== 'undefined') {
				this.owner.unionid = unionid
			}
		},
		// 保存|更新用户信息
		saveUserInfo() {
			const identityId = identityType === IdentityType.UseUnionId? this.owner.unionid: this.owner.openid
			if (this.owner.avatarUrl.length === 0 ||
				this.owner.nickName.length === 0 ||
				identityId.length === 0) {
				return
			}
		// 	users.saveUserInfo({
		// 		unionid: this.owner.unionid,
		// 		openid: this.owner.openid,
		// 		nickname: this.owner.nickName,
		// 		avatarUrl: this.owner.avatarUrl
		// 	})
		}
	}
})