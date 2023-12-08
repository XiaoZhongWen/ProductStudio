<template>
	<view class="add-schedule-container">
		<view class="section type">
			<text>类型</text>
			<radio-group>
				<label class="radio">
					<radio 
						value="0" 
						color="#5073D6"
						:checked="selectedCourseType === 0" />
					<text :class="selectedCourseType === 0? 'selectedColor':'textColor'">一对一</text>
				</label>
				<label class="radio">
					<radio 
						value="1" 
						color="#5073D6"
						:checked="selectedCourseType === 1" />
					<text :class="selectedCourseType === 1? 'selectedColor':'textColor'">班课</text>
				</label>
				<label class="radio">
					<radio 
						value="2" 
						color="#5073D6"
						:checked="selectedCourseType === 2"/>
					<text :class="selectedCourseType === 2? 'selectedColor':'textColor'">次课</text>
				</label>
				<label class="radio">
					<radio 
						value="3" 
						color="#5073D6" 
						:checked="selectedCourseType === 3" />
					<text :class="selectedCourseType === 3? 'selectedColor':'textColor'">试听课</text>
				</label>
			</radio-group>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const selectedCourseType = ref(0)

</script>

<style lang="scss" scoped>
.add-schedule-container {
	display: flex;
	flex-direction: column;
	.section {
		background-color: white;
		border-radius: $uni-border-radius-base;
		margin: $uni-spacing-col-sm $uni-spacing-row-base;
		padding: $uni-padding-base;
		box-sizing: border-box;
	}
	.type {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		font-size: $uni-font-size-base;
		.radio {
			margin: 0 $uni-spacing-row-sm;
			.textColor {
				color: $wk-text-color-grey;
			}
			.selectedColor {
				color: $wk-theme-color;
			}
		}
	}
}
</style>
