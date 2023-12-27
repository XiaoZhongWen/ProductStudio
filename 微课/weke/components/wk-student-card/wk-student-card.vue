<template>
	<view class="student-card">
		<view class="top">
			<member-info
				:url="props.url"
				:nickname="props.name"
				:mobile="`学号: ${props.studentNo}`"
				:signature="props.signature">
			</member-info>
			<wk-circle-progress 
				v-if="total > 0" 
				class="circle-progress" 
				:total="total" 
				:consume="consume">
			</wk-circle-progress>
			<view v-else-if="actualTotal > 0" class="bind">绑定课程</view>
		</view>
		<view class="bottom">
			<text class="text">{{orgNames}}</text>
			<view class="icon-container" @tap.stop="onIconTap">
				<uni-icons id="course" class="icon" type="wallet-filled" color="#5073D6" size="24"></uni-icons>
				<uni-icons id="schedule" class="icon" type="calendar-filled" color="#5073D6" size="24"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, ref } from '../../uni_modules/lime-shared/vue';
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'

const total = ref(0)
const consume = ref(0)
const actualTotal = ref(0)
const orgIds = ref<string[]>([])
const orgNames = ref('')

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const props = defineProps([
	'id', 'url', 'name', 'studentNo', 'signature'
])

onMounted(() => {
	loaddata()
})

const onIconTap = (e:UniHelper.EventTarget) => {
	const { id } = e.target
	if (id === 'course') {
		uni.navigateTo({
			url: "/pages/course-bind/course-bind?studentNo="+props.studentNo+"&orgIds="+orgIds.value
		})
	}
	if (id === 'schedule') {
		
	}
}

const loaddata = () => {
	const userId = usersStore.owner._id
	const studentNo = usersStore.owner.studentNo
	const from = usersStore.owner.from
	const roles = usersStore.owner.roles ?? []
	const orgs = useOrgs.orgs.filter(org => org.studentIds?.includes(props.id))
	const createOrgIds = useOrgs.orgs.filter(org => org.creatorId === userId).map(org => org._id)
	const children = usersStore.students.filter(student => student.associateIds?.includes(userId))
	const childNos = children.map(child => child.studentNo)
	const childIds = children.map(child => child._id)
	const anonymousOrgId = useOrgs.anonymousOrg._id
	const oIds:string[] = []
	const s = orgs.map(org => org._id)
	const entries = usersStore.fetchEntriesWithStudentNo(props.studentNo, s)
	let totalCourse = 0
	let consumeCourse = 0
	let actualTotalCourse = 0
	entries.forEach(entry => {
		// 1. 角色-机构管理员, 课程属于自己所创建的机构
		const isOrgCourse = roles.includes(1) && createOrgIds.includes(entry.orgId)
		// 2. 角色-老师, 课程属于自己所教授的课程以及自己匿名机构的课程
		const isTeacherCourse = roles.includes(2) && (entry.teacherId === userId || entry.orgId === anonymousOrgId)
		// 3. 角色-家长, 课程属于学员绑定的课程
		const isStudentCourse = (roles.includes(3) && childNos.includes(entry.studentId)) || 
								(from === 'stuNo' && studentNo === entry.studentId)
		if (isOrgCourse || isTeacherCourse || isStudentCourse) {
			totalCourse += entry.total
			consumeCourse += entry.consume
		}
		actualTotalCourse += entry.total
	})
	orgs.forEach(org => {
		// 1. 角色-机构管理员, 学员属于自己所创建的机构
		const isOrgCourse = roles.includes(1) && createOrgIds.includes(org._id)
		// 2. 角色-老师, 学员属于自己所任教的机构
		const isTeacherCourse = roles.includes(2) && (org.teacherIds?.includes(userId) || org._id === anonymousOrgId)
		// 3. 角色-家长, 学员属于自己加入的机构
		let isInclude = false
		childIds.forEach(id => {
			if (!isInclude) {
				isInclude = org.studentIds?.includes(id) ?? false
			}
		})
		const isStudentCourse = (roles.includes(3) || from === 'stuNo') && isInclude
		if (isOrgCourse || isTeacherCourse || isStudentCourse) {
			const index = oIds.findIndex(id => id === org._id)
			if (index === -1) {
				oIds.push(org._id)
			}
		}
	})
	orgIds.value = oIds
	total.value = totalCourse
	consume.value = consumeCourse
	actualTotal.value = actualTotalCourse
	
	fetchOrgName()
}

const fetchOrgName = async () => {
	let names = ''
	let index = 0
	for (const orgId of orgIds.value) {
		const res = useOrgs.orgs.filter(org => org._id === orgId)
		if (res.length === 1) {
			const org = res[0]
			names += org.name + " "
			index++
			if (index > 2) {
				names += "等"
				break
			}
		}
	}
	orgNames.value = names
}

defineExpose({
	loaddata
})
	
</script>

<style lang="scss" scoped>
.student-card {
	display: flex;
	flex-direction: column;
	background-color: white;
	margin: $uni-spacing-row-base;
	border-radius: $uni-border-radius-base;
	padding: $uni-padding-normal;
	box-sizing: border-box;
	.top {
		position: relative;
		height: 60px;
		.circle-progress {
			width: 37px;
			height: 54px;
			position: absolute;
			top: 0;
			right: 0;
		}
		.bind {
			position: absolute;
			top: 0;
			right: 0;
			font-size: $uni-font-size-10;
			color: $wk-text-color-grey;
		}
	}
	.bottom {
		position: relative;
		height: 30px;
		.text {
			position: absolute;
			left: 0;
			bottom: 0;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
		}
		.icon-container {
			position: absolute;
			right: 0;
			bottom: 0;
			.icon {
				margin-left: $uni-spacing-row-base;
			}
		}
	}
}
</style>