import { useUsersStore } from "@/store/users"

export default function() {
	const usersStore = useUsersStore()
	uni.addInterceptor('navigateTo', {
		invoke(e) {
			console.info("Interceptor navigateTo, isLogin: " + usersStore.isLogin)
			if (!usersStore.isLogin) {
				uni.showToast({
					title: "请登录",
					icon:"error"
				})
			}
			return usersStore.isLogin
		}
	})
	console.info("addInterceptor")
}