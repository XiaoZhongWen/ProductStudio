<template>
	<z-paging ref="paging" v-model="dataList" @query="queryList">
		<view class="course-component-container" v-if="usersStore.isLogin">
			<template v-for="item in dataList" :key="item.courseId">
				<wk-course-item 
					:courseId="item.courseId" 
					:orgId="item.orgId">
				</wk-course-item>
			</template>
		</view>
	</z-paging>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { useCourseStore } from "@/store/course"
import { onMounted, ref } from "../../uni_modules/lime-shared/vue";
import { Org } from "../../types/org";
import { Entry } from "../../types/entry";

type CourseItem = {
	courseId: string,
	orgId: string
}
const global = getApp().globalData!
const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

const props = defineProps(['orgId'])

const dataList = ref<CourseItem[]>([])
const paging = ref(null)
const items = ref<CourseItem[]>([])

onMounted(() => {
	uni.showLoading({
		title: "加载课程数据"
	})
	loadAllCourses()
	uni.hideLoading()
	
	uni.$on(global.event_name.didUpdateOrgCourse, () => {
		loadAllCourses()
		paging.value?.reload()
	})
})

const loadAllCourses = () => {
	const courseIds:string[] = []
	const courseItems:CourseItem[] = []
	const orgId = props.orgId
	if (typeof(orgId) === 'undefined' || orgId.length === 0) {
		if (usersStore.owner.from === 'wx') {
			const userId = usersStore.owner._id
			const roles = usersStore.owner.roles
			if (roles?.includes(1)) {
				// 管理员 - 获取机构所有课程
				const orgs:Org[] = useOrgs.orgs.filter(org => org.creatorId === userId)
				orgs.forEach(org => {
					org.courseIds?.forEach(courseId => {
						const index = courseIds.findIndex(id => id === courseId)
						if (index === -1) {
							courseIds.push(courseId)
							const item = {
								courseId,
								orgId: org._id
							}
							courseItems.push(item)
						}
					})
				})
			}
			if (roles?.includes(2)) {
				// 老师 - 获取所有教授的课程以及自己匿名机构的所有课程
				const orgs:Org[] = useOrgs.orgs.filter(org => org.type === 1 && org.creatorId === userId)
				orgs.forEach(org => {
					org.courseIds?.forEach(courseId => {
						const index = courseIds.findIndex(id => id === courseId)
						if (index === -1) {
							courseIds.push(courseId)
							const item = {
								courseId,
								orgId: org._id
							}
							courseItems.push(item)
						}
					})
				})
				const entries:Entry[] = usersStore.entries.filter(entry => entry.teacherId === userId)
				entries.forEach(entry => {
					const index = courseIds.findIndex(id => id === entry.courseId)
					if (index === -1) {
						courseIds.push(entry.courseId)
						const item = {
							courseId: entry.courseId,
							orgId: entry.orgId
						}
						courseItems.push(item)
					}
				})
			}
			if (roles?.length === 1 && roles.includes(3)) {
				// 家长 - 孩子上的所有课程
				const students = usersStore.students.filter(student => student.associateIds?.includes(userId))
				students.forEach(student => {
					const result = usersStore.entries.filter(entry => entry.studentId === student.studentNo)
					result.forEach(entry => {
						const index = courseIds.findIndex(id => id === entry.courseId)
						if (index === -1) {
							courseIds.push(entry.courseId)
							const item = {
								courseId: entry.courseId,
								orgId: entry.orgId
							}
							courseItems.push(item)
						}
					})
				})
			}
		} else {
			// 获取学生上的所有课程
			const studentNo = usersStore.owner.studentNo
			const entries = usersStore.entries.filter(entry => entry.studentId === studentNo)
			entries.forEach(entry => {
				const index = courseIds.findIndex(id => id === entry.courseId)
				if (index === -1) {
					courseIds.push(entry.courseId)
					const item = {
						courseId: entry.courseId,
						orgId: entry.orgId
					}
					courseItems.push(item)
				}
			})
		}
	} else {
		const orgs:Org[] = useOrgs.orgs.filter(org => org._id === orgId)
		orgs.forEach(org => {
			courseIds.push(...org.courseIds ?? [])
			org.courseIds?.forEach(courseId => {
				const item = {
					courseId,
					orgId: org._id
				}
				courseItems.push(item)
			})
		})
	}
	items.value = courseItems
}

const queryList = async (pageNo:number, pageSize:number) => {
	const s = pageNo * pageSize
	const e = s + pageSize
	const datas = items.value.slice(s, e)
	const cIds = datas.map(item => item.courseId)
	await courseStore.fetchCourses(cIds)
	paging.value?.complete(datas);
}

</script>

<style lang="scss" scoped>

</style>