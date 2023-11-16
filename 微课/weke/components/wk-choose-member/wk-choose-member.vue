<template>
	<view class="choose-member-container">
		<view class="header">
			<text>{{title}}</text>
			<view class="confirm" v-if="selectedId.length > 0" @tap="onConfirmTap">
				确定
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
				<template v-if="props.type === 'single'">
					<view class="right" v-if="selectedId === member._id">
						<uni-icons type="checkmarkempty" color="#5073D6"></uni-icons>
					</view>
				</template>
				<template v-else-if="props.type === 'multiple'">
					<view class="right" v-if="props.selectedIds && props.selectedIds.includes(member._id)">
						<uni-icons type="checkbox-filled" color="#c8c7cc" size="24"></uni-icons>
					</view>
					<view class="right" v-else>
						<uni-icons 
							:type="selectedIds.includes(member._id)?'checkbox-filled':'circle'"
							:color="selectedIds.includes(member._id)?'#5073D6':'#c8c7cc'"
							size="24"></uni-icons>
					</view>
				</template>
				<template v-else-if="props.type === 'remove'">
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
import { onBeforeUpdate, onMounted, ref } from "../../uni_modules/lime-shared/vue";
import { Student, User } from "../../types/user";
const props = defineProps(['memberIds', 'type', 'selectedIds', 'role'])
const emit = defineEmits(['onConfirm'])
const usersStore = useUsersStore()
const members = ref<User[]|Student[]>([])
const selectedId = ref('')
const selectedIds = ref<string[]>([])
const title = ref('')

onMounted(async () => {
	const role = props.role
	if (typeof(role) === 'undefined') {
		return
	}
	if (role === 'teacher') {
		members.value = await usersStore.fetchUsers(props.memberIds ?? []) as User[]
	} else if (role === 'student') {
		members.value = usersStore.students.filter(student => props.memberIds.includes(student._id)) as Student[]
	}
})

onBeforeUpdate(() => {
	if (typeof(props.type) !== 'undefined') {
		if (props.type === 'single' || props.type === 'multiple') {
			title.value = "选择"
		} else if (props.type === 'remove') {
			title.value = "移除"
		}
	}
})

const onMemberTap = (id:string) => {
	if (typeof(props.type) !== 'undefined') {
		if (props.type === 'remove' || props.type === 'multiple') {
			const index = selectedIds.value.indexOf(id)
			if (index === -1) {
				selectedIds.value.push(id)
			} else {
				selectedIds.value.splice(index, 1)
			}
		} else if (props.type === 'single') {
			selectedId.value = id
		}
	}
	console.info(selectedIds.value)
}

const onConfirmTap = () => {
	emit('onConfirm', { memberId: selectedId.value })
}

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