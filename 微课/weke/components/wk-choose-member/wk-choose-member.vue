<template>
	<view class="choose-member-container">
		<view class="header">
			<text>{{title}}</text>
			<view 
				class="confirm" 
				v-if="selectedId.length > 0 || 
					selectedIds.length > 0" 
				@tap="onConfirmTap">
				确定{{'('+ count + ')'}}
			</view>
		</view>
		<scroll-view class="body" scroll-y="true">
			<view class="cell" v-for="member in members" :key="member._id" @tap="onMemberTap(member._id)">
				<view class="left">
					<wk-icon
						class="icon"
						:url="member.avatarUrl"
						:text="briefName(member.nickName)">
					</wk-icon>
					<view class="nickName">
						{{member.nickName}}
					</view>
				</view>
				<template v-if="chooseType === 'single'">
					<view class="right" v-if="selectedId === member._id">
						<uni-icons type="checkmarkempty" color="#5073D6"></uni-icons>
					</view>
				</template>
				<template v-else-if="chooseType === 'multiple'">
					<view class="right" v-if="invitedMemberIds.includes(member._id)">
						<uni-icons type="checkbox-filled" color="#c8c7cc" size="24"></uni-icons>
					</view>
					<view class="right" v-else>
						<uni-icons 
							:type="selectedIds.includes(member._id)?'checkbox-filled':'circle'"
							:color="selectedIds.includes(member._id)?'#5073D6':'#c8c7cc'"
							size="24">
						</uni-icons>
					</view>
				</template>
				<template v-else-if="chooseType === 'remove'">
					<view class="right">
						<uni-icons 
							:type="selectedIds.includes(member._id)?'checkbox-filled':'circle'"
							:color="selectedIds.includes(member._id)?'#5073D6':'#c8c7cc'"
							size="24"></uni-icons>
					</view>
				</template>
			</view>
		</scroll-view>
		<view class="bottom"></view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { computed, ref } from "../../uni_modules/lime-shared/vue";
import { Student, User } from "../../types/user";
const emit = defineEmits(['onConfirm'])
const usersStore = useUsersStore()
const members = ref<User[]|Student[]>([])
const selectedId = ref('')
const selectedIds = ref<string[]>([])
const invitedMemberIds = ref<string[]>([])

const chooseType = ref('single')
const title = ref('')

const initial = async (data:{
	memberIds: string[],
	type: string,
	role: string,
	invitedIds?: string[]
}) => {
	const { memberIds, type, role, invitedIds } = data
	if (typeof(memberIds) === 'undefined' ||
		typeof(type) === 'undefined' ||
		typeof(role) === 'undefined' ||
		(type === "multiple" && (typeof(invitedIds) === 'undefined'))) {
		return
	}
	chooseType.value = type
	if (type === "multiple" && (typeof(invitedIds) !== 'undefined')) {
		invitedMemberIds.value = invitedIds ?? []
	}
	if (type === 'single' || type === 'multiple') {
		title.value = "选择"
	} else if (type === 'remove') {
		title.value = "移除"
		invitedMemberIds.value = []
	}
	if (role === 'teacher') {
		members.value = await usersStore.fetchUsers(memberIds ?? []) as User[]
	} else if (role === 'student') {
		members.value = usersStore.students.filter(student => memberIds.includes(student._id)) as Student[]
	}
	selectedIds.value = []
}

defineExpose({
	initial
})

const onMemberTap = (id:string) => {
	if (chooseType.value === 'remove' || chooseType.value === 'multiple') {
		if (invitedMemberIds.value.includes(id)) {
			return
		}
		const index = selectedIds.value.indexOf(id)
		if (index === -1) {
			selectedIds.value.push(id)
		} else {
			selectedIds.value.splice(index, 1)
		}
	} else if (chooseType.value === 'single') {
		selectedId.value = id
	}
}

const onConfirmTap = () => {
	if (chooseType.value === 'single') {
		emit('onConfirm', { memberId: selectedId.value })
	} else if (chooseType.value === 'multiple' || chooseType.value === 'remove') {
		emit('onConfirm', { 
			type: chooseType.value,
			memberIds: [...selectedIds.value]
		})
	}
}

const count = computed(() => {
	if (chooseType.value === 'single') {
		return ''
	} else {
		return selectedIds.value.length
	}
})

const briefName = (name:string) => {
	const length = name.length
	if (length < 3) {
		return name
	} else {
		return name.substring(length - 2)
	}
}

</script>

<style lang="scss" scoped>
.choose-member-container {
	display: flex;
	flex-direction: column;
	.header {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 44px;
		background-color: $wk-bg-color-grey;
		border-radius: $uni-border-radius-lg $uni-border-radius-lg 0px 0px;
		font-size: $uni-font-size-lg;
		color: $wk-text-color;
		.confirm {
			position: absolute;
			right: $uni-padding-normal;
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-base;
			padding: $uni-padding-sm $uni-padding-base $uni-padding-sm $uni-padding-base;
			border-radius: $uni-border-radius-base;
		}
	}
	.body {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 300px;
		background-color: white;
		.cell {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			height: 60px;
			padding: $uni-padding-normal $uni-spacing-row-lg $uni-padding-normal $uni-spacing-row-lg;
			box-sizing: border-box;
			border-bottom: 1px solid $wk-bg-color-grey;
			.left {
				display: flex;
				flex-direction: row;
				align-items: center;
				flex: 1;
				font-size: $uni-font-size-base;
				color: $wk-text-color;
				.icon {
					width: 40px;
					height: 40px;
					border-radius: $uni-border-radius-circle;
					padding-top: $uni-spacing-col-sm;
				}
				.nickName {
					margin-left: $uni-spacing-col-lg;
				}
			}
		}
	}
	.bottom {
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 35px;
		background-color: white;
	}
}
</style>