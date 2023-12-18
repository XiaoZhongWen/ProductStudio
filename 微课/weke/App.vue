<script>
	import { useUsersStore } from "@/store/users"
	import { useOrgsStore } from "@/store/orgs"
	import navigateInterceptor from './libs/interceptor/navigateInterceptor'
	export default {
		onLaunch: function() {
			navigateInterceptor()
		},
		onShow: function() {
			uni.getStorage({
				key: 'wk-login',
				success: async (res) => {
					const data = res.data
					if (data.from === 'wx') {
						uni.showLoading({
							title: "正在登录",
							mask: true
						})
						const usersStore = useUsersStore()
						const orgsStore = useOrgsStore()
						const result = await usersStore.login()
						uni.hideLoading()
						uni.showToast({
							title: result? "登录成功": "登录失败",
							duration: this.globalData.duration_toast,
							icon: result? "success": "error"
						})
						if (result) {
							uni.showLoading({
								title: "加载初始数据",
								mask: true
							})
							await usersStore.fetchStudents()
							await usersStore.loadAllEntries()
							await orgsStore.loadOrgData()
							if (usersStore.owner.from === 'wx') {
								await orgsStore.fetchAnonymousOrg()
							}
							uni.hideLoading()
							uni.$emit(this.globalData.didFinishedInitialData)
						}
					}
				}
			})
		},
		onHide: function() {
		},
		globalData: {
			appName: '嗒嗒课吧',
			duration_toast: 2000,
			login_failure_toast: "登录失败",
			auth_request_failure_toast: "个人信息获取失败",
			user_info_request_auth: "完善您的个人信息",
			event_name: {
				showWkProtocol: "Protocol",
				login: "login",
				loginSuccess: "loginSuccess",
				selectRole: "selectRole",
				showSelectRole: "showSelectRole",
				didSelectedRole: "didSelectedRole",
				onGradientChanged: "onGradientChanged",
				didSelectedIcon: "didSelectedIcon",
				didRenewCourse: "didRenewCourse",
				didUpdateCourseData: "didUpdateCourseData",
				didUpdateOrgData: "didUpdateOrgData",
				didUpdatedGradeData: "didUpdatedGradeData",
				didCreateGrade: "didCreateGrade",
				didFinishedInitialData: "didFinishedInitialData"
			}
		}
	}
</script>

<style lang="scss">
@import url("static/iconfont-weapp-icon.css");
@import url("static/iconfont/iconfont.css");
.t-icon {
	width: 30px;
	height: 30px;
}
::-webkit-scrollbar {  
    display: none;  
    width: 0 !important;  
    height: 0 !important;  
    -webkit-appearance: none;  
    background: transparent;  
}
checkbox .wx-checkbox-input.wx-checkbox-input-disabled {
  border : 2rpx solid $wk-bg-color-grey;
  background : $wk-bg-color-grey;
}
checkbox .wx-checkbox-input.wx-checkbox-input-checked {
  border-color: $wk-theme-color !important;
  background : $wk-theme-color !important;
  }
  
  checkbox .wx-checkbox-input.wx-checkbox-input-checked::before {
  width : 20px;
  height : 20px;
  line-height : 20px;
  text-align : center;
  font-size : 15px;
  color : #fff;
  background : transparent;
  transform : translate(-50%, -50%) scale(1);
  -webkit-transform: translate(-50%, -50%) scale(1);
  }
	/*每个页面公共css */
	page {
		background-color: #F2F4FD;
	}
</style>
