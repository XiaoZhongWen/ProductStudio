<template>
	<view class="member-center-container">
		<view class="member-card-container" v-if="!usersStore.owner.isSubscribed">
			<template v-for="option in memberOptions" :key="option._id">
				<member-card 
					:option="option"
					:selectedOption="selectedOption"
					@tap="onCardTap(option)"/>
			</template>
		</view>
		<view class="renew-info" v-else>
			<view class="row first">
				<view class="left">已开启自动续费</view>
				<view class="right">
					<text class="close">关闭自动续费</text>
				</view>
			</view>
			<view class="row">
				<view class="left">下次续费金额</view>
				<view class="right">5.9元</view>
			</view>
			<view class="row">
				<view class="left">下次续费日期</view>
				<view class="right">2024-02-17</view>
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
		<button v-if="!usersStore.owner.isSubscribed" class="btn" type="default" @tap="onTapAgree">{{confirm}}</button>
		<view v-if="!usersStore.owner.isSubscribed" class="policy" @tap="onPolicyTap">
			<label class="radio">
				<radio 
					:checked="checked"
					style="transform:scale(0.7)" 
					color="#5073D6" />
				<text>开通会员代表接受</text>
				<text class="member-service" @tap.stop="onMemberService">《会员服务协议》</text>
				<text v-if="selectedOption !== 2">与</text>
				<text v-if="selectedOption !== 2" class="auto" @tap.stop="onAutoService">《自动续费协议》</text>
			</label>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMemberStore } from "@/store/member"
import { useUsersStore } from "@/store/users"
import MemberCard from "./components/member-card.vue"
import { MemberOption } from "../../types/MemberOption";
import { yyyyMMdd } from '@/utils/wk-date'

const memberStore = useMemberStore()
const usersStore = useUsersStore()
const memberOptions = ref<MemberOption[]>([])
const selectedOption = ref(0)
const checked = ref(false)

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

onMounted(async () => {
	const options = await memberStore.fetchMemberOptions()
	memberOptions.value = options
})

const indate = computed(() => {
	const expireDate = usersStore.owner.expireDate
	if (expireDate < Date.now()) {
		return "会员已于" + yyyyMMdd(new Date(expireDate)) + "过期"
	} else {
		return "会员有效期至" + yyyyMMdd(new Date(expireDate))
	}
})

const confirm = computed(() => {
	if (memberOptions.value.length === 0) {
		return ""
	}
	return "确认协议并以¥" + memberOptions.value[selectedOption.value].charge + "激活"
})

const onCardTap = (option:MemberOption) => {
	selectedOption.value = option.type
}

const onPolicyTap = () => {
	checked.value = !checked.value
}

const onMemberService = () => {
	
}

const onAutoService = () => {
	
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
