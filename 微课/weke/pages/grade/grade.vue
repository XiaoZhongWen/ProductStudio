<template>
	<view class="grade-container">
		<template v-for="item in gradeList" :key="item.gradeId">
			<GradeCard
				@tap="onTap(item.gradeId)"
				:gradeId="item.gradeId"
				:orgId="item.orgId"
			/>
		</template>
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
const userId = ref(usersStore.owner._id)

onLoad(async (option) => {
	const { id } = option as {id:string}
	if (typeof(id) !== 'undefined' && id.length > 0) {
		userId.value = id
	}
})

onMounted(async () => {
	const roles = usersStore.owner.roles
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
})

const isShowAddBtn = computed(() => {
	return usersStore.owner._id === userId.value && 
			(usersStore.owner.roles?.includes(1) ||
				usersStore.owner.roles?.includes(2))
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
})

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addGrade/addGrade"
	})
}

const onTap = (gradeId:string) => {
	uni.navigateTo({
		url: "/pages/addGrade/addGrade?gradeId="+gradeId
	})
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
