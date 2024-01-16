import { defineStore } from 'pinia'
import { MemberOption } from '../types/MemberOption'
const member_co = uniCloud.importObject('member', {
	customUI: true
})

export const useMemberStore = defineStore('member', {
	state: () => {
		return {
			memberOptions: [] as MemberOption[]
		}
	},
	actions: {
		async fetchMemberOptions() {
			const res = await member_co.fetchMemberOptions() as MemberOption[]
			return res
		}
	}
})