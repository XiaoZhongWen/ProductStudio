import { defineStore } from 'pinia'
import { ScheduleNotification } from '../types/notification'

const sender_co = uniCloud.importObject('sender', {
	customUI: true
})

export const useSenderStore = defineStore('sender', {
	state: () => {
		return {}
	},
	getters: {
		
	},
	actions: {
		sendScheduleNotifications(s:ScheduleNotification[]) {
			sender_co.scheduleSuccessMessage(s)
		}
	}
})