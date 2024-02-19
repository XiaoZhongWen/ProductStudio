// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129

let uobc = require('uni-open-bridge-common')
const crypto = require('crypto')
const key = {
	"dcloudAppid": "__UNI__1226721",
	"platform": "weixin-h5"
}

module.exports = {
	_before: function () { // 通用预处理器

	},
	async scheduleSuccessMessage(code) {
		try {
			const { access_token } = await uobc.getAccessToken(key)
			const result = await uniCloud.httpclient.request('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token, {
				method:'POST',
				data:{
					"touser": "oTYu_6UxjfCC8Pt6WDK_qiPzu7hY",
					"template_id": "7svCP-LitRyI_EXA12KLb6ojKoZtv7lEJSgH5XeWChs",
					"data": {
						"thing1": {
							"value": "雅思口语课"
						},
						"thing5": {
							"value": "Julien"
						},
						"thing4": {
							"value": "肖兮子"
						},
						"time2": {
							"value": "2023-08-08 10:00"
						}
					}
				},
				contentType: 'json',
				dataType: 'json'
			})
			console.info(result)
			// const db = uniCloud.database()
			// const res = await db.collection("wk-app").field({"h5":true}).get()
			// const data = res.data
			// if (data.length > 0) {
			// 	const { appid, appsecret } = data[0].h5
			// 	const session = await uniCloud.httpclient.request('https://api.weixin.qq.com/sns/jscode2session', {
			// 			   method:"GET",
			// 			   data:{
			// 				   appid: appid,
			// 				   secret: appsecret,
			// 				   js_code: code,
			// 				   grant_type: 'authorization_code'
			// 			   },
			// 			   dataType:"json"
			// 	})
			// 	const { openid } = session.data
			// 	const result = await uniCloud.httpclient.request('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token, {
			// 		method:'POST',
			// 		data:{
			// 			"touser": "oTYu_6UxjfCC8Pt6WDK_qiPzu7hY",
			// 			"template_id": "7svCP-LitRyI_EXA12KLb6ojKoZtv7lEJSgH5XeWChs",
			// 			"data": {
			// 				"thing1": {
			// 					"value": "雅思口语课"
			// 				},
			// 				"thing5": {
			// 					"value": "Julien"
			// 				},
			// 				"thing4": {
			// 					"value": "肖兮子"
			// 				},
			// 				"time2": {
			// 					"value": "2023-08-08 10:00"
			// 				},
			// 			}
			// 		}
			// 	})
			// 	console.info(result)
			// }
			// console.info(access_token)
		} catch(e) {
			console.info(e)
		}
	},
	async publicAccount(ctx) {
		const httpInfo = this.getHttpInfo()
		let body = httpInfo.body
		if(httpInfo.isBase64Encoded){
		    body = Buffer.from(body, 'base64').toString('utf8')
			console.info("base64")
		}
		console.info(body)
		const db = uniCloud.database()
		const res = await db.collection("wk-tokens").where({
			"platform": "wxfwh"
		}).field({"token":true}).get()
		if (res.data.length === 1) {
			const { token } = res.data[0]
			let {signature = '', timestamp = '', nonce = '', echostr = ''} = ctx
			// 验证token
			let str = [token, timestamp, nonce].sort().join('')
			let sha1 = crypto.createHash('sha1').update(str).digest('hex')
			if (sha1 !== signature) {
				return 'token验证失败'
			} else {
				return echostr
			}
		}
	}
}
