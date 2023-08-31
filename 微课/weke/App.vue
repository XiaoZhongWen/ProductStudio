<script>
	import { useUsersStore } from "@/store/users"
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			const usersStore = useUsersStore()
			usersStore.login()
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData: {
			duration_toast: 2000,
			login_failure_toast: "登录失败",
			auth_request_failure_toast: "个人信息获取失败",
			user_info_request_auth: "完善您的个人信息"
		}
	}
</script>

<style>
::-webkit-scrollbar {  
    display: none;  
    width: 0 !important;  
    height: 0 !important;  
    -webkit-appearance: none;  
    background: transparent;  
}
	/*每个页面公共css */
	page {
		background-color: #F2F4FD;
	}
</style>
