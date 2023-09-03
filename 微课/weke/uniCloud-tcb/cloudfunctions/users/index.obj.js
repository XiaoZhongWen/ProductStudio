// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const mp_wx_data = {
	AppID:'wx53884ee4fcbb9a5b',
	AppSecret:'5bf343c79753aa2f2d4e9283886b2aa3'
}
module.exports = {
	_before: function () { // 通用预处理器

	},
	
	/**
	 * 获取openid、unionid, session_key
	 * @param {string} code wx.login的返回值
	 */
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
   },
   
   /**
	* 身份验证
	* @param {unionid, openid, type}
	* type: wx_unionid | wx_openid
	* @returns userId
	*/
   async authIdentity(identity) {
	   const { unionid, openid, type } = identity
	   let condition = {
		   wx_unionid: unionid
	   }
	   if (type === 'wx_openid') {
		   condition = {
			   wx_openid: openid
		   }
	   }
	   let user = {}
	   const db = uniCloud.database()
	   let res = await db.collection('wk-wx').where(condition).field({'userId':true}).get()
	   if (res.data.length === 1) {
		   const { userId } = res.data[0]
		   res = await db.collection('wk-users').where({
			   _id: userId
		   }).get()
		   if (res.data.length === 1) {
			   user = res.data[0]
		   }
	   }
	   return user
   },
   
   /**
	* 更新用户信息
	* @param {Object} user
	*/
   async updateUser(user) {
	   const { unionid, openid, nickName, avatarId, type } = user
	   let condition = {
			wx_unionid: unionid
	   }
	   if (type === 'wx_openid') {
	   		condition = {
	   		   wx_openid: openid
		   }
	   }
	   // 判断用户是否存在
	   let userId = ''
	   const db = uniCloud.database()
	   let res = await db.collection('wk-wx').where(condition).get()
	   if (res.data.length === 0) {
		   // 用户不存在
		   const timestamp = Date.now()
		   const freeDuration = 1000 * 60 * 60 * 24 * 15
		   res = await db.collection('wk-users').add({
			   nickName: nickName,
			   avatarId: avatarId,
			   registerDate: timestamp,
			   lastLoginDate: timestamp,
			   orgExpireDate: timestamp + freeDuration,
			   familyExpireDate: timestamp + freeDuration
		   })
		   const { id } = res
		   if (typeof(id) !== 'undefined' && id.length > 0) {
			   res = await db.collection('wk-wx').add({
				   wx_unionid: unionid,
				   wx_openid: openid,
				   userId: id
			   })
			   if (typeof(res.id) !== 'undefined' && res.id.length > 0) {
				   userId = id
			   }
		   }
	   } else {
		   // 用户存在
		   const wx = res.data[0]
		   userId = wx.userId
		   res = await db.collection('wk-users').where({
		   		_id: userId
		   }).update({
		   		nickName: nickName,
		   		avatarId: avatarId
		   })
	   }
	   let userInfo = {}
	   if (userId.length > 0) {
		   res = await db.collection('wk-users').where({
			   _id: userId
		   }).get()
		   userInfo = {
			   ...res.data[0],
			   unionid: unionid,
			   openid: openid
		   }
	   }
	   return userInfo
   }
}
