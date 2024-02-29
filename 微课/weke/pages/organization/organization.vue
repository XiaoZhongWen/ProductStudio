<template>
	<view class="org-container">
		<z-paging ref="paging" v-model="dataList" @query="queryList">
			<view
				class="card-container" 
				v-for="org in dataList" 
				:key="org._id" 
				@tap="onOrgCardTap(org._id)">
				<org-card :org="org"></org-card>
			</view>
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
import { computed, onMounted, ref } from "vue";
import { onLoad } from '@dcloudio/uni-app'
import { useOrgsStore } from '@/store/orgs'
import { useUsersStore } from "@/store/users"
import { Org } from "../../types/org";

const global = getApp().globalData!

const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const userId = ref(usersStore.owner._id)
const paging = ref(null)
const orgs = ref<Org[]>([])
const dataList = ref<Org[]>([])

onLoad(async (option) => {
	const { id } = option as {id:string}
	if (typeof(id) !== 'undefined' && id.length > 0) {
		userId.value = id
	}
})

onMounted(() => {
	loadOrgs()
	uni.$on(global.event_name.didUpdateOrgData, () => {
		loadOrgs()
	})
})

const isShowAddBtn = computed(() => {
	const id = usersStore.owner._id
	return usersStore.owner.roles?.includes(1) && 
			id === userId.value &&
			!usersStore.isExpired
})

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addOrganization/addOrganization"
	})
}

const onOrgCardTap = (orgId:string) => {
	uni.navigateTo({
		url: "/pages/addOrganization/addOrganization?orgId="+orgId
	})
}

const loadOrgs = () => {
	if (userId.value === usersStore.owner._id) {
		// 管理员 | 老师
		let res:Org[] = []
		if (usersStore.owner.from === 'wx') {
			const forCreator = useOrgs.orgs.filter(org => {
				return org.creatorId === userId.value && org.type === 0
			})
			const forTeacher = useOrgs.orgs.filter(org => {
				return org.teacherIds?.includes(userId.value) && org.type === 0
			})
			if (usersStore.owner.roles?.includes(1)) {
				res.push(...forCreator)
			}
			if (usersStore.owner.roles?.includes(2)) {
				let orgIds:string[] = []
				if (res.length > 0) {
					orgIds = res.map(item => item._id)
				}
				forTeacher.forEach(item => {
					if (!orgIds.includes(item._id)) {
						res.push(item)
					}
				})
			}
		} else {
			// 学生
			const forStudent = useOrgs.orgs.filter(org => {
				return org.studentIds?.includes(userId.value) && org.type === 0
			})
			res.push(...forStudent)
		}
		orgs.value = res
	} else {
		// 家长, 这里的userId指的是被关联学员的userId
		orgs.value = useOrgs.orgs.filter(org => org.studentIds?.includes(userId.value) && org.type === 0)
	}
}

const queryList = (pageNo:number, pageSize:number) => {
	const s = pageNo * pageSize
	const e = s + pageSize
	const data = orgs.value.slice(s, e)
	paging.value?.complete(data)
}

</script>

<style lang="scss" scoped>
.org-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	.card-container {
		width: 90%;
		height: 180px;
		margin: $uni-spacing-col-sm 0;
	}
	.add-container {
		display: flex;
		position: fixed;
		justify-content: center;
		align-items: center;
		background-color: $wk-theme-color;
		width: 60px;
		height: 60px;
		border-radius: $uni-border-radius-circle;
		bottom: 60px;
		right: $uni-spacing-row-lg;
		z-index: 1;
	}
}
</style>
