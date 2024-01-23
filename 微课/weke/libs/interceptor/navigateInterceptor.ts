import { useUsersStore } from "@/store/users"

export default function() {
	const usersStore = useUsersStore()
	uni.addInterceptor('navigateTo', {
		invoke(e) {
			if (!usersStore.isLogin) {
				uni.showToast({
					title: "请登录",
					icon:"none"
				})
			}
			return usersStore.isLogin
		}
	})
}