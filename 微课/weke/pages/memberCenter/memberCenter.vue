<template>
	<view class="member-center-container">
		<template>
			<view>
				<uni-pay 
					ref="pay" 
					@success="onSuccess" 
					@cancel="onCancel" 
					@fail="onFail">
				</uni-pay>
			</view>
		</template>
		<view class="member-card-container" v-if="isShowPay">
			<template v-for="option in memberOptions" :key="option._id">
				<member-card 
					:option="option"
					:selectedOption="selectedOption"
					@tap="onCardTap(option)"/>
			</template>
		</view>
		<view class="renew-info" v-else>
			<view class="row">
				<view class="left">下次续费日期</view>
				<view class="right">{{expireDate}}</view>
			</view>
		</view>
		<view class="indate">{{indate}}</view>
		<view class="capacity-container">
			<view class="content">
				<text class="capacity">会员权益</text>
				<template v-for="item in capacities" :key="item.title">
					<view class="item">
						<view class="left">
							<text class="icon">{{item.icon}}</text>
						</view>
						<view class="right">
							<text class="title">{{item.title}}</text>
							<text class="desc">{{item.desc}}</text>
						</view>
					</view>
				</template>
			</view>
		</view>
		<button v-if="isShowPay" class="btn" type="default" @tap="onTapAgree">{{confirm}}</button>
		<view v-if="isShowPay" class="policy" @tap="onPolicyTap">
			<label class="radio">
				<radio 
					:checked="checked"
					style="transform:scale(0.7)" 
					color="#5073D6" />
				<text>开通会员代表接受</text>
				<text class="member-service" @tap.stop="onMemberService">《会员服务协议》</text>
			</label>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMemberStore } from "@/store/member"
import { useUsersStore } from "@/store/users"
import { useOrdersStore } from "@/store/orders"
import MemberCard from "./components/member-card.vue"
import { MemberOption } from "../../types/MemberOption";
import { yyyyMMdd } from '@/utils/wk-date'

const memberStore = useMemberStore()
const usersStore = useUsersStore()
const ordersStore = useOrdersStore()
const memberOptions = ref<MemberOption[]>([])
const selectedOption = ref(0)
const checked = ref(false)
const global = getApp().globalData!

const capacities = [{
	icon: "🏫",
	title: "创建机构",
	desc: "可以创建100个机构"
}, {
	icon: "📝",
	title: "创建课表",
	desc: "日程清晰可见"
}, {
	icon: "👩🏻‍🏫",
	title: "添加老师及学生",
	desc: "可以添加500名老师及学生"
}, {
	icon: "⛱",
	title: "标签图标",
	desc: "让老师、学生、班级、课程清晰可见"
}, {
	icon: "🔔",
	title: "消息通知",
	desc: "上课通知、消课通知、课程反馈"
}]

const pay = ref()
const onTapAgree = () => {
	let duration = "3个月"
	if (selectedOption.value === 1) {
		duration = "6个月"
	} else if (selectedOption.value === 2) {
		duration = "12个月"
	}
	if (!checked.value) {
		uni.showModal({
			title: global.appName,
			content: "我已阅读《会员服务协议》，知晓并同意购买" + duration + "的会员服务",
			confirmText: "继续购买",
			success: (res) => {
				if (res.confirm) {
					payOrder()
				}
			}
		})
		return
	} else {
		payOrder()
	}
}

const payOrder = async () => {
	const option = memberOptions.value[selectedOption.value]
	const charge = option.charge * 100
	let description = global.appName + "3个月会员服务"
	if (option.type === 1) {
		description = global.appName + "6个月会员服务"
	} else if (option.type === 2) {
		description = global.appName + "12个月会员服务"
	}
	const order_no = await ordersStore.createOrder(usersStore.owner._id, option._id)
	if (order_no.length > 0) {
		pay.value.open({
			total_fee: charge,
			order_no,
			description,
			type: "goods"
		})
	} else {
		uni.showToast({
			title: "订单支付失败",
			duration: global.duration_toast,
			icon: "none"
		})
	}
}

const onSuccess = async (res:{
		user_order_success:boolean, 
		errCode:number,
		pay_order: {
			order_no: string
		}
	}) => {
	const { errCode, pay_order } = res
	if (errCode === 0) {
		if (res.user_order_success) {
			const { order_no } = pay_order
			// 更新订单状态
			ordersStore.updateOrder(order_no, 1)
			// 更新会员有效期
			usersStore.updateExpiredDate(selectedOption.value)
		}
	}
}

const onCancel = (res) => {
	console.info(res)
}

const onFail = (res) => {
	console.info(res)
}

onMounted(async () => {
	const options = await memberStore.fetchMemberOptions()
	memberOptions.value = options
})

const expireDate = computed(() => {
	const date = usersStore.owner.expireDate
	return yyyyMMdd(new Date(date))
})

const indate = computed(() => {
	const date = usersStore.owner.expireDate
	if (date < Date.now()) {
		return "会员已于" + expireDate.value + "过期"
	} else {
		return "会员有效期至" + expireDate.value
	}
})

const confirm = computed(() => {
	if (memberOptions.value.length === 0) {
		return ""
	}
	return "确认协议并以¥" + memberOptions.value[selectedOption.value].charge + "激活"
})

const isShowPay = computed(() => {
	const c1 = usersStore.owner.isSubscribed
	const c2 = usersStore.isExpired
	return !c1 || c2
})

const onCardTap = (option:MemberOption) => {
	selectedOption.value = option.type
}

const onPolicyTap = () => {
	checked.value = !checked.value
}

const onMemberService = () => {
	uni.navigateTo({
		url: "/pages/webPage/webPage?targetUrl=" + global.domain + "agreement/member/index.html"
	})
}

</script>

<style lang="scss" scoped>
.member-center-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	.member-card-container {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
	.indate {
		width: 100%;
		color: $uni-text-color-grey;
		font-size: $uni-font-size-sm;
		margin: $uni-spacing-col-sm 0 0 24px;
	}
	.renew-info {
		display: flex;
		flex-direction: column;
		background-color: transparent;
		width: 100%;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		.first {
			margin-bottom: $uni-spacing-col-lg;
			.close {
				padding: $uni-padding-sm;
				border-radius: $uni-border-radius-base;
				background-color: $wk-theme-color;
				color: white;
				font-size: $uni-font-size-sm;
			}
		}
		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			border-radius: $uni-border-radius-lg;
			background-color: white;
			padding: $uni-padding-base;
			box-sizing: border-box;
			font-size: $uni-font-size-base;
			color: $wk-text-color;
			height: 40px;
			margin-top: 1px;
			.right {
				color: $uni-text-color-grey;
			}
		}
	}
	.capacity-container {
		background-color: transparent;
		width: 100%;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		.content {
			display: flex;
			flex-direction: column;
			width: 100%;
			background-color: white;
			border-radius: $uni-border-radius-lg;
			padding: $uni-padding-normal;
			box-sizing: border-box;
			.capacity {
				font-weight: bolder;
				color: $wk-text-color;
			}
			.item {
				display: flex;
				flex-direction: row;
				align-items: center;
				height: 60px;
				.left {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 40px;
					height: 40px;
					border-radius: $uni-border-radius-circle;
					background-color: $wk-bg-color-grey;
					.icon {
						position: relative;
						top: -2px;
						font-size: 20px;
					}
				}
				.right {
					display: flex;
					flex-direction: column;
					justify-content: center;
					margin-left: $uni-spacing-row-base;
					.title {
						font-size: $uni-font-size-base;
						color: $wk-text-color;
					}
					.desc {
						font-size: $uni-font-size-sm;
						color: $uni-text-color-grey;
					}
				}
			}
		}
	}
	.btn {
		position: fixed;
		bottom: 120rpx;
		background-color: $wk-theme-color;
		color: white;
		font-size: $uni-font-size-base;
		width: 90%;
	}
	.policy {
		position: fixed;
		bottom: 60rpx;
		color: $uni-text-color-grey;
		font-size: $uni-font-size-sm;
		.member-service, .auto {
			color: $wk-theme-color;
		}
	}
}
</style>
