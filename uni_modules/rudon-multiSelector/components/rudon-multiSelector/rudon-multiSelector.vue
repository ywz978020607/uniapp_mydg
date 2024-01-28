<template>
	<view class="rudon-component__select componentW100">
		
		<!-- 组件介绍 -->
		<!-- 名称：rudon-multiSelector 多选下拉菜单 -->
		<!-- 作者：Rudon <https://rudon.blog.csdn.net> -->
		<!-- 用途：多选下拉菜单 -->
		<!-- 用法：
				0）参考https://uniapp.dcloud.net.cn/component/uniui/uni-data-select.html
				1）项目安装本组件， 
				2）vue中直接引用即可，例如下面的例子
		-->
		<!-- 例如:
		<rudon-multiSelector :clear="false" :localdata="菜单对象" @change="mss($event, item)"></rudon-multiSelector>
		-->
		
		
		<span v-if="label" class="uni-label-text hide-on-phone">{{label + '：'}}</span>
		<view class="rudon-select componentW100">
			<view class="rudon-select__input-box componentW100" @click="toggleSelector">
				
				<!-- 显示插槽内容 -->
				<view class="" v-show="is_using_slot">
					<slot></slot>
				</view>
				<!-- 不显示插槽内容 -->
				<view class="componentW100" v-show="!is_using_slot" style="display: flex; justify-content: space-between; align-items: center; flex-direction: row;">
					<!-- 欢迎语句 -->
					<view v-show="!onShowNames.length">
						{{welcome}}
					</view>
					<!-- 已选内容 -->
					<view v-show="onShowNames.length">
						{{onShowNames.join(', ')}}
					</view>
					<!-- 下拉图标 -->
					<view v-show="is_using_icon">
						<uni-icons type="bottom" color="#c0c4cc" size="16" v-show="!showSelector"></uni-icons>
						<uni-icons type="top" color="#c0c4cc" size="16" v-show="showSelector"></uni-icons>
					</view>
				</view>
				
				
				<!-- 遍历 -->
				<!-- <text v-for="(item, index) in onShowNames" :key="'selected_items_'+index">
					{{item}}
				</text> -->
				
				
			</view>
			<view class="rudon-select--mask" v-if="showSelector" @click="toggleSelector" />
			<view class="rudon-select__selector componentW100" v-if="showSelector">
				<view class="uni-popper__arrow"></view>
				<scroll-view scroll-y="true" class="rudon-select__selector-scroll">
					<view class="rudon-select__selector-empty" v-if="mixinDatacomResData.length === 0">
						<text>{{emptyTips}}</text>
					</view>
					
					<view v-else class="rudon-select__selector-item" v-for="(item,index) in mixinDatacomResData" :key="index" @click="selectOneItem(item)" style="padding: 10px 0 10px 0; display: flex; flex-direction: row; align-items: center; justify-content: flex-start;">
						<view class="" style="padding: 0 8px 0 4px;">
							
							<!-- 未选中 -->
							<uni-icons type="checkbox-filled" size="25" color="#ebebeb" v-show="!item.is_selected"></uni-icons>
							
							<!-- 已选中 -->
							<uni-icons type="checkbox-filled" size="25" color="#f08418" v-show="item.is_selected"></uni-icons>
							
						</view>
						<view>
							<text :class="{'rudon-select__selector__disabled': item.disable}">{{formatItemName(item)}}</text>
						</view>
						
						
					</view>
					
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	/**
	 * DataChecklist 数据选择器
	 * @description 通过数据渲染的下拉框组件
	 * @tutorial https://uniapp.dcloud.io/component/uniui/uni-data-select
	 * @property {String} value 默认值
	 * @property {Array} localdata 本地数据 ，格式 [{text:'',value:''}]
	 * @property {Boolean} clear 是否可以清空已选项
	 * @property {Boolean} emptyText 没有数据时显示的文字 ，本地数据无效
	 * @property {String} label 左侧标题
	 * @property {String} placeholder 输入框的提示文字
	 * @event {Function} change  选中发生变化触发
	 */

	export default {
		name: "rudon-multiSelector",
		mixins: [uniCloud.mixinDatacom || {}],
		data() {
			return {
				showSelector: false,
				current: '',
				mixinDatacomResData: [],
				apps: [],
				channels: [],
				
				
			};
		},
		props: {
			// 初始化显示提示语 - 当没有选项选中时
			welcome: {
				type: String,
				default: ''
			},
			
			// 是否使用slot
			is_using_slot: {
				type: Boolean,
				default: false
			},
			
			// 是否使用非slot模式下的右边的向下箭头图标
			is_using_icon: {
				type: Boolean,
				default: true
			},
			
			
			/**
			 * 本地数据， 格式：
			 *  [
					{
						// 值
						value: 0,
						// 显示文字
						text: "服装业",
						// 是否已选中
						is_selected: false,
					},
					{
						// 值
						value: 1,
						// 显示文字
						text: "矿业",
						// 是否已选中
						is_selected: false,
					}
			    ]
			 */
			localdata: {
				type: Array,
				default () {
					return []
				}
			},
			value: {
				type: [String, Number],
				default: ''
			},
			modelValue: {
				type: [String, Number],
				default: ''
			},
			label: {
				type: String,
				default: ''
			},
			placeholder: {
				type: String,
				default: '...'
			},
			emptyTips: {
				type: String,
				default: '无选项'
			},
			clear: {
				type: Boolean,
				default: true
			},
			defItem: {
				type: Number,
				default: 0
			}
		},
		created() {
			this.last = `${this.collection}_last_selected_option_value`
			if (this.collection && !this.localdata.length) {
				this.mixinDatacomEasyGet()
			}
		},
		computed: {
			// 已选中的标题
			onShowNames () {
				let res = []
				for (let i in this.localdata) {
					let cur = this.localdata[i]
					if (cur.hasOwnProperty('is_selected') && cur.is_selected) {
						// 已选中
						if (cur.hasOwnProperty('text')) {
							res.push(cur.text)
						} else if (cur.hasOwnProperty('title')) {
							res.push(cur.title)
						} else {
							res.push('标题缺失')
						}
					}
				}
				return res
			}
		},
		watch: {
			localdata: {
				immediate: true,
				handler(val, old) {
					if (Array.isArray(val)) {
						this.mixinDatacomResData = val
					}
				}
			},
			// #ifndef VUE3
			value() {
				this.initDefVal()
			},
			// #endif
			// #ifdef VUE3
			modelValue() {
				this.initDefVal()
			},
			// #endif
			mixinDatacomResData: {
				immediate: true,
				handler(val) {
					if (val.length) {
						this.initDefVal()
					}
				}
			}
		},
		methods: {
			initDefVal() {
				let defValue = ''
				if ((this.value || this.value === 0) && !this.isDisabled(this.value)) {
					defValue = this.value
				} else if ((this.modelValue || this.modelValue === 0) && !this.isDisabled(this.modelValue)) {
					defValue = this.modelValue
				} else {
					let strogeValue
					if (this.collection) {
						strogeValue = uni.getStorageSync(this.last)
					}
					if (strogeValue || strogeValue === 0) {
						defValue = strogeValue
					} else {
						let defItem = ''
						if (this.defItem > 0 && this.defItem < this.mixinDatacomResData.length) {
							defItem = this.mixinDatacomResData[this.defItem - 1].value
						}
						defValue = defItem
					}
					this.emit(defValue)
				}
				const def = this.mixinDatacomResData.find(item => item.value === defValue)
				this.current = def ? this.formatItemName(def) : ''
			},

			/**
			 * @param {[String, Number]} value
			 * 判断用户给的 value 是否同时为禁用状态
			 */
			isDisabled(value) {
				let isDisabled = false;

				this.mixinDatacomResData.forEach(item => {
					if (item.value === value) {
						isDisabled = item.disable
					}
				})

				return isDisabled;
			},

			clearVal() {
				this.emit('')
				if (this.collection) {
					uni.removeStorageSync(this.last)
				}
			},
			change(item) {
				if (!item.disable) {
					this.showSelector = false
					this.current = this.formatItemName(item)
					this.emit(item.value)
				}
			},
			emit(val) {
				
				if (val != '' && val != null) {
					this.$emit('change', val)
				}
				
				this.$emit('input', val)
				this.$emit('update:modelValue', val)
				if (this.collection) {
					uni.setStorageSync(this.last, val)
				}
			},

			toggleSelector() {
				this.showSelector = !this.showSelector
			},
			formatItemName(item) {
				let {
					text,
					value,
					channel_code
				} = item
				channel_code = channel_code ? `(${channel_code})` : ''
				return this.collection.indexOf('app-list') > 0 ?
					`${text}(${value})` :
					(
						text ?
						text :
						`未命名${channel_code}`
					)
			},
			
			// 点击某一个成员，选中或者反选
			selectOneItem (item) {
				// console.log(JSON.stringify(item))
				
				
				// 允许选择
				let tobe = (item.is_selected)? false: true
				
				for (let i in this.localdata) {
					if (this.localdata[i].value == item.value) {
						this.localdata[i].is_selected = tobe
					}
				}
				
				this.emit(this.localdata)
			}
			
			
			// Methods结束
		}
	}
</script>

<style lang="scss">
	$uni-base-color: #6a6a6a !default;
	$uni-main-color: #3a3a3a !default;
	$uni-secondary-color: #909399 !default;
	$uni-border-3: #DCDCDC;


	/* #ifndef APP-NVUE */
	@media screen and (max-width: 100%) {
		.hide-on-phone {
			display: none;
		}
	}

	/* #endif */
	.rudon-component__select {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.uni-label-text {
		font-size: 14px;
		font-weight: bold;
		color: $uni-base-color;
		margin: auto 0;
		margin-right: 5px;
	}

	.rudon-select {
		font-size: 14px;
		// border: 1px solid $uni-border-3;
		box-sizing: border-box;
		border-radius: 1px;
		padding: 0 5px;
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		user-select: none;
		/* #endif */
		flex-direction: row;
		align-items: center;
		// border-bottom: solid 1px $uni-border-3;
	}

	.rudon-select__label {
		font-size: 16px;
		line-height: 22px;
		padding-right: 10px;
		color: $uni-secondary-color;
	}

	.rudon-select__input-box {
		min-height: 20px;
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex: 1;
		flex-direction: row;
		align-items: center;
	}

	.rudon-select__input {
		flex: 1;
		font-size: 14px;
		height: 22px;
		line-height: 22px;
	}

	.rudon-select__input-plac {
		font-size: 14px;
		color: $uni-secondary-color;
	}

	.rudon-select__selector {
		/* #ifndef APP-NVUE */
		box-sizing: border-box;
		/* #endif */
		position: absolute;
		top: calc(100% + 12px);
		left: 0;
		width: auto;
		background-color: #FFFFFF;
		border: 1px solid #EBEEF5;
		border-radius: 6px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		z-index: 2;
		padding: 4px 0;
	}

	.rudon-select__selector-scroll {
		padding: 5px;
		/* #ifndef APP-NVUE */
		max-height: 200px;
		box-sizing: border-box;
		/* #endif */
	}

	.rudon-select__selector-empty,
	.rudon-select__selector-item {
		/* #ifndef APP-NVUE */
		display: flex;
		cursor: pointer;
		/* #endif */
		line-height: 20px;
		font-size: 14px;
		text-align: center;
		/* border-bottom: solid 1px $uni-border-3; */
		padding: 10px 20px;
		
		width: auto;
		white-space: nowrap;
		flex-wrap: nowrap;
	}

	.rudon-select__selector-item:hover {
		background-color: #f9f9f9;
	}

	.rudon-select__selector-empty:last-child,
	.rudon-select__selector-item:last-child {
		/* #ifndef APP-NVUE */
		border-bottom: none;
		/* #endif */
	}

	.rudon-select__selector__disabled {
		opacity: 0.4;
		cursor: default;
	}

	/* picker 弹出层通用的指示小三角 */
	.uni-popper__arrow,
	.uni-popper__arrow::after {
		position: absolute;
		display: block;
		width: 0;
		height: 0;
		border-color: transparent;
		border-style: solid;
		border-width: 6px;
	}

	.uni-popper__arrow {
		filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
		top: -6px;
		left: 10%;
		margin-right: 3px;
		border-top-width: 0;
		border-bottom-color: #EBEEF5;
	}

	.uni-popper__arrow::after {
		content: " ";
		top: 1px;
		margin-left: -6px;
		border-top-width: 0;
		border-bottom-color: #fff;
	}

	.rudon-select__input-text {
		color: $uni-main-color;
		white-space: nowrap;
		text-overflow: ellipsis;
		-o-text-overflow: ellipsis;
		overflow: hidden;
		width: auto;
	}

	.rudon-select__input-placeholder {
		color: $uni-base-color;
	}

	.rudon-select--mask {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
	}
	
	// 全宽
	.componentW100 {
		width: 100%;
	}
</style>
