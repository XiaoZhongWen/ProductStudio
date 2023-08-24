<template>
	<view>
		<scroll-view scroll-y="true" show-scrollbar=false enhanced=true>
			<!-- 个人信息 -->
			<Profile @login="onLogin"></Profile>
			
			<!-- 机构相关 -->
			<view class="org-container">
				<uni-list>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="shop-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">机构</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="person-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">老师</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="staff-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">学员</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="chatboxes-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">班级</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="wallet-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">课程</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="gear-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">设置</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 孩子相关 -->
			<view class="children-container">
				<uni-list>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="contact-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">大宝</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="contact-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">二宝</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 账号相关 -->
			<view class="account-container">
				<uni-list>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="phone-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">绑定手机号</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="weixin" color="#007aff" size=22></uni-icons>
								<text class="slot-text">绑定微信</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="upload-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">分享</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="vip-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">会员中心</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 其他 -->
			<view class="other-container">
				<uni-list>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="navigate-filled" color="#fcaf2c" size=22></uni-icons>
								<text class="slot-text">新手指南</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="chatboxes-filled" color="#fcaf2c" size=22></uni-icons>
								<text class="slot-text">反馈意见</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="heart-filled" color="#fcaf2c" size=22></uni-icons>
								<text class="slot-text">关于我们</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- popup 登录授权 -->
			<uni-popup 
				ref="loginAuthPopup" 
				type="bottom"
				background-color="white"
				@change="onChange">
				<LoginAuth @on-popup="onPopup"></LoginAuth>
			</uni-popup>
			
			<!-- popup 头像授权 -->
			<uni-popup 
				ref="portraitPopup" 
				type="bottom"
				background-color="white">
				<view class="">
					<view class="">1</view>
					<view class="">2</view>
					<view class="">3</view>
				</view>
			</uni-popup>
			
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Profile from "./components/Profile.vue"
import LoginAuth from './components/LoginAuth.vue'

const loginAuthPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const portraitPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const onLogin = () => {
	loginAuthPopup.value?.open()
}

const onPopup = () => {
	loginAuthPopup.value?.close()
}

const onChange = (e: UniHelper.UniPopupOnChangeEvent) => {
	e.show? uni.hideTabBar(): uni.showTabBar()
}

uni.$on('uploadPortrait', () => {
	portraitPopup.value?.open()
	console.log('uploadPortrait')
})

uni.$on('showWkProtcol', () => {
	console.log('showWkProtcol')
})

uni.$on('requestWxNickname', () => {
	console.log('requestWxNickname')
})

</script>

<style lang="scss">
.org-container, .children-container, .account-container, .other-container {
	margin-top: $uni-spacing-col-lg;
	.uni-list {
		margin: 0 $uni-spacing-row-base;
		border-radius: $uni-border-radius-lg;
		background-color: white;
		.uni-list--border-top, .uni-list--border-bottom {
			height: 0px;
		}
		.uni-list-item {
			border-radius: $uni-border-radius-lg;
		}
	}
	.slot-box {
		flex-direction: row;
		align-items: center;
		.slot-text {
			margin-left: $uni-padding-normal;
			font-size: $uni-font-size-base;
			color: $wk-text-color;
			font-weight: 400;
		}
		uni-icons {
			position: relative;
			top: 3px;
		}
	}
}
</style>
