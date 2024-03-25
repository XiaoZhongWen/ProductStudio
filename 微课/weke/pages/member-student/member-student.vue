<template>
	<view class="org-container">
		<view class="top">
			<upload-image
				editable
				class="portrait"
				:url="avatarUrl"
				prompt="头像"
				@onChooseAvatar="onChooseAvatar">
			</upload-image>
			<view class="child-name">
				<uni-easyinput
					class="uni-mt-5" 
					:clearable="false"
					:suffixIcon="isShowEditIcon?'checkbox':''" 
					v-model="childName" 
					placeholder="更新名字"
					@focus="onFocus"
					@iconClick="onUpdated">
				</uni-easyinput>
			</view>
		</view>
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
import { Student } from '../../types/user';

const global = getApp().globalData!

const usersStore = useUsersStore()
const _id = ref<string>('')
let _studentNo = ''
const childName = ref('')
const isShowEditIcon = ref(false)

onLoad(async (option) => {
	const { id } = option as {id:string}
	if (typeof(id) !== 'undefined' && id.length > 0) {
		_id.value = id
		const s = [...usersStore.children, ...usersStore.students]
		const res = s.filter(child => child._id === id)
		if (res.length > 0) {
			const student:Student = res[0]
			_studentNo = student.studentNo
			uni.setNavigationBarTitle({
				title: student.nickName ?? ''
			})
			childName.value = student.nickName
		}
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
				to: `/pages/teacher/teacher?id=${_studentNo}`
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

// @ts-ignore
const avatarUrl = computed({
	get() {
		const s = [...usersStore.children, ...usersStore.students]
		const res = s.filter(student => student._id === _id.value)
		if (res.length > 0) {
			const student:Student = res[0]
			if (typeof(student.avatarUrl) === 'undefined' || student.avatarUrl.length === 0) {
				return ""
			} else {
				return student.avatarUrl
			}
		} else {
			return ""
		}
	}
})

const onChooseAvatar = async (data:{url:string}) => {
	const url = data.url ?? ""
	const res = await usersStore.updateStudentAvatar(_id.value, url)
	uni.showToast({
		title: res? "更新成功":"更新失败",
		duration: global.duration_toast,
		icon: res? "success": "none"
	})
}

const onFocus = () => {
	isShowEditIcon.value = true
}

const onUpdated = async () => {
	const res = await usersStore.updateStudentNickname(_id.value, childName.value)
	if (res) {
		uni.setNavigationBarTitle({
			title: childName.value
		})
		isShowEditIcon.value = false
	}
	uni.showToast({
		title: res? "更新成功":"更新失败",
		duration: global.duration_toast,
		icon: res? "success": "none"
	})
}

</script>

<style lang="scss">
.org-container {
	margin-top: $uni-spacing-col-lg;
	.top {
		padding-bottom: 20px;
		.child-name {
			margin: $uni-spacing-row-base $uni-spacing-row-base 0 $uni-spacing-row-base;
			.uni-easyinput__content-input {
				text-align: center;
			}
		}
	}
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
