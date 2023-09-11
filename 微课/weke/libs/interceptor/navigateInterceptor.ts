import { useUsersStore } from "@/store/users"
import { error } from "console"

export default function() {
	const usersStore = useUsersStore()
	uni.addInterceptor('navigateTo', {
		invoke(e) {
			console.info("Interceptor navigateTo, isLogin: " + usersStore.isLogin)
			if (!usersStore.isLogin) {
				uni.showToast({
					title: "请登录"
				})
			}
			return usersStore.isLogin
		}
	})
	console.info("addInterceptor")
}