<template>
	<z-paging ref="paging" v-model="dataList" @query="queryList" @onRefresh="onRefresh">
		<view class="student-component-container" v-if="usersStore.isLogin && useOrgs.orgs.length > 0">
			<wk-student-card v-for="(student, index) in dataList" :key="student._id"
				ref="refs"
				:id="student._id"
				:url="student.avatarUrl"
				:name="student.nickName"
				:studentNo="student.studentNo"
				:signature="student.signature">
			</wk-student-card>
		</view>
	</z-paging>
</template>

<script setup lang="ts">
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { onMounted, onUpdated, ref, watch } from 'vue'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { Student } from '../../types/user'
import wkStudentCardVue from '../wk-student-card/wk-student-card.vue';
import { Org } from '../../types/org';

const global = getApp().globalData!

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()

const props = defineProps(['orgId'])

const refs = ref([])
const dataList = ref<Student[]>()
const studentIdList = ref<string[]>([])
const paging = ref(null)
let refresh = false

onLoad(() => {
	uni.$on(global.event_name.didUpdateCourseData, onDidUpdateCourseData)
	uni.$on(global.event_name.didUpdateOrgData, onDidUpdateOrgData)
})

onUnload(() => {
	uni.$off(global.event_name.didUpdateCourseData, onDidUpdateCourseData)
	uni.$off(global.event_name.didUpdateOrgData, onDidUpdateOrgData)
})

const onDidUpdateCourseData = (data: {studentNo:string}) => {
	const { studentNo } = data
	if (typeof(studentNo) !== 'undefined' && studentNo.length > 0) {
		const index = dataList.value?.findIndex(student => student.studentNo === studentNo)
		if (typeof(index) !== 'undefined' && index !== -1) {
			const card: InstanceType<typeof wkStudentCardVue> = refs.value[index]
			if (card) {
				card.loaddata()
			}
		}
	}
}

const onDidUpdateOrgData = () => {
	loadStudents()
	refresh = true
}

onMounted(() => {
	loadStudents()
})

onUpdated(() => {
	if (refresh) {
		refs.value.forEach(item => {
			const card: InstanceType<typeof wkStudentCardVue> = item
			if (card) {
				card.loaddata()
			}
		})
		refresh = false
	}
})

watch(usersStore.owner, () => {
	loadStudents()
	refresh = true
})

const loadStudents = async () => {
	uni.showLoading({
		title: "加载学员数据"
	})
	const studentIds:string[] = []
	const orgId = props.orgId
	if (typeof(orgId) === 'undefined' || orgId.length === 0) {
		if (usersStore.owner.from === 'wx') {
			if (usersStore.owner.roles?.includes(1)) {
				const res = loadOrgStudent()
				res.forEach(id => {
					if (!studentIds.includes(id)) {
						studentIds.push(id)
					}
				})
			}
			if (usersStore.owner.roles?.includes(2)) {
				const res = await loadTeacherStudent()
				res.forEach(id => {
					if (!studentIds.includes(id)) {
						studentIds.push(id)
					}
				})
			}
			if (usersStore.owner.roles?.includes(3) && 
				usersStore.owner.roles.length === 1) {
				// 家长 - 获取与孩子学习相同课程的学员
				const userId = usersStore.owner._id
				const children = await usersStore.fetchChildren(userId)
				for (let child of children) {
					const res = await loadClassmate(child.studentNo)
					res.forEach(id => {
						if (!studentIds.includes(id)) {
							studentIds.push(id)
						}
					})
				}
			}
		} if (usersStore.owner.from === 'stuNo') {
			// 学员 - 获取学习相同课程的学员
			const res = await loadClassmate(usersStore.owner.studentNo)
			res.forEach(id => {
				if (!studentIds.includes(id)) {
					studentIds.push(id)
				}
			})
		}
	} else {
		const res = loadOrgStudent()
		res.forEach(id => {
			if (!studentIds.includes(id)) {
				studentIds.push(id)
			}
		})
	}
	studentIdList.value = studentIds
	paging.value?.reload()
	uni.hideLoading()
}

const loadOrgStudent = () => {
	const studentIds:string[] = []
	const userId = usersStore.owner._id
	// 管理员 - 获取机构所有学员
	let orgs:Org[] = []
	const orgId = props.orgId
	if (typeof(orgId) === 'undefined' || orgId.length === 0) {
		orgs = useOrgs.orgs.filter(org => org.creatorId === userId)
	} else {
		orgs = useOrgs.orgs.filter(org => org._id === orgId)
	}
	orgs.forEach(org => {
		org.studentIds?.forEach(id => {
			if (!studentIds.includes(id)) {
				studentIds.push(id)
			}
		})
	})
	return studentIds
}

const loadTeacherStudent = async () => {
	const userId = usersStore.owner._id
	// 老师 - 获取教授的所有学员
	const entries = usersStore.entries.filter(entry => entry.teacherId === userId)
	const studentNos = entries.map(entry => entry.studentId)
	const ids = await usersStore.fetchStudentIdsByNos(studentNos)
	// 匿名机构的学员
	const studentIds:string[] = []
	const orgs = useOrgs.orgs.filter(org => org.type === 1 && org.creatorId === userId)
	if (orgs.length > 0) {
		const o = orgs[0].studentIds ?? []
		if (o.length > 0) {
			studentIds.push(...o)
		}
	}
	ids.forEach(id => {
		if (!studentIds.includes(id)) {
			studentIds.push(id)
		}
	})
	return studentIds
}

const loadClassmate = async (studentNo: string) => {
	// 获取学习相同课程的学员
	let entries = usersStore.entries.filter(entry => entry.studentId === studentNo)
	const courseIds = entries.map(entry => entry.courseId)
	
	entries = usersStore.entries.filter(entry => courseIds.includes(entry.courseId))
	
	const studentNos:string[] = [studentNo]
	entries.forEach(entry => {
		if (!studentNos.includes(entry.studentId)) {
			studentNos.push(entry.studentId)
		}
	})
	const studentIds = await usersStore.fetchStudentIdsByNos(studentNos)
	return studentIds
}

const onRefresh = async () => {
	await loadStudents()
}

const queryList = async (pageNo:number, pageSize:number) => {
	const s = pageNo * pageSize
	const e = s + pageSize
	const ids = studentIdList.value.slice(s, e)
	const students = await usersStore.fetchStudentsByIds(ids)
	paging.value?.complete(students)
}

</script>

<style lang="scss" scoped>
</style>