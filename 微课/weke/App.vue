<script>
	import { useUsersStore } from "@/store/users"
	import { watch } from 'vue'
	import { storeToRefs } from 'pinia'
	import navigateInterceptor from './libs/interceptor/navigateInterceptor'
	export default {
		data() {
			const usersStore = useUsersStore()
			return {
				usersStore
			}
		},
		onLaunch: function() {
			console.log('App Launch')
			navigateInterceptor()
		},
		onShow: function() {
			this.usersStore.login()
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData: {
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
				onGradientChanged: "onGradientChanged"
			}
		}
	}
</script>

<style lang="scss">
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
