<template>
	<view class="org-student-container">
		<template v-for="student in students" :key="student._id">
			<wk-portrait
				class="portrait"
				:url="student.avatarUrl" 
				:name="student.nickName">
			</wk-portrait>
		</template>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUsersStore } from "@/store/users"
import { Student } from '../../../types/user';

const usersStore = useUsersStore()
const props = defineProps(['studentIds'])
const students = ref<Student[]>([])

onMounted(async () => {
	const users = await usersStore.fetchUsers(props.studentIds, 'student') as Student[]
	students.value.push(...users)
})

</script>

<style lang="scss" scoped>
.org-student-container {
	display: flex;
	flex-direction: row;
	flex-flow: row wrap;
	padding: 4px;
	border-top: 0.5px solid $wk-bg-color-grey;
	border-bottom: 0.5px solid $wk-bg-color-grey;
	.icon {
		width: 30px;
		height: 30px;
		border-radius: $uni-border-radius-circle;
		padding: $uni-padding-sm;
	}
}
</style>