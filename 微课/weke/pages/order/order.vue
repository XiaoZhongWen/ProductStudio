<template>
	<z-paging ref="paging" :fixed="true" v-model="orderList" @query="order_query">
		<template v-for="order in orderList" :key="order._id">
			<view class="order-container">
				<OrderCard :order="order" />
			</view>
		</template>
	</z-paging>
</template>

<script setup lang="ts">
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { ref, watch } from '../../uni_modules/lime-shared/vue';
import OrderCard from './components/order_card.vue'
import { useOrdersStore } from "@/store/orders"
import { useUsersStore } from "@/store/users"
import { Order } from '../../types/order';
import useZPaging from "@/uni_modules/z-paging/components/z-paging/js/hooks/useZPaging.js";
import { storeToRefs } from 'pinia';

const orderStore = useOrdersStore()
const userStore = useUsersStore()
const paging = ref(null)
const orderList = ref<Order[]>([])
const global = getApp().globalData!

onLoad(() => {
	uni.getStorage({
		key: 'wk-login',
		success: () => {
			uni.$on(global.event_name.loginFail, () => {
				toLogin()
			})
		},
		fail: () => {
			toLogin()
		}
	})
})

onUnload(() => {
	uni.$off(global.event_name.loginFail)
})

useZPaging(orderList)

const { isLogin } = storeToRefs(userStore)
watch(isLogin, () => {
	if (isLogin) {
		paging.value?.reload()
	}
})

const order_query = async (pageNo:number, pageSize:number) => {
	if (userStore.isLogin) {
		let before = Number.MAX_VALUE
		if (pageNo > 0 && orderList.value.length > 0) {
			const item = orderList.value.slice(-1)[0]
			before = item.create_date
		}
		const orders = await orderStore.fetchOrders(userStore.owner.openid, before)
		paging.value?.complete(orders)
	}
}

const toLogin = () => {
	uni.showModal({
		title: global.appName,
		confirmText: "去登录",
		success: (res) => {
			if (res.confirm) {
				uni.switchTab({
					url: "/pages/mine/mine",
					success: () => {
						uni.$emit("backToOrder")
					}
				})
			}
		}
	})
}

</script>

<style lang="scss" scoped>
.order-container {
	display: flex;
	flex-direction: column;
	margin: $uni-spacing-col-base 0;
}
</style>
