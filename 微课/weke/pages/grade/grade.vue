<template>
	<view class="grade-container">
		<z-paging ref="paging" v-model="dataList" @query="queryList">
			<template v-for="item in dataList" :key="item.gradeId">
				<GradeCard
					@tap="onTap(item.gradeId)"
					:gradeId="item.gradeId"
					:orgId="item.orgId"
				/>
			</template>
		</z-paging>
		<view
			class="add-container" 
			@tap="onAddTap" 
			v-if="isShowAddBtn">
			<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { useGradesStore } from "@/store/grades";
import { computed, onMounted, ref } from 'vue';
import { Org } from "../../types/org";
import { onLoad } from '@dcloudio/uni-app'
import GradeCard from './components/GradeCard.vue'

type GradeItem = {
	gradeId: string,
	orgId: string
}

const global = getApp().globalData!
const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const useGrades = useGradesStore()

const gradeList = ref<GradeItem[]>([])
const dataList = ref<GradeItem[]>([])
const userId = ref(usersStore.owner._id)
const organizationId = ref('')
const paging = ref(null)

onLoad(async (option) => {
	const { id, orgId } = option as { 
		id:string, 
		orgId?:string
	}
	if (typeof(id) !== 'undefined' && id.length > 0) {
		userId.value = id
	}
	if (typeof(orgId) !== 'undefined' && orgId.length > 0) {
		organizationId.value = orgId
	}
})

onMounted(async () => {
	uni.showLoading({
		title: "加载班级数据"
	})
	await loaddata()
	uni.hideLoading()
})

const isShowAddBtn = computed(() => {
	return usersStore.owner._id === userId.value && 
			(usersStore.owner.roles?.includes(1) ||
				usersStore.owner.roles?.includes(2)) &&
			!usersStore.isExpired
})

uni.$on(global.event_name.didCreateGrade, async (data:{gradeId:string, orgId:string}) => {
	const { gradeId, orgId } = data
	if (typeof(gradeId) === 'undefined' || gradeId.length === 0 ||
		typeof(orgId) === 'undefined' || orgId.length === 0) {
		return
	}
	const item = {
		gradeId: gradeId,
		orgId: orgId
	}
	gradeList.value.push(item)
	paging.value?.reload()
})

const onAddTap = () => {
	let url = "/pages/addGrade/addGrade"
	if (organizationId.value.length > 0) {
		url = "/pages/addGrade/addGrade?orgId=" + organizationId.value
	}
	uni.navigateTo({
		url
	})
}

const onTap = (gradeId:string) => {
	uni.navigateTo({
		url: "/pages/addGrade/addGrade?gradeId="+gradeId
	})
}

const queryList = (pageNo:number, pageSize:number) => {
	const s = pageNo * pageSize
	const e = s + pageSize
	const data = gradeList.value.slice(s, e)
	paging.value?.complete(data)
}

const loaddata = async () => {
	const roles = usersStore.owner.roles
	if (organizationId.value.length === 0) {
		if (userId.value === usersStore.owner._id) {
			if (usersStore.owner.from === 'wx') {
				if (roles?.includes(1) || roles?.includes(2)) {
					// 管理员 | 老师
					const res = useOrgs.orgs.filter(org => org.creatorId === userId.value || 
												org.teacherIds?.includes(userId.value))
					const orgs:Org[] = []
					orgs.push(...res)
					orgs.forEach(org => {
						org.classIds?.forEach(cId => {
							const item = {
								gradeId: cId,
								orgId: org._id
							}
							gradeList.value.push(item)
						})
					})
				}
			} else {
				// 学生
				const res = await useGrades.fetchGradesByStudentId(userId.value)
				res.forEach(grade => {
					const item = {
						gradeId: grade._id,
						orgId: grade.orgId
					}
					gradeList.value.push(item)
				})
			}
		} else {
			// 家长
			const res = await useGrades.fetchGradesByStudentId(userId.value)
			res.forEach(grade => {
				const item = {
					gradeId: grade._id,
					orgId: grade.orgId
				}
				gradeList.value.push(item)
			})
		}
	} else {
		const res = useOrgs.orgs.filter(org => org._id === organizationId.value)
		res.forEach(org => {
			org.classIds?.forEach(cId => {
				const item = {
					gradeId: cId,
					orgId: org._id
				}
				gradeList.value.push(item)
			})
		})
	}
}

</script>

<style lang="scss">
.grade-container {
	display: flex;
	flex-direction: column;
	.add-container {
		display: flex;
		position: fixed;
		justify-content: center;
		align-items: center;
		background-color: $wk-theme-color;
		width: 60px;
		height: 60px;
		border-radius: $uni-border-radius-circle;
		bottom: 30px;
		right: $uni-spacing-row-lg;
		z-index: 1;
	}
}
</style>
