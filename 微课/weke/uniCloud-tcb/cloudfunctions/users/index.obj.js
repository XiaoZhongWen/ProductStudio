// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
// @ts-ignore
const md5 = require('js-md5')
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
	* 身份验证
	* @param {Object} stuNo
	* @param {Object} pwd
	*/
   async authStuIdentity(stuNo, pwd) {
	   const db = uniCloud.database()
	   const res = await db.collection('wk-student').where({
		   studentNo: stuNo,
		   pwd: pwd
	   }).get()
	   if (res.data.length === 1) {
		   return res.data[0]
	   } else {
		   return {}
	   }
   },
   /**
	* 更改密码
	* @param {Object} originalPwd
	* @param {Object} pwd
	*/
   async changePassword(studentNo, originalPwd, pwd) {
	   let result = false
	   if (typeof(studentNo) === 'undefined' || studentNo.length === 0 ||
			typeof(originalPwd) === 'undefined' || originalPwd.length === 0 ||
	   		typeof(pwd) === 'undefined' || pwd.length === 0) {
	   		return result
	   	}
		const db = uniCloud.database()
		let res = await db.collection('wk-student').where({
			studentNo: studentNo
		}).get()
		if (res.data.length === 1) {
			const student = res.data[0]
			if (student.pwd === md5(originalPwd)) {
				if (originalPwd !== pwd) {
					res = await db.collection('wk-student').where({
						studentNo: studentNo
					}).update({
						pwd: md5(pwd)
					})
				}
				result = res.updated === 1
			}
		}
		return result
   },
   /**
	* @param {Object} student
	*/
   async updateStudent(student) {
	   let update = {}
	   const { studentNo, nickName, avatarId, mobile, status, signature, pwd } = student
	   if (typeof(studentNo) === 'undefined' || studentNo.length === 0) {
		   return {}
	   }
	   if (typeof(nickName) !== 'undefined' && nickName.length !== 0) {
		   update.nickName = nickName
	   }
	   if (typeof(avatarId) !== 'undefined' && avatarId.length !== 0) {
	   		update.avatarId = avatarId
	   }
	   if (typeof(mobile) !== 'undefined' && mobile.length !== 0) {
	   		update.mobile = mobile
	   }
	   if (typeof(status) !== 'undefined') {
	   		update.status = status
	   }
	   if (typeof(signature) !== 'undefined' && signature.length !== 0) {
	   		update.signature = signature
	   }
	   if (typeof(pwd) !== 'undefined' && pwd.length !== 0) {
	   		update.pwd = pwd
	   }
	   const db = uniCloud.database()
	   const res = await db.collection('wk-student').where({
		   studentNo: studentNo
	   }).update(update)
   },
   /**
	* 更新学员头像
	*/
   async updateStudentAvatarId(stuNo, fileId) {
	   let result = false
	   if (typeof(stuNo) === 'undefined' || stuNo.length === 0 ||
			typeof(fileId) === 'undefined' || fileId.length === 0) {
			return result
		}
		const db = uniCloud.database()
		const res = await db.collection('wk-student').where({
			studentNo: stuNo
		}).update({
			avatarId: fileId
		})
		result = res.updated === 1
		return result
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
   },
   
   /**
	* 更新角色
	* @param {Object} userId
	* @param {Object} roleIds
	*/
   updateRoles(userId, roleIds) {
	   const db = uniCloud.database()
	   db.collection('wk-users').where({
		   _id: userId
	   }).update({
		   roles: roleIds
	   })
   },
   
   /**
	* 更新个性签名
	* @param {Object} userId
	* @param {Object} signature
	*/
   updateSignature(userId, signature, from) {
	   let dbName = 'wk-users'
	   if (from === 'stuNo') {
		   dbName = 'wk-student'
	   }
	   if (signature.length <= 50) {
		   const db = uniCloud.database()
		   db.collection(dbName).where({
		   		_id: userId
		   }).update({
		   	   signature: signature
		   })
	   }
   },
   
   /**
	* 机构负责人 - 获取机构所有学员
	* 老师 - 获取匿名机构所有学员 + 有教学关系的学员
	* 家长 - 获取与孩子学习相同课程的学员
	* 学员 - 获取学习相同课程的学员
	* @param {Object} param
	*/
   async fetchStudents(param) {
	   const { userId, roles, studentNo, from } = param
	   if (typeof(from) === 'undefined' || from.length === 0) {
		   return []
	   }
	   const db = uniCloud.database()
	   const studentIds = []
	   const studentNos = []
	   if (from === 'wx') {
		   if (typeof(userId) === 'undefined' || userId.length === 0 ||
			   typeof(roles) === 'undefined' || roles.length === 0) {
			   return []
		   }
		   if (roles.includes(1)) {
			   // 机构负责人
			   const res = await db.collection('wk-orgs').where({
				   creatorId: userId
			   }).get()
			   if (res.data.length > 0) {
				   res.data.forEach(org => {
					   org.studentIds.forEach(id => {
						   if (!studentIds.includes(id)) {
							   studentIds.push(id)
						   }
					   })
				   })
			   }
		   }
		   if (roles.includes(2)) {
			   // 老师
			   const res = await db.collection('wk-mapping').where({
				   teacherId: userId
			   }).get()
			   if (res.data.length > 0) {
				   res.data.forEach(entry => {
					   if (!studentNos.includes(entry.studentId)) {
						   studentNos.push(entry.studentId)
					   }
				   })
			   }
		   }
		   if (roles.includes(3)) {
		   	   // 家长
			   let res = await db.collection('wk-student').where({
			   		associateIds: userId
			   }).get()
			   if (res.data.length > 0) {
				   for (let student of res.data) {
					   if (!studentNos.includes(student.studentNo)) {
					   		studentNos.push(student.studentNo)
					   }
					   let result = await db.collection('wk-mapping').where({
						   studentId: student.studentNo
					   }).get()
					   if (result.data.length > 0) {
						   const courseIds = result.data.map(entry => entry.courseId)
						   const dbCmd = db.command
						   result = await db.collection('wk-mapping').where({
							   courseId: dbCmd.in(courseIds)
					   	   }).get()
						   result.data.forEach(entry => {
							   if (!studentNos.includes(entry.studentId)) {
								   studentNos.push(entry.studentId)
								}
							})
					   }
				   }
			   }
		   }
	   } else {
		   // 学员
		   if (typeof(studentNo) === 'undefined' || studentNo.length === 0) {
			   return []
		   }
		   studentNos.push(studentNo)
		   let res = await db.collection('wk-mapping').where({
			   studentId: studentNo
		   }).get()
		   if (res.data.length > 0) {
			   const courseIds = res.data.map(entry => entry.courseId)
			   const dbCmd = db.command
			   res = await db.collection('wk-mapping').where({
			   		courseId: dbCmd.in(courseIds)
			   }).get()
			   res.data.forEach(entry => {
				   if (!studentNos.includes(entry.studentId)) {
					   studentNos.push(entry.studentId)
				   }
			   })
		   }
	   }
	   
	   const fromSId = []
	   const fromSNo = []
	   const fromAssociate = []
	   const total = []
	   const dbCmd = db.command
	   if (studentIds.length > 0) {
		   const res = await db.collection('wk-student').where({
				_id: dbCmd.in(studentIds)
		   }).get()
		   fromSId.push(...res.data)
		   total.push(...fromSId)
	   }
	   if (studentNos.length > 0) {
		   const res = await db.collection('wk-student').where({
		   		studentNo: dbCmd.in(studentNos)
		   }).get()
		   fromSNo.push(...res.data)
		   fromSNo.forEach(stu => {
			   const index = total.findIndex(student => student._id === stu._id)
			   if (index === -1) {
				   total.push(stu)
			   }
		   })
	   }
	   
	   const res = await db.collection('wk-student').where({
		   associateIds: userId
	   }).get()
	   fromAssociate.push(...res.data)
	   fromAssociate.forEach(stu => {
		   const index = total.findIndex(student => student._id === stu._id)
		   if (index === -1) {
			   total.push(stu)
			}
	   })
	   return total
   },
   
   /**
   	* 通过学员id获取学员信息
   	* @param {Object} userId
   	*/
   async fetchStudentsByIds(ids) {
	   const db = uniCloud.database()
	   const dbCmd = db.command
	   const res = await db.collection('wk-student').where({
	   		_id: dbCmd.in(ids)
	   }).get()
	   return res.data
   },
   
   /**
	* 通过学员学号获取学员信息
	* @param {Object} studentNo
	*/
   async fetchStudentByNo(studentNo) {
	   if (typeof(studentNo) === 'undefined' || studentNo.length !== 8) {
		   return {}
	   }
	   const db = uniCloud.database()
	   const dbCmd = db.command
	   const res = await db.collection('wk-student').where({
	   		studentNo: studentNo
	   }).get()
	   return res.data[0]
   },
   
   /**
	* 获取指定用户
	* @param {Object} phoneNumber
	*/
   async fetchUserByPhoneNumber(phoneNumber) {
	   let user = {}
	   const db = uniCloud.database()
	   const res = await db.collection('wk-users').where({
	   		mobile: phoneNumber
	   }).get()
	   if (res.data.length === 1) {
	   		user = res.data[0]
	   }
	   return user
   },
   
   /**
   	* 获取用户
   	* @param {Object} userId
   	*/
   async fetchUsers(userIds) {
	   const db = uniCloud.database()
	   const dbCmd = db.command
	   const res = await db.collection('wk-users').where({
			_id: dbCmd.in(userIds)
	   }).get()
	   return res.data
   },
   
   /**
	* 创建学生记录
	* @param {Object} name 		学生姓名
	* @param {Object} mobile	关联手机号
	*/
   async createStudent(name, mobile) {
	   if (typeof(name) === 'undefined' || name.length === 0 ||
			typeof(mobile) === 'undefined' || mobile.length === 0) {
	   		return {}
		}
		const identity = md5(name + "-" + mobile)
		const db = uniCloud.database()
		let res = await db.collection('wk-student').where({
			identity: identity
		}).get()
		if (res.data.length > 0) {
			return res.data[0]
		}
		res = await db.collection('wk-student').count()
		const suffix = (res.total + 1).toString()
		const studentNo = "0".repeat(8 - suffix.length) + suffix
		res = await db.collection('wk-student').add({
			studentNo: studentNo,
			nickName: name,
			registerDate: Date.now(),
			pwd: md5(studentNo),
			identity: identity,
			status: 0
		})
		if (res.inserted === 1) {
			return {
				_id: res.id,
				studentNo: studentNo,
				identity: identity,
				nickName: name,
			}
		} else {
			return {}
		}
   },
   
   /**
	* 绑定学号
	* @param {Object} studentNo
	* @param {Object} bindId
	*/
   async bindStudentNo(studentNo, bindId) {
	   let result = false
	   if (typeof(studentNo) === 'undefined' || studentNo.length === 0 ||
			typeof(bindId) === 'undefined' || bindId.length === 0) {
			return result
		}
		const db = uniCloud.database()
		let res = await db.collection('wk-student').where({
			studentNo: studentNo
		}).get()
		
		if (res.data.length === 0) {
			result = false
		} else {
			const student = res.data[0]
			const associateIds = student.associateIds ?? []
			if (associateIds.includes(bindId)) {
				result = true
			} else {
				res = await db.collection('wk-student').where({
					studentNo: studentNo
				}).update({
					associateIds: [
						...associateIds,
						bindId
					]
				})
				result = res.updated === 1
			}
		}
	   return result
   },
   
   /**
   	* 解除绑定学号
   	* @param {Object} studentNo
   	* @param {Object} bindId
   	*/
   async unbindStudentNo(studentNo, bindId) {
	   let result = false
	   if (typeof(studentNo) === 'undefined' || studentNo.length === 0 ||
	   			typeof(bindId) === 'undefined' || bindId.length === 0) {
			return result
	   	}
		const db = uniCloud.database()
		let res = await db.collection('wk-student').where({
			studentNo: studentNo
		}).get()
		if (res.data.length === 0) {
			result = false
		} else {
			const student = res.data[0]
			const associateIds = student.associateIds ?? []
			const index = associateIds.findIndex(id => bindId === id)
			if (index !== -1) {
				associateIds.splice(index, 1)
				res = await db.collection('wk-student').where({
					studentNo: studentNo
				}).update({
					associateIds: associateIds
				})
				result = res.updated === 1
			}
		}
	   return result
   }
}
