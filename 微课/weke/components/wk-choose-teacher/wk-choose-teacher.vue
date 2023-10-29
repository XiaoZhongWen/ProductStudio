<template>
	<view class="choose-teacher-container">
		<view class="header">
			<text>选择老师</text>
			<view class="confirm" v-if="selectedId.length > 0" @tap="onConfirmTap">
				确定
			</view>
		</view>
		<scroll-view class="body" scroll-y="true">
			<view class="cell" v-for="teacher in teachers" :key="teacher._id" @tap="onTeacherTap(teacher._id)">
				<view class="left">
					<wk-icon
						class="icon"
						:url="teacher.avatarUrl"
						:text="briefName(teacher.nickName)">
					</wk-icon>
					<view class="nickName">
						{{teacher.nickName}}
					</view>
				</view>
				<view class="right" v-if="selectedId === teacher._id">
					<uni-icons type="checkmarkempty" color="#5073D6"></uni-icons>
				</view>
			</view>
		</scroll-view>
		<view class="bottom"></view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { onMounted, ref } from "../../uni_modules/lime-shared/vue";
import { User } from "../../types/user";
const props = defineProps(['entryId'])
const emit = defineEmits(['onConfirm'])
const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const teachers = ref<User[]>([])
const selectedId = ref('')

onMounted(async () => {
	const res = usersStore.entries.filter(entry => entry._id === props.entryId)
	if (res.length === 1) {
		const entry = res[0]
		const orgs = useOrgs.orgs.filter(org => org._id === entry.orgId)
		if (orgs.length === 1) {
			const org = orgs[0]
			teachers.value = await usersStore.fetchUsers(org.teacherIds ?? []) as User[]
		}
	}
})

const onTeacherTap = (id:string) => {
	selectedId.value = id
}

const onConfirmTap = () => {
	emit('onConfirm', { teacherId: selectedId.value })
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
.choose-teacher-container {
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