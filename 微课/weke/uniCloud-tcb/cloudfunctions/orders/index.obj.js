// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
	_before: function () { // 通用预处理器

	},
	async createOrder(userId, memberId) {
		if (typeof(userId) === 'undefined' || userId.length === 0 ||
			typeof(memberId) === 'undefined' || memberId.length === 0) {
			return ""
		}
		const date = new Date()
		const orderNo = "DD" + date.getFullYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getTime()
		const db = uniCloud.database()
		const data = await db.collection("wk-member").where({
			_id: memberId
		}).count()
		if (data.total === 1) {
			const res = await db.collection("wk-pay-orders").add({
				userId,
				memberId,
				orderNo,
				status: 0
			})
			return res.inserted === 1? orderNo: ""
		} else {
			return ""
		}
	},
	async updateOrder(orderId, status) {
		if (typeof(orderId) === 'undefined' || orderId.length === 0) {
			return false
		}
		const db = uniCloud.database()
		const res = await db.collection("wk-pay-orders").where({
			orderNo: orderId
		}).update({
			status
		})
		return res.updated === 1
	},
	async fetchOrders(openid, before) {
		if (typeof(openid) === 'undefined' ||
			openid.length === 0 || 
			typeof(before) === 'undefined') {
			return []
		}
		const pageSize = 10
		const db = uniCloud.database()
		const dbCmd = db.command
		const res = await db.collection("uni-pay-orders").where({
			openid,
			create_date:dbCmd.lt(before)
		}).limit(pageSize).orderBy("create_date", "desc").get()
		return res.data
	}
}
