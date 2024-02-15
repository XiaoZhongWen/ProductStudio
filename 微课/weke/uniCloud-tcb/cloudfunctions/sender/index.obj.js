// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129

let uobc = require('uni-open-bridge-common')
const key = {
	"dcloudAppid": "__UNI__1226721",
	"platform": "weixin-h5"
}

module.exports = {
	_before: function () { // 通用预处理器

	},
	async scheduleSuccessMessage() {
		try {
			const accessToken = await uobc.getAccessToken(key)
			console.info(accessToken)
		} catch(e) {
			console.info(e)
		}
	}
}
