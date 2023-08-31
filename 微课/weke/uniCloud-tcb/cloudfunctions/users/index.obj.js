// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const mp_wx_data = {
	AppID:'wx53884ee4fcbb9a5b',
	AppSecret:'5bf343c79753aa2f2d4e9283886b2aa3'
}
module.exports = {
	_before: function () { // 通用预处理器

	},
    async code2Session(code) {
	   const session = await uniCloud.httpclient.request('https://api.weixin.qq.com/sns/jscode2session', {
		   method:"GET",
		   data:{
			   appid: mp_wx_data.AppID,
			   secret: mp_wx_data.AppSecret,
			   js_code: code,
			   grant_type: 'authorization_code'
		   },
		   dataType:"json"
	   })
	   return session
   }
}
