import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', {
	state: () => {
		return {
			owner: {
				isLogin: false,
				avatarUrl: '',
				nickName: ''
			}
		}
	},
	
	getters: {},
	
	actions: {
		// 更新头像url
		updateAvatarUrl(avatarUrl:string) {
			this.owner.avatarUrl = avatarUrl
		},
		// 更新昵称
		updateNickname(nickName:string) {
			this.owner.nickName = nickName
		}
	}
})