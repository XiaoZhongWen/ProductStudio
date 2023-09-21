<template>
	<view class="org-container">
		<uni-list>
			<uni-list-item link v-for="item in org" :key="item.name" :to="item.to">
				<template v-slot:header>
					<view class="slot-box">
						<uni-icons class="icon" :type="item.type" color="#007aff" size=22></uni-icons>
						<text class="slot-text">{{item.name}}</text>
					</view>
				</template>
			</uni-list-item>
		</uni-list>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"
import { User } from '../../types/user';

const usersStore = useUsersStore()
const _id = ref<string>('')

onLoad(async (option) => {
	const { id } = option as {id:string}
	if (typeof(id) !== 'undefined' && id.length > 0) {
		_id.value = id
		const user = await usersStore.fetchUser(id) as User
		uni.setNavigationBarTitle({
			title: user.nickName ?? ''
		})
	}
})

// @ts-ignore
const org:ListItem[] = computed({
	get() {
		let org = [
			{
				type: "shop-filled",
				name: "机构",
				to: `/pages/organization/organization?id=${_id.value}`,
			},
			{
				type: "person-filled",
				name: "老师",
				to: `/pages/teacher/teacher?id=${_id.value}`
			},
			{
				type: "chatboxes-filled",
				name: "班级",
				to: `/pages/grade/grade?id=${_id.value}`
			}
		]
		return org
	}
})

</script>

<style lang="scss">
.org-container {
	margin-top: $uni-spacing-col-lg;
	.uni-list {
		margin: 0 $uni-spacing-row-base;
		border-radius: $uni-border-radius-lg;
		background-color: white;
		.uni-list--border-top, .uni-list--border-bottom {
			height: 0px;
		}
		.uni-list-item {
			border-radius: $uni-border-radius-lg;
		}
	}
	.slot-box {
		flex-direction: row;
		align-items: center;
		.slot-text {
			margin-left: $uni-padding-normal;
			font-size: $uni-font-size-base;
			color: $wk-text-color;
			font-weight: 400;
		}
		.icon {
			width: 30px;
			height: 30px;
			border-radius: $uni-border-radius-circle;
			position: relative;
			top: 3px;
		}
	}
}
</style>
