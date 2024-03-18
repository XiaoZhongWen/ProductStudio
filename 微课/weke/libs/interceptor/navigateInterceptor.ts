import { useUsersStore } from "@/store/users"

const whiteList = ["/pages/memberCenter/memberCenter", "/uni_modules/uni-pay/pages", "/pages/webPage/webPage"]

export default function() {
	const usersStore = useUsersStore()
	uni.addInterceptor('navigateTo', {
		invoke(e:{url:string}) {
			const { url } = e
			if (!usersStore.isLogin && !url.includes("/pages/webPage/webPage")) {
				uni.showToast({
					title: "请登录",
					icon:"none"
				})
				return false
			}
			const index = whiteList.findIndex(item => url.includes(item))
			if (index !== -1) {
				return true
			}
			const roles = usersStore.owner.roles
			const c1 = roles?.includes(1) || roles?.includes(2)
			const c2 = usersStore.isExpired
			if (c1 && c2) {
				uni.showModal({
					title: "嗒嗒课吧",
					content: "您当前使用的嗒嗒课吧会员账号已过期，请续费成为会员",
					confirmText: "去购买",
					cancelText: "取消",
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url:"/pages/memberCenter/memberCenter"
							})
						}
					}
				})
				return false
			}
			return true
		}
	})
}