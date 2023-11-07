<template>
	<view class="org-student-container">
		<template v-for="student in students" :key="student._id">
			<view @longpress="onLongPress" :id="student._id" class="cell">
				<uni-icons 
					v-if="selectedId === student._id"
					class="icon-minus" 
					type="minus-filled" 
					color="#dd524d" 
					size="24" 
					@tap="onDeleteTap">
				</uni-icons>
				<wk-portrait
					:url="student.avatarUrl" 
					:name="student.nickName">
				</wk-portrait>
			</view>
		</template>
	</view>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { Student } from '../../../types/user';
import { Org } from '../../../types/org';

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const global = getApp().globalData!
const props = defineProps(['orgId'])
const students = ref<Student[]>([])
const selectedId = ref('')

watchEffect(async() => {
	const anonymousOrgId = useOrgs.anonymousOrg._id
	const res = useOrgs.orgs.filter(org => org._id === props.orgId)
	let org: Org | undefined = undefined
	if (res.length > 0) {
		org = res[0]
	} else if (anonymousOrgId.length > 0 && anonymousOrgId === props.orgId) {
		org = useOrgs.anonymousOrg
	}
	if (typeof(org) !== 'undefined') {
		const users = await usersStore.fetchUsers(org.studentIds ?? [], 'student') as Student[]
		students.value = users
	}
})

const onLongPress = (e) => {
	const { id } = e.currentTarget
	selectedId.value = id
}

const onDeleteTap = async () => {
	const res = students.value.filter(student => student._id === selectedId.value)
	if (res.length === 0) {
		return
	}
	const student = res[0]
	const entries = usersStore.entries.filter(entry => entry.orgId === props.orgId &&
								entry.studentId === student.studentNo &&
								entry.status === 0 &&
								entry.total > entry.consume)
	if (entries.length > 0) {
		uni.showToast({
			title: student.nickName + "还未结课, 不能删除",
			duration:global.duration_toast,
			icon:"none"
		})
		selectedId.value = ''
		return
	}
	uni.showLoading({
		title:"正在删除"
	})
	const result = await useOrgs.removeStudents(props.orgId, [selectedId.value])
	uni.hideLoading()
	uni.showToast({
		title:result?"删除成功":"删除失败",
		duration:global.duration_toast,
		icon:result?"success":"error"
	})
	selectedId.value = ''
	if (result) {
		uni.$emit(global.event_name.didUpdateOrgData)
	}
}

</script>

<style lang="scss" scoped>
.org-student-container {
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	padding: 6px 4px 4px 4px;
	border-top: 0.5px solid $wk-bg-color-grey;
	border-bottom: 0.5px solid $wk-bg-color-grey;
	.cell {
		position: relative;
		.icon-minus {
			position: absolute;
			top: -6px;
		}
	}
}
</style>