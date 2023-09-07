import { defineStore } from 'pinia'
import { Org } from '@/types/org'

export const useOrgsStore = defineStore('orgs', {
	state: () => {
		return {
			orgs:[] as Org[]
		}
	}
})