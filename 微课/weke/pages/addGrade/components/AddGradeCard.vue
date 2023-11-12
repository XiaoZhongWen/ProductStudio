<template>
	<view class="add-grade-card-container">
		<view class="header">
			<wk-icon 
				class="icon" 
				:url="props.org.type === 0?props.org.logoUrl:usersStore.owner.avatarUrl" 
				:text="props.org.type === 0?orgBrief(props.org.name):nickNameBrief()">
			</wk-icon>
			<text class="org-name">
				{{props.org.type === 0?props.org.name:usersStore.owner.nickName}}
			</text>
		</view>
		<view class="grade-container" v-if="grades.length > 0">
			<template v-for="grade in grades" :key="grade._id">
				<view :class="gradeStyle(grade._id)" 
						@tap="onGradeTap(grade._id)" 
						@longpress="onLongPressGrade(grade._id)">
					<view :class="grade.icon"></view>
					<text class="grade-name">{{grade.name}}</text>
					<uni-icons
						v-if="longPressGradeId === grade._id"
						class="icon-minus" 
						type="minus-filled" 
						color="#dd524d" 
						size="24" 
						@tap="onDeleteTap">
					</uni-icons>
				</view>
			</template>
		</view>
		<view class="edit-container">
			<view class="icon" @tap="onTapGradeIcon">
				<view :class="selectedIconId"></view>
			</view>
			<text class="text">班级图标</text>
			<view class="gradeName">
				<input class="input" type="text" v-model="gradeName" placeholder="班级名称" />
			</view>
			<view class="desc">
				<textarea 
					class="textarea" 
					placeholder="班级描述" 
					v-model="gradeDesc" 
					maxlength="100" 
				/>
				<text class="number">{{number}}</text>
				<button
					@tap="onAddTap"
					class="btn" 
					type="default">
					{{selectedGradeId.length === 0? "添加":"更新"}}
				</button>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useGradesStore } from "@/store/grades"
import { useOrgsStore } from '@/store/orgs'
import { computed, onMounted, ref } from 'vue';
import { Grade } from "../../../types/grade";
import { Org } from "../../../types/org";

const global = getApp().globalData!
const usersStore = useUsersStore()	
const gradesStore = useGradesStore()
const useOrgs = useOrgsStore()

const props = defineProps(['org'])

const grades = ref<Grade[]>([])
const selectedIconId = ref('.t-icon .t-icon-shetuan')
const longPressGradeId = ref('')
const gradeName = ref('')
const gradeDesc = ref('')
const selectedGradeId = ref('')

const number = computed(() => {
	return 100 - gradeDesc.value.length
})

onMounted(async () => {
	const org:Org = props.org
	grades.value = await gradesStore.fetchGrades(org.classIds ?? [])
})

const orgBrief = (orgName:string) => {
	return orgName.length > 2? orgName.substring(0, 2): orgName
}

const nickNameBrief = () => {
	const nickname = usersStore.owner.nickName
	const length = nickname?.length ?? 0
	return length > 2? nickname?.substring(length - 2, length): nickname
}

const gradeStyle = (gradeId:string) => {
	return selectedGradeId.value === gradeId? '.grade-cell .grade-cell-selected': '.grade-cell'
}

const onGradeTap = (gradeId:string) => {
	
}

const onLongPressGrade = (gradeId:string) => {
	
}

const onDeleteTap = () => {
	
}

const onTapGradeIcon = () => {
	uni.navigateTo({
		url: "/pages/icon/icon?orgId="+props.org._id
	})
}
	
const onAddTap = () => {
	if (selectedGradeId.value.length === 0) {
		createGrade()
	} else {
		updateGrade()
	}
}

const createGrade = async () => {
	const name = gradeName.value.trim()
	const icon = selectedIconId.value
	const desc = gradeDesc.value.trim()
	if (name.length === 0) {
		uni.showToast({
			title: "请设置班级名称",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	uni.showLoading({
		title:"添加中"
	})
	const id = await gradesStore.addGrade(name, icon, desc)
	let result = false
	if (typeof(id) !== 'undefined' && id.length > 0) {
		result = await useOrgs.addGrade(props.org._id, id)
	}
	uni.hideLoading()
	uni.showToast({
		title: result?"添加成功":"添加失败",
		duration: global.duration_toast,
		icon: result?"success":"error"
	})
	if (result) {
		const grade = {
			_id: id,
			name: name,
			desc: desc,
			icon: icon
		}
		grades.value.push(grade)
		reset()
	}
}

const updateGrade = async () => {
	
}

uni.$on(global.event_name.didSelectedIcon, (data:{iconId:string, orgId:string}) => {
	const { iconId, orgId } = data
	if (typeof(iconId) !== 'undefined' && iconId.length > 0 &&
		typeof(orgId) !== 'undefined' && orgId.length > 0 &&
		orgId === props.org._id) {
		selectedIconId.value = iconId
	}
})

const reset = () => {
	selectedIconId.value = ".t-icon .t-icon-shetuan"
	longPressGradeId.value = ""
	gradeName.value = ""
	gradeDesc.value = ""
	selectedGradeId.value = ""
}
	
</script>

<style lang="scss" scoped>
.add-grade-card-container {
	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 80px;
		background-color: transparent;
		.icon {
			margin-left: $uni-spacing-row-base;
			width: 60px;
			height: 60px;
		}
		.org-name {
			margin-left: $uni-spacing-row-base;
			font-size: $uni-font-size-base;
			color: $wk-text-color;
		}	
	}
	.grade-container {
		display: flex;
		margin: $uni-padding-base;
		.grade-cell {
			position: relative;
			width: 50px;
			height: 60px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			.icon-minus {
				position: absolute;
				top: -6px;
				left: -2px;
			}
			.grade-name {
				width: 50px;
				height: 20px;
				text-align: center;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
		.grade-cell-selected {
			background-color: $wk-bg-color-grey;
			border-radius: $uni-border-radius-lg;
		}
	}
	.edit-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		border: $wk-bg-color-grey dashed 1px;
		margin: $uni-padding-base;
		.icon {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 40px;
			height: 40px;
			background-color: $wk-bg-color-grey;
			border-radius: $uni-border-radius-circle;
			margin-top: $uni-spacing-col-base;
		}
		.text {
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-bottom: $uni-spacing-col-base;
		}
		.gradeName {
			width: 100%;
			padding: 0 $uni-padding-base;
			box-sizing: border-box;
			.input {
				height: 35px;
				background-color: $wk-bg-color-grey;
				padding: 0 $uni-padding-normal;
				font-size: $uni-font-size-base;
				border-radius: $uni-border-radius-base;
				caret-color: $wk-theme-color;
				margin-top: $uni-spacing-col-sm;
			}
		}
		.desc {
			position: relative;
			width: 100%;
			padding: $uni-padding-base;
			box-sizing: border-box;
			.textarea {
				width: 100%;
				height: 100px;
				background-color: $wk-bg-color-grey;
				caret-color: $wk-theme-color;
				font-size: $uni-font-size-base;
				box-sizing: border-box;
				padding: $uni-padding-normal;
				border-radius: $uni-border-radius-base;
			}
			.number {
				position: absolute;
				right: $uni-spacing-col-lg;
				bottom: 50px;
				font-size: $uni-font-size-base;
				color: $wk-text-color-grey;
			}
			.btn {
				margin-top: $uni-spacing-col-base;
				background-color: $wk-theme-color;
				font-size: $uni-font-size-base;
				color: white;
				width: 100%;
			}
		}
	}
}
</style>