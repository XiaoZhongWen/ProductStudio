import { defineStore } from 'pinia'
import { ModifyDateNotification, ScheduleNotification, ConsumeNotification, CancelNotification, BindCourseNotification, RenewCourseNotification } from '../types/notification'

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
		templateMessage(s:ScheduleNotification[]|
						ModifyDateNotification[]|
						ConsumeNotification[]|
						CancelNotification[]|
						BindCourseNotification[]|
						RenewCourseNotification[], type:string) {
			sender_co.templateMessage(s, type)
		}
	}
})