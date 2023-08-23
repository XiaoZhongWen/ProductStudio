import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', {
	state: () => {
		return {
			isLogin: false
		}
	},
	
	getters: {},
	
	actions: {}
})