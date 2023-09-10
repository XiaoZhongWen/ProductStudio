<template>
	<view 
		class="org-card-container"
		:style="{background: `linear-gradient(to right, ${props.org.gradient[0]}, ${props.org.gradient[1]})`}">
		<view class="left">
			<image class="icon" :class="{iconBorder: hasNoOrgIcon}" :src="props.org?.logoUrl" mode="aspectFill"></image>
			<text 
				class="text orgName" 
				:class="{placeholderBorder: hasNoOrgName}">
				{{props.org?.name}}
			</text>
			<template v-if="hasOrgOwnerName">
				<text class="text ownerName">
					{{props.org?.nickname}}
				</text>
				<text class="text identity">机构负责人</text>
			</template>
		</view>
		<view class="right">
			<text 
				class="text orgDesc" 
				:class="{placeholderBorder: hasNoOrgDesc}">
				{{props.org?.desc}}
			</text>
			<view class="row" v-if="hasOrgMobile">
				<uni-icons class="uni-icons" type="phone-filled" color="white"></uni-icons>
				<text class="text mobile">
					{{props.org?.tel}}
				</text>
			</view>
			<view class="row">
				<uni-icons class="uni-icons" type="location-filled" color="white"></uni-icons>
				<text
					class="text address" 
					:class="{placeholderBorder: hasNoOrgAddr}">
					{{props.org?.addr}}
				</text>
			</view>
		</view>
		<text class="text"></text>
		<text
			class="text createDate" 
			:class="{placeholderBorder: hasNoOrgDate}">
			{{props.org?.createDate}}
		</text>
	</view>
</template>

<script setup lang="ts">
import { Org } from '@/types/org'
import { computed } from "vue";

const props:Readonly<{
    org?: Org & {nickname?: string}
}>	= defineProps(['org'])

// @ts-ignore
const hasNoOrgIcon = computed({
	get() {
		const logoUrl = props.org?.logoUrl ?? ''
		return logoUrl.length === 0
	}
})

// @ts-ignore
const hasNoOrgName = computed({
	get() {
		const orgName = props.org?.name ?? ''
		return orgName.length === 0
	}
})

// @ts-ignore
const hasOrgOwnerName = computed({
	get() {
		const nickname = props.org?.nickname ?? ''
		return nickname.length > 0
	}
})

// @ts-ignore
const hasOrgMobile = computed({
	get() {
		const mobile = props.org?.tel ?? ''
		return mobile.length > 0
	}
})

// @ts-ignore
const hasNoOrgAddr = computed({
	get() {
		const orgAddr = props.org?.addr ?? ''
		return orgAddr.length === 0
	}
})

// @ts-ignore
const hasNoOrgDesc = computed({
	get() {
		const orgDesc = props.org?.desc ?? ''
		return orgDesc.length === 0
	}
})

// @ts-ignore
const hasNoOrgDate = computed({
	get() {
		const orgDate = props.org?.createDate ?? ''
		return orgDate.length === 0
	}
})

</script>

<style lang="scss" scoped>
.org-card-container {
	display: flex;
	position: relative;
	flex-direction: row;
	border-radius: $uni-border-radius-lg;
	width: 100%;
	height: 100%;
	.left {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 120px;
		.icon {
			width: 60px;
			height: 60px;
			margin-top: 20px;
			border-radius: $uni-border-radius-circle;
		}
		.orgName {
			width: 90px;
			height: 20px;
			text-align: center;
			font-size: $uni-font-size-lg;
			margin-top: $uni-spacing-col-sm;
		}
		.ownerName {
			width: 60px;
			height: 20px;
			text-align: center;
			font-size: $uni-font-size-lg;
			margin-top: 30px;
		}
		.identity {
			font-size: $uni-font-size-10;
			text-align: center;
		}
	}
	.right {
		display: flex;
		flex-direction: column;
		flex: 1;
		width: 160px;
		.orgDesc {
			width: 95%;
			height: 70px;
			margin-top: 20px;
			margin-bottom: 10px;
			word-wrap: break-word;
			font-size: $uni-font-size-lg;
			font-family: Georgia, serif;
		}
		.row {
			display: flex;
			.mobile {
				margin-left: $uni-spacing-row-sm;
				font-size: $uni-font-size-sm;
			}
			.address {
				width: 85%;
				height: 20px;
				margin-left: $uni-spacing-row-sm;
				font-size: $uni-font-size-sm;
			}
		}
		.uni-icons {
			position: relative;
			bottom: 2px;
		}
	}
	.placeholderBorder {
		border-style: dashed;
		border-color: $wk-text-color-grey;
		border-width: 1px;
		border-radius: $uni-border-radius-base;
	}
	.iconBorder {
		border-style: dashed;
		border-color: $wk-text-color-grey;
		border-width: 1px;
	}
	.text {
		color: white;
	}
	.createDate {
		width: 90px;
		height: 20px;
		position: absolute;
		display: inline-block;
		right: $uni-spacing-row-base;
		bottom: $uni-spacing-col-sm;
		font-size: $uni-font-size-10;
		text-align: right;
	}
}
</style>