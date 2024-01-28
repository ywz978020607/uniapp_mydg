## 1.0.0（2022-11-21）
```text
<template>
	<view style="padding: 20px 10%;">


		<!-- 多选下拉菜单 - 使用默认的显示方式 -->
		<view style="border: 1px solid gray;">
			<rudon-multiSelector welcome="请选择" :is_using_slot="false" :is_using_icon="true" :localdata="options" @change="whenChanged"></rudon-multiSelector>
		</view>


		<!-- 多选下拉菜单 - 使用自定义的显示方式 -->
		<view style="border: 1px solid gray;margin-top: 200px;">			
			<rudon-multiSelector :is_using_slot="true" :localdata="options" @change="whenChanged">
				<view>
					{{JSON.stringify(options)}}
				</view>
			</rudon-multiSelector>
		</view>
		

	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 初始选项
				options: [{
						value: 0,
						text: "数学",
						is_selected: false,
					},
					{
						value: 1,
						text: "美术",
						is_selected: false,
					},
					{
						value: 2,
						text: "体育",
						is_selected: true
					}
				],

			}
		},

		methods: {

			whenChanged(e) {
				console.log(JSON.stringify(e))
				this.options = e
			}

			// METHODS结束
		}
	}
</script>


<style>

</style>
```
