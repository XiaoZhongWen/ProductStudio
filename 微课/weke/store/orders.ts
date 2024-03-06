import { defineStore } from 'pinia'

const orders_co = uniCloud.importObject('orders', {
	customUI: true
})

export const useOrdersStore = defineStore("orders", {
	actions: {
		async createOrder(userId: string, memberId:string) {
			if (typeof(userId) === 'undefined' || userId.length === 0 ||
				typeof(memberId) === 'undefined' || memberId.length === 0) {
				return ""
			}
			const orderNo = await orders_co.createOrder(userId, memberId)
			return orderNo
		},
		async updateOrder(orderId:string, status:number) {
			if (typeof(orderId) === 'undefined' || orderId.length === 0) {
				return false
			}
			const result = await orders_co.updateOrder(orderId, status)
			return result
		},
		async fetchOrders(openid:string, before:number) {
			if (typeof(openid) === 'undefined' || 
				openid.length === 0 || 
				typeof(before) === 'undefined') {
				return []
			}
			const res = await orders_co.fetchOrders(openid, before)
			return res
		}
	}
})