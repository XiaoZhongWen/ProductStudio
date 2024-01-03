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
		uni.navigateTo({
			url: "/pages/calendar2/calendar2?id="+props.id+"&role=4"
		})
	}
}

/*
* 1. 课程进度	
*	1.1 管理员
*		学生在管理员所创建机构中的课程总进度
*		如: 管理员所创建的机构有o1、o2、o3...
*			机构对应的课程有o1: c11、c12、c13、o2: c21、c22、c23、o3: c31、c32、c33
*			该学生所在的机构为o1、o2、o9
*			该学生所报课程有c11、c13、c22、c32、c91
*			则管理员所看到的课程进度为: (c11、c13、c22、c32)的总课消 / (c11、c13、c22、c32)的总课量
*	1.2 老师
*		学生在老师所教授课程中的课程总进度
*		如: 老师教授的课程有c1、c2、c3、c4、c5、c6...
*			该学生所报课程有c1、c3、c5
*			则老师所看到的课程进度为: (c1、c3、c5)的总课消 / (c1、c3、c5)的总课量
*	1.3 家长
*		实际课程进度
*   1.4 学生
* 		实际课程进度
**/
const loaddata = () => {
	const userId = usersStore.owner._id
	const from = usersStore.owner.from
	const roles = usersStore.owner.roles ?? []
	// 学生所在的机构
	const orgs = useOrgs.orgs.filter(org => org.studentIds?.includes(props.id))
	// 对于管理员, 其创建的所有机构
	const createOrgIds = useOrgs.orgs.filter(org => org.creatorId === userId).map(org => org._id)
	const anonymousOrgId = useOrgs.anonymousOrg._id
	const oIds:string[] = []
	const s = orgs.map(org => org._id)
	// 学生的课程实体集合
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
		const isStudentCourse = (roles.includes(3) && roles.length === 1) || from === 'stuNo'
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
		const isStudentCourse = (roles.includes(3) && roles.length === 1) || from === 'stuNo'
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