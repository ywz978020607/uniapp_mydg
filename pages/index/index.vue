<template>
	<div style="display: flex;flex-direction: column;align-items: center;">
	        <!-- <header id="top">
	            <div id="top_box">
	                <ul class="lf">
	                    <li><a href="#">欢迎</a></li>
	                </ul>
	               <ul class="rt">
						<li>摸鱼大鸽@bilibili v3.1.1</li>
	                </ul>
	            </div>
	        </header> -->
	        <!-- body-block  -->
			<div style="width: 100%; display: flex;flex-direction: column;align-items: center; background-color: #F2F1ED;">
		            <span v-html="'<br>'"></span>
					<span style="white-space: pre-wrap;">
						<picker v-if="seen_id>=0" v-model = "seen_id" @change="change_seen_id($event.target.value)" :value="seen_id" :range="seen_id_tags">
							<view style="color: blue;">功能导航：{{seen_id_tags[seen_id]}}</view>
						</picker>
					</span>

						<span v-html="'<br>'"></span>
						<div v-if="seen_id==0" style="width: 100%; display: flex;flex-direction: column;align-items: center;">
							<hr style="width: 100%; size: 3em;" />
							<div v-for="(each,key,index) in temp_data" style="width: 100%; display: flex;flex-direction: column;align-items: center;">
								<p>备注: {{each["comments"]}} </p>
								<div class="flex" style="white-space: pre-wrap;" @click="copy(key.substr(1,))">
									设备: {{key.substr(1,)}} <span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span> <span v-if="each.device_type != 3 && each['status']=='在线'" style="color: red;">{{each["status"]}} </span><span v-else-if="each.device_type != 3" style="">{{each["status"]}} </span>
								</div>
								<!-- 通用IO -->
								<div v-if="each['device_type'] == 0">
									<div v-for="(data_each,data_index) in each.datastreams" :obj="data_each.id" style="display: flex;flex-direction: column;align-items: center;">
										<div v-if="data_each['id'].slice(0,4)=='data' " style="display: flex;flex-direction: column;align-items: center;">
											<p>键值{{data_each["id"]}}: {{data_each["value"]}} at: {{data_each["at"].slice(0,10)+' ' +data_each["at"].slice(11,19)}}</p>
											<div v-if="check_in_show(key.substr(1,),data_each['id'])!=null">
												 <p v-if="data_each['value']==check_in_show(key.substr(1,),data_each['id'])" style="font-size: 60rpx;color: red;"> {{load_config_show(key.substr(1,),data_each['id'], "已开启")}}</p>
												 <p v-else style="font-size: 60rpx;color: blue;"> {{load_config_show(key.substr(1,),data_each['id'], "已关闭")}}</p>
											</div>
											 <div v-else class="flex" style="white-space: pre-wrap;">
												 <button v-if="check_seen_status(key.substr(1,),data_each['id'], 'on')" class="btn btn-primary" @click="send(key.substr(1,),data_each['id'], 'on');delay_fresh();">{{load_config_show(key.substr(1,),data_each['id'], "常高")}}</button>
												 <span v-if="check_seen_status(key.substr(1,),data_each['id'], 'on')" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
												 <button v-if="check_seen_status(key.substr(1,),data_each['id'], 'off')" class="btn btn-primary" @click="send(key.substr(1,),data_each['id'], 'off');delay_fresh();">{{load_config_show(key.substr(1,),data_each['id'], "常低")}}</button>
												 <span v-if="check_seen_status(key.substr(1,),data_each['id'], 'off')" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
												 <button v-if="check_seen_status(key.substr(1,),data_each['id'], 't_on')" class="btn btn-primary" @click="send(key.substr(1,),data_each['id'], 't_on');delay_fresh();">{{load_config_show(key.substr(1,),data_each['id'], "触高")}}</button>
												 <span v-if="check_seen_status(key.substr(1,),data_each['id'], 't_on')" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
												 <button v-if="check_seen_status(key.substr(1,),data_each['id'], 't_off')" class="btn btn-primary" @click="send(key.substr(1,),data_each['id'], 't_off');delay_fresh();">{{load_config_show(key.substr(1,),data_each['id'], "触低")}}</button>
											 </div>
										 </div>
										 <!-- <span v-html="'<br>'"></span> -->
									</div>
								</div>
								<!-- 剪裁版IO1 -->
								<div v-if="each['device_type'] == 1">
									<div v-for="(data_each,data_index) in each.datastreams" :obj="data_each.id" style="display: flex;flex-direction: column;align-items: center;">
										<div v-if="data_each['id'].slice(0,4)=='data'" style="display: flex;flex-direction: column;align-items: center;">
											<p>键值{{data_each["id"]}}: {{data_each["value"]}} {{data_each["at"].slice(0,10)+' ' +data_each["at"].slice(11,19)}}</p>
											<!-- <span v-html="'<br>'"></span>  -->
											<div v-if="check_in_show(key.substr(1,),data_each['id'])!=null">
												 <p v-if="data_each['value']==check_in_show(key.substr(1,),data_each['id'])" style="font-size: 60rpx;color: red;"> {{load_config_show(key.substr(1,),data_each['id'], "已开启")}}</p>
												 <p v-else style="font-size: 60rpx;color: blue;"> {{load_config_show(key.substr(1,),data_each['id'], "已关闭")}}</p>
											</div>
											<div v-else>
												<button v-if="check_seen_status(key.substr(1,),data_each['id'], 't_off')" class="btn btn-primary" @click="send(key.substr(1,),data_each['id'], 't_off');delay_fresh();">{{load_config_show(key.substr(1,),data_each['id'], "触低发送")}}</button>
											</div>
										</div>
									</div>
								</div>
								<!-- 红外控制 -->
								<!-- <div v-if="each['device_type'] == 2">
									<div class="flex" style="display: flex;flex-direction: column;align-items: center;">
										<p>红外控制</p>
									</div>
									<div class="flex" style="white-space: pre-wrap;">
										 <button class="btn btn-primary" @click="send(key.substr(1,),0, 'open')">打开</button>
										 <span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
										 <button class="btn btn-primary" @click="send(key.substr(1,),0, 'close')">关闭</button>
										 <span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
										 <button class="btn btn-primary" @click="send(key.substr(1,),0, 'up')">调高</button>
										 <span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
										 <button class="btn btn-primary" @click="send(key.substr(1,),0, 'down')">调低</button>
									</div>
								</div> -->
								<!-- 重命名for继电器控制-输出常低-继电器高电平触发 -->
								<div v-if="each['device_type'] == 'relay'">
									<div v-for="(data_each,data_index) in each.datastreams" :obj="data_each.id" style="display: flex;flex-direction: column;align-items: center;">
										<div v-if="data_each['id'].slice(0,4)=='data'" style="display: flex;flex-direction: column;align-items: center;">
											<p v-if="data_each['value']=='0'" style="font-size: 60rpx;color: blue;">{{data_each["id"].slice(4,)}} 关闭</p>
											<p v-if="data_each['value']=='1'" style="font-size: 60rpx;color: red;">{{data_each["id"].slice(4,)}} 开启</p>
											<p>{{data_each["at"].slice(0,10)+' ' +data_each["at"].slice(11,19)}}</p>
											 <div class="flex" style="white-space: pre-wrap;">
												 <button v-if="check_seen_status(key.substr(1,),data_each['id'], 'on')" style="height: 100rpx;font-size: 35rpx;" class="btn btn-primary" @click="send_check(key.substr(1,),data_each['id'], 'on');">{{load_config_show(key.substr(1,),data_each['id'], "开启")}}</button>
												 <span v-if="check_seen_status(key.substr(1,),data_each['id'], 'on')" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
												 <button v-if="check_seen_status(key.substr(1,),data_each['id'], 'off')" style="height: 100rpx;font-size: 35rpx;" class="btn btn-primary" @click="send(key.substr(1,),data_each['id'], 'off');delay_fresh();">{{load_config_show(key.substr(1,),data_each['id'], "关闭")}}</button>
												 <span v-if="check_seen_status(key.substr(1,),data_each['id'], 'off')" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
											 </div>
										 </div>
										 <!-- <span v-html="'<br>'"></span> -->
									</div>
								</div>

								<div v-if="each['device_type'] == 'relay_t_on'">
									<div v-for="(data_each,data_index) in each.datastreams" :obj="data_each.id" style="display: flex;flex-direction: column;align-items: center;">
										<div v-if="data_each['id'].slice(0,4)=='data'" style="display: flex;flex-direction: column;align-items: center;">
											<p>键值{{data_each["id"]}}: {{data_each["value"]}} at: {{data_each["at"].slice(0,10)+' ' +data_each["at"].slice(11,19)}}</p>
											 <div v-if="check_in_show(key.substr(1,),data_each['id'])!=null">
												 <p v-if="data_each['value']==check_in_show(key.substr(1,),data_each['id'])" style="font-size: 60rpx;color: red;"> {{load_config_show(key.substr(1,),data_each['id'], "已开启")}}</p>
												 <p v-else style="font-size: 60rpx;color: blue;"> {{load_config_show(key.substr(1,),data_each['id'], "已关闭")}}</p>
											 </div>
											 <div v-else-if="check_seen_status(key.substr(1,), data_each['id'], 't_on')" class="flex" style="white-space: pre-wrap;">
											 	<span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
												<button v-if="data_index/2==0" style="height: 100rpx;font-size: 35rpx;" class="btn btn-primary" @click="send_check(key.substr(1,),data_each['id'], 't_on');">{{load_config_show(key.substr(1,),data_each['id'], "打开开关")}}</button>
												<button v-else style="height: 100rpx;font-size: 35rpx;" class="btn btn-primary" @click="send(key.substr(1,),data_each['id'], 't_on');delay_fresh();">{{load_config_show(key.substr(1,),data_each['id'], "关闭开关")}}</button>
											 </div>
										 </div>
										 <!-- <span v-html="'<br>'"></span> -->
									</div>
								</div>

								<div v-if="each['device_type'] == 'relay_t_off'">
									<div v-for="(data_each,data_index) in each.datastreams" :obj="data_each.id" style="display: flex;flex-direction: column;align-items: center;">
										<div v-if="data_each['id'].slice(0,4)=='data'" style="display: flex;flex-direction: column;align-items: center;">
											<p>键值{{data_each["id"]}}: {{data_each["value"]}} at: {{data_each["at"].slice(0,10)+' ' +data_each["at"].slice(11,19)}}</p>
											 <div v-if="check_in_show(key.substr(1,),data_each['id'])!=null">
												 <p v-if="data_each['value']==check_in_show(key.substr(1,),data_each['id'])" style="font-size: 60rpx;color: red;"> {{load_config_show(key.substr(1,),data_each['id'], "已开启")}}</p>
												 <p v-else style="font-size: 60rpx;color: blue;"> {{load_config_show(key.substr(1,),data_each['id'], "已关闭")}}</p>
											 </div>
											 <div v-else-if="check_seen_status(key.substr(1,),data_each['id'], 't_off')" class="flex" style="white-space: pre-wrap;">
												 <span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
												 <button v-if="data_index/2==0" style="height: 100rpx;font-size: 35rpx;" class="btn btn-primary" @click="send_check(key.substr(1,),data_each['id'], 't_off');">{{load_config_show(key.substr(1,),data_each['id'], "打开开关")}}</button>
												 <button v-else style="height: 100rpx;font-size: 35rpx;" class="btn btn-primary" @click="send(key.substr(1,),data_each['id'], 't_off');delay_fresh();">{{load_config_show(key.substr(1,),data_each['id'], "关闭开关")}}</button>
											 </div>
										 </div>
										 <!-- <span v-html="'<br>'"></span> -->
									</div>
								</div>


								<!-- 地图显示 -->
								<div v-if="each['device_type'] == 3 || each['device_type'] == 4|| each['device_type'] == 5" style="width: 100%; display: flex;flex-direction: column;align-items: center;">
									<!-- {{each.datastreams[0]["value"]["lat"]}} -->
									<div v-for="(data_each,data_index) in each.datastreams" :obj="data_each.id" style="width: 100%; display: flex;flex-direction: column;align-items: center;">
										<div v-if="(each['device_type'] == 4 || each['device_type'] == 5) && (data_each['id'].slice(0,4)=='data')" style="display: flex;flex-direction: column;align-items: center;">
											<!-- <button v-if="data_each['id'].slice(0,4)=='data'" class="btn btn-secondary" style="height: 50rpx;font-size: 24rpx;" @click="send(key.substr(1,),data_each['id'], 't_off');delay_fresh();">触低发送</button> -->
											<div v-if="data_each['id']=='datalast'" class="flex" style="white-space: pre-wrap;">
												 <p v-if="data_each['value']=='data1'"> 最近:开指令-{{data_each["at"].slice(0,10)+' ' +data_each["at"].slice(11,19)}}</p>
												 <p v-else> 最近:关指令-{{data_each["at"].slice(0,10)+' ' +data_each["at"].slice(11,19)}}</p>
											</div>
											<div v-if="data_each['id']=='data1'" class="flex" style="white-space: pre-wrap;">
												<button style="margin-top: 10rpx; height: 60rpx;font-size: 28rpx;" class="btn btn-primary" @click="send_check(key.substr(1,),'data1', 't_off');">{{load_config_show(key.substr(1,),'data1', "车门打开")}}</button>
												<span v-if="check_seen_status(key.substr(1,),data_each['id'], 'on')" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
												<button style="margin-top: 10rpx;height: 60rpx;font-size: 28rpx;" class="btn btn-primary" @click="send(key.substr(1,),'data2', 't_off');delay_fresh();">{{load_config_show(key.substr(1,),'data2', "车门上锁")}}</button>
											</div>
										</div>
										<view v-if="data_each.id == 'location'" class="row-bottom" style="width: 100%; display: flex;flex-direction: column;align-items: center;">
											<p>{{data_each["at"]}}</p>
											<p v-if="data_each.value.battery">剩余电量: {{calc_percent_by_voltage(data_each.value.battery)}}%</p>
											<p v-if="data_each.value.ssid">距离最近WIFI: {{data_each.value.ssid}}</p>
											<!-- <p>{{data_each.value.lon}},{{data_each.value.lat}}</p> -->
											<map id="map" :enable-satellite="input_val[12]" :longitude="data_each.value.lon" :latitude="data_each.value.lat" :scale="16"
											:markers="[{
											id: data_index,
											latitude: data_each.value.lat,longitude: data_each.value.lon,
											width: 20,height: 20,
											title: each.comments,
											<!-- #ifdef H5 -->
											iconPath: '/static/images/location.png',
											<!-- #endif -->
										}]" style="width: 100%; height: 500rpx;"></map>
										<!-- show-location -->
										<div class="flex" style="white-space: pre-wrap;">
											<uni-datetime-picker type="datetime" v-model="timeStart" @change="changeTime($event, 'start')" />
											-
											<uni-datetime-picker type="datetime" v-model="timeEnd" @change="changeTime($event, 'end')" />
										</div>
										<div class="flex" style="white-space: pre-wrap;">
											<button class="btn btn-secondary" @click="create_path(key.substr(1,));">轨迹回看</button>
											<span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
											<button class="btn btn-secondary" @click="jump_manage_rail(key.substr(1,), data_each.value.lat, data_each.value.lon, data_each.value.erail, data_each.value.erail_flag);">电子围栏</button>
											<span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
											<button class="btn btn-secondary" @click="open_location(data_each.value.lat, data_each.value.lon);">位置导航</button>
										</div>
										
										<div v-if="each['device_type'] == 4" class="flex" style="white-space: pre-wrap; text-align:center;vertical-align:middel;">
											<input v-model="data_each.value.st[0]" placeholder="定时报间隔-0关" style="width: 50%;border:0.5px solid #378888; white-space: pre-wrap;" type="text"/>
											<button class="btn btn-secondary" style="height: 50rpx;font-size: 24rpx;" @click="set_onenet_http(key.substr(1,), 'st', data_each.value.st.join());">修改上报配置</button>
										</div>
										
										<div v-if="each['device_type'] == 5" class="flex" style="display: flex; align-items: center; margin-bottom: 10px; text-align: center; margin-top: 10px; ">
											<span style="width: 20%; white-space: pre-wrap;">定时报</span>
											<input v-model="data_each.value.st[0]" placeholder="定时报间隔-0关" style="width: 20%;border:0.5px solid #378888; white-space: pre-wrap;" type="text"/>
											<span v-if="data_each.value.st[1] != null" style="width: 20%; white-space: pre-wrap;">指令查</span>
											<input v-if="data_each.value.st[1] != null" v-model="data_each.value.st[1]" placeholder="指令查间隔" style="width: 20%;border:0.5px solid #378888;" type="text">
											<button class="btn btn-secondary" style="margin-right: auto;width: 35%; background-color: bisque;color:black; height: 50rpx;font-size: 24rpx;" @click="set_onenet_http(key.substr(1,), 'st', data_each.value.st.join());">保存配置(分钟)</button>
										</div>
										<div v-if="each['device_type'] == 5 && data_each.value.m_conf[0] != null && data_each.value.m_conf[0] != '' && data_each.value.m_conf[0] != '0'" class="flex" style="display: flex; align-items: center; text-align: center; ">
											<span style="width: 40%; white-space: pre-wrap;">震动最小间隔</span>
											<input v-model="data_each.value.m_conf[2]" placeholder="(分钟)" style="width: 20%;border:0.5px solid #378888; white-space: pre-wrap;" type="text"/>
											<button class="btn btn-secondary" style="margin-right: auto;width: 35%; background-color: bisque;color:black; height: 50rpx;font-size: 24rpx;" @click="set_onenet_http(key.substr(1,), 'm_conf', data_each.value.m_conf.join());">保存震动配置</button>
										</div>
										
										<div v-if="each['device_type'] == 5" class="flex" style="white-space: pre-wrap; text-align:center;vertical-align:middel;">
											<button v-if="data_each.value.st[1] != null" class="btn btn-secondary" style="background-color: #532222;height: 50rpx;font-size: 24rpx;" @click="data_each.value.st = [data_each.value.st[0]]; set_onenet_http(key.substr(1,), 'st', data_each.value.st.join());delay_fresh(200);">关指令查</button>
											<button v-else class="btn btn-secondary" style="background-color:darkslateblue;height: 50rpx;font-size: 24rpx;" @click="data_each.value.st = [data_each.value.st[0]==''?0:data_each.value.st[0], 1.0, 0]; set_onenet_http(key.substr(1,), 'st', data_each.value.st.join());delay_fresh(200);">开指令查</button>
											<span v-html="'&nbsp;'"></span>
											<button v-if="data_each.value.st[1] != null && data_each.value.st[2]!=1" class="btn btn-secondary" style="background-color:darkslateblue;height: 50rpx;font-size: 24rpx;" @click="data_each.value.st[2] = 1; set_onenet_http(key.substr(1,), 'st', data_each.value.st.join()); delay_fresh(200);">下发定位指令</button>
											<button v-else-if="data_each.value.st[1] != null" class="btn btn-secondary" style="background-color:#532222;height: 50rpx;font-size: 24rpx;">刷新等待</button>
											<span v-html="'&nbsp;'"></span>
											<button v-if="data_each.value.m_conf[0] == '' || data_each.value.m_conf[0] == null || data_each.value.m_conf[0] == '0'" class="btn btn-secondary" style="background-color:darkslateblue;height: 50rpx;font-size: 24rpx;" @click="data_each.value.m_conf = ['1', data_each.value.m_conf[0]!='1'?'0':data_each.value.m_conf[1], data_each.value.m_conf[2]!=null?data_each.value.m_conf[2]:'0']; set_onenet_http(key.substr(1,), 'm_conf', data_each.value.m_conf.join());delay_fresh(200);">开启震动开机</button>
											<button v-else class="btn btn-secondary" style="background-color: #532222;height: 50rpx;font-size: 24rpx;" @click="data_each.value.m_conf = ['0', '0', data_each.value.m_conf[2]!=null?data_each.value.m_conf[2]:'0']; set_onenet_http(key.substr(1,), 'm_conf', data_each.value.m_conf.join());delay_fresh(200);">关闭震动开机</button>
										</div>
										
										
										</view>
									</div>
								</div>

								<div v-if="each['device_type'] == 'dmsg'">
									<div v-for="(data_each,data_index) in each.datastreams" :obj="data_each.id" style="display: flex;flex-direction: column;align-items: center;">
										<div v-if="data_each['id'].slice(0,3)=='msg'" style="display: flex;flex-direction: column;align-items: center;">
											<span v-html="'<br>'"></span>
											<p>{{data_each["at"].slice(0,10)+' ' +data_each["at"].slice(11,19)}}</p>
											<p v-if="data_each['value'].split(',')[0]=='volte'">可听来电 - {{data_each['value'].split(',')[3]}}</p>
											<p v-else>短信-{{data_each['value'].split(',')[2]}}</p>
											<span v-html="'<br>'"></span>
											<button style="height: 100rpx;font-size: 35rpx;" class="btn btn-primary" @click="get_dmsg_log(key.substr(1,));">查询历史消息</button>
										 </div>
										 <!-- <span v-html="'<br>'"></span> -->
									</div>
								</div>
								
								<!-- #ifdef H5 -->
								<hr style="width: 100%; size: 3em;" />
								<!-- #endif -->
								<!-- #ifndef H5 -->
								<view class="divider" />
								<!-- #endif -->
							</div>
							<span v-html="'<br>'"></span> 
							<span v-html="'<br>'"></span> 
							<span v-html="'<br>'"></span> 
						</div>

						<div v-if="seen_id==1" style="display: inline-block;">
							
							<div style="border:1px solid #532222; white-space: pre-wrap;">
							<div class="flex" style="white-space: pre-wrap;">
								<button class="btn btn-secondary" @click="export_info();">一键导出配置</button>
								<span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
								<button class="btn btn-secondary" @click="load_info();">一键导入配置</button>
							</div>
							<span v-html="'<br>'"></span>
							<label style="float:left;">一键配置框: </label>
							<input maxlength="-1" v-model="info_dump" style="border:0.5px solid #378888; white-space: pre-wrap;">
							</div>
							
							<span v-html="'<br>'"></span><span v-html="'<br>'"></span>
							
							
							<div style="border:1px solid #532222; white-space: pre-wrap;">
								<label style="float:left">卫星图设置：</label>
								<checkbox-group @change="change_stat(input_val, 12);">
									<checkbox :value="1" :checked="input_val[12]"/>
								</checkbox-group>
								<span v-html="'<br>'"></span>
								<label style="float:left">PIN码(动态密码)：</label> <input v-model="input_val[11]" style="border:0.5px solid #378888; white-space: pre-wrap;">
								<span v-html="'<br>'"></span>
								<button class="btn btn-secondary" style="width: 70%;" @click="change();">保存上述配置到本机</button>
							</div>
							<span v-html="'<br>'"></span>
							
							
							
							<span v-html="'<br>'"></span><span v-html="'<br>'"></span>
							
							<label style="float:left">详细参数：</label>
							<checkbox-group @change="enable_detail_view = (enable_detail_view+1)%2;">
								<checkbox :value="1" :checked="enable_detail_view"/>
							</checkbox-group>
							<span v-html="'<br>'"></span>
							
							<div v-if="enable_detail_view==1">
							<label style="float:left">唯一产品ID(旧版接入则不填此项！)</label>
							<span v-html="'<br>'"></span>
							<input v-model="input_val[8]" style="border:0.5px solid #378888; white-space: pre-wrap;">

							<label style="float:left" @click="showPwd">唯一密钥(点击显示)：</label>
							<span v-html="'<br>'"></span>
							<input maxlength="-1" v-model="input_val[2]" :password="showPassword" style="border:0.5px solid #378888; white-space: pre-wrap;">

							<label style="float:left">设备名(旧版填设备ID！英文逗号分隔)：</label>
							<span v-html="'<br>'"></span>
							<input maxlength="-1" v-model="input_val[0]" style="border:0.5px solid #378888; white-space: pre-wrap;">

							<label style="float:left">备注(多个则英文逗号分隔)：</label>
							<span v-html="'<br>'"></span>
							<input v-model="input_val[1]" style="border:0.5px solid #378888; white-space: pre-wrap;">

							<label style="float:left">设备类型(0/1/2/.., 多则英文逗号分隔)：</label>
							<span v-html="'<br>'"></span>
							<input v-model="input_val[7]" style="border:0.5px solid #378888; white-space: pre-wrap;">

							<label style="float:left">继电器触发秒数/s(可选)：</label> <input v-model="input_val[3]" style="border:0.5px solid #378888; white-space: pre-wrap;">
							<span v-html="'<br>'"></span>

							<label style="float:left">HID页面-设备名(HID专用, 可选)：</label> <input v-model="input_val[4]" style="border:0.5px solid #378888; white-space: pre-wrap;">
							<span v-html="'<br>'"></span>

							<label style="float:left">邮箱号(多则逗号分隔)：</label> <input v-model="input_val[10]" style="border:0.5px solid #378888; white-space: pre-wrap;">
							<span v-html="'<br>'"></span>

							<label style="float:left">个性化配置：</label>
							<input maxlength="-1" v-model="input_val[9]" style="border:0.5px solid #378888; white-space: pre-wrap;">
							<span v-html="'<br>'"></span>


							<button class="btn btn-primary" @click="change();">保存上述配置到本机</button>
							<span v-html="'<br>'"></span>
							<!-- #ifdef H5 -->
							<div class="flex" style="white-space: pre-wrap;">
								<button class="btn btn-secondary" @click="jump_manage_timer();">定时继电配置</button>
							</div>
							<!-- #endif -->
							<!-- #ifndef H5 -->
							定时功能需使用网页版，详情见小程序说明
							<!-- #endif -->
							
							</div>
							
						</div>

						<div v-if="seen_id==2" style="display: inline-block;">
							<div v-for="(each,key,index) in temp_data" style="display: flex;flex-direction: column;align-items: center;">
								<div class="flex" style="white-space: pre-wrap;" @click="copy(key.substr(1,))">
									设备: {{key.substr(1,)}} <span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span> <span v-if="each.device_type != 3 && each['status']=='在线'" style="color: red;">{{each["status"]}} </span><span v-else-if="each.device_type != 3" style="">{{each["status"]}} </span>
								</div>
								<div class="flex" style="white-space: pre-wrap;">
									 <button class="btn btn-primary" @click="send_usb('mkl')" style="display: flex;flex-direction: column;align-items: center;">鼠标左键</button>
									 <span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
									 <button class="btn btn-primary" @click="send_usb('mkr')" style="display: flex;flex-direction: column;align-items: center;">鼠标右键</button>
								</div>

								<div class="flex" style="white-space: pre-wrap;"><button class="btn btn-primary" @click="send_usb('mup')" style="display: flex;flex-direction: column;align-items: center;">鼠标上</button></div>
								<div class="flex" style="white-space: pre-wrap;">
									 <button class="btn btn-primary" @click="send_usb('mleft')" style="display: flex;flex-direction: column;align-items: center;">鼠标左</button>
									 <input v-model="input_val[6]" style="width: 30upx;">
									 <!-- @touchstart="send_usb('mright')" @touchend= -->
									 <button class="btn btn-primary" @click="send_usb('mright')" style="display: flex;flex-direction: column;align-items: center;">鼠标右</button>
								</div>
								<div class="flex" style="white-space: pre-wrap;"><button class="btn btn-primary" @click="send_usb('mdown')" style="display: flex;flex-direction: column;align-items: center;">鼠标下</button></div>

								<label style="float:left">下发内容-支持中文：</label>
								<span v-html="'<br>'"></span>
								<input v-model="input_val[5]" style="border:0.5px solid #378888; white-space: pre-wrap;">
								<div class="flex" style="white-space: pre-wrap;">
									 <button class="btn btn-primary" @click="send_usb('kb')" style="display: flex;flex-direction: column;align-items: center;">文本内容发送</button>
									 <span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
									 <button class="btn btn-primary" @click="send_usb('dkb');" style="display: flex;flex-direction: column;align-items: center;">特殊按键发送</button>
								</div>
								<!-- #ifdef H5 -->
								<hr style="width: 100%; size: 3em;" />
								<!-- #endif -->
								<!-- #ifndef H5 -->
								<view class="divider" />
								<!-- #endif -->

							</div>
							<span v-html="'<br>'"></span>
							<span v-html="'<br>'"></span>
							<span v-html="'<br>'"></span>
							<button class="btn btn-primary" @click="change();">保存上述配置到本机</button>
						</div>

						<div v-if="seen_id==3" style="display: inline-block;">
							<text class="flex flex-direction" style="width: 100%; display: flex;flex-direction: column;align-items: center;">
								联系方式: 可通过bilibili平台关注[摸鱼大鸽]，也可添加开发者微信号: moyudage123 联系定制、邀请进交流群等。
								购买方式: 可某宝搜索“合羽计算科技”购买咨询~
								团队承接物联网软硬件全栈研发定制、FPGA/MCU/嵌入式/小程序/推荐&图像算法工程等，欢迎来单咨询
							</text>
							<span v-html="'<br>'"></span>
							
							<text>
								小程序由摸鱼大鸽开发，用于广域网下的远程控制/定位追踪/电子围栏/红外控制/广域HID注入等功能，已部署案例：电脑远程开机、车库门控制、随车定位追踪、家居控制、短信接码等。

								· 补充：极个别特殊功能如定时功能由于使用了三方后端，需使用网页版应用，浏览器打开http://api.moyudage.top:8880/files/mydgh5/ 其他部分与小程序用法完全相同。
							</text>

							<span v-html="'<br>'"></span>
							<text class="flex flex-direction" style="width: 100%; display: flex;flex-direction: column;align-items: center;">
								本小程序无三方后端，小程序直连中国移动onenet物联网平台(中国移动免费平台)，用户可自行注册绑定，所有数据保存在小程序本地缓存中，若有备份需要可以一键导出/导入，小程序支持下拉刷新和定时刷新。
							</text>
							<span v-html="'<br>'"></span>
							<text class="flex flex-direction" style="width: 100%; display: flex;flex-direction: column;align-items: center;">
								暂不接受捐赠，您的bilibili点赞/关注是作者开发的动力~
								version: 2024-0719
							</text>
						</div>

<!-- ------------------------------------------------------------------------------- -->
<!-- ------------------------------------------------------------------------------- -->
						<!-- -1轨迹独立页面-需返回按钮 -->
						<div v-if="seen_id==-1" style="display: inline-block;">
							<button class="btn btn-primary" @click="restore_seen_id();">返回原主页</button>
							<span v-html="'<br>'"></span>
							<map id="map" :enable-satellite="input_val[12]" :longitude="polyline[0].points[0].longitude" :latitude="polyline[0].points[0].latitude"
										:include-points="polyline[0].points" :polyline="polyline" :markers="polyline[0].markers" style="width: 100%; height: 750rpx;"></map>
							<div class="flex" style="white-space: pre-wrap;">
								<uni-datetime-picker type="datetime" v-model="timeStart" @change="changeTime($event, 'start')" />
								-
								<uni-datetime-picker type="datetime" v-model="timeEnd" @change="changeTime($event, 'end')" />
							</div>
							<div class="flex" style="white-space: pre-wrap;">
								<button class="btn btn-secondary" @click="create_path();">生成轨迹并查看</button>
								<span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
								<button class="btn btn-secondary" @click="open_location();">终点位置导航</button>
							</div>
						</div>

						<!-- -2定时独立页面-需返回按钮 -->
						<div v-if="seen_id==-2" style="display: inline-block;">
							<button class="btn btn-primary" @click="restore_seen_id();">返回原主页</button>
							<span v-html="'<br><br>'"></span>


							<div class="flex" style="white-space: pre-wrap;">
								<button class="btn btn-secondary" @click="get_timer_info();">从服务器拉取</button>
								<span v-html="'&nbsp;&nbsp;&nbsp;&nbsp;'"></span>
								<button class="btn btn-secondary" @click="set_timer_info();">同步到服务器</button>
							</div>


							<span v-html="'<br>'"></span>


							<div v-for="(data_each, device_id,data_index) in config_json['timer']" :obj="device_id"
							v-if="device_id!='api_key'" style="border: 1px solid gray;display: flex;flex-direction: column;align-items: center;">
								{{ temp_data["+"+device_id]['comments'] }}
								{{ device_id }}
								<div v-if="mybackend_res['sync'][device_id] != null" style="color:  blue;">已同步 {{ mybackend_res['sync'][device_id] }}</div>
								<div v-else style="color:  red;">未同步</div>
								<div v-if="mybackend_res['emailmap'][device_id] != null" style="">邮箱 {{ mybackend_res['emailmap'][device_id] }}</div>

								<div @click="del_timer_config(device_id, data_in_index, data_item)" v-for="(data_item,data_in_index) in data_each['rules']" :obj="data_in_index"
								style="display: flex;flex-direction: column;align-items: center;">
								<span v-html="'<br>'"></span>
								第{{ data_in_index+1 }}条配置 <br>
								{{ get_show_info_from_config(device_id, data_item) }}
								<!-- #ifdef H5 -->
								<hr style="width: 100%; size: 3em;" />
								<!-- #endif -->
								<!-- #ifndef H5 -->
								<view class="divider" />
								<!-- #endif -->
								<span v-html="'<br>'"></span>
								</div>
							</div>


							<span v-html="'<br><br>'"></span>
							<h1 class="flex" style="white-space: pre-wrap; align-items: center;justify-content: center; color: #378888;">新增配置</h1>
							<div style="border: 1px solid gray;">
							<uni-data-picker :localdata="manage_timer_v['pick_data']" placeholder="请选择设备及引脚规则" popup-title="请选择设备及引脚规则" @change="select_timer_item($event)"></uni-data-picker>

							<span v-html="'<br>'"></span>

							<div class="flex" style="white-space: pre-wrap; align-items: center;justify-content: center;">
							<picker style="width: 20%;" mode="time" :value="manage_timer_v['picked'][0]" @change="select_timer_time">
								<view class="uni-input"><span style="color: blue;">{{ manage_timer_v['picked'][0] }}</span></view>
							</picker>
							<view style="width: 80%; border: 1px solid gray;">
							<rudon-multiSelector welcome="规律设置" :is_using_slot="false" :localdata="manage_timer_v['pick_duplicate']" @change="trigger_timer_duplicate($event)" >
							</rudon-multiSelector>
							</view>

							</div>
							<span v-html="'<br>'"></span>
							<button class="btn btn-secondary" @click="create_timer_config();">新增配置到本地</button>
							</div>


						</div>

						<!-- -3围栏独立页面-需返回按钮 -->
						<div v-if="seen_id==-3" style="display: inline-block;">
							<button class="btn btn-primary" @click="restore_seen_id();">返回原主页</button>
							<span v-html="'<br>'"></span>

							<div>
								最新坐标：{{rail_val[0]}}, {{rail_val[1]}}.
								<span v-if="rail_val[4]==1" style="color: red;">告警</span><span v-else style="color: green;">正常</span>
							</div>
							<span v-html="'<br>'"></span>
							<div class="flex" style="white-space: pre-wrap; text-align:center;vertical-align:middel;">
								选点坐标<input v-model="rail_val[0]" placeholder="输入纬度" style="width: 35%;border:0.5px solid #378888; white-space: pre-wrap;" type="text"/>
								<input v-model="rail_val[1]" placeholder="输入经度" style="width: 35%;border:0.5px solid #378888; white-space: pre-wrap;" type="text"/>
							</div>
							<map id="map" :enable-satellite="input_val[12]" :polygons="get_poly_list(rail_val[3])" :longitude="rail_val[1]" :latitude="rail_val[0]" :scale="16"
								:markers="[{
								id: 0,
								latitude: rail_val[0],longitude: rail_val[1],
								width: 20,height: 20,
								title: rail_val[2],
								<!-- #ifdef H5 -->
								iconPath: '/static/images/location.png',
								<!-- #endif -->
							}]" style="width: 100%; height: 500rpx;"></map>

							<div>
								<span v-html="'<br>'"></span>
								<label style="float:left">围栏设置</label>
								<input maxlength="-1" v-model="rail_val[3]" style="border:0.5px solid #378888; white-space: pre-wrap;" />
								</div>
							<span v-html="'<br>'"></span>

							<button class="btn btn-primary" @click="set_onenet_http(rail_val[2], 'erail', rail_val[3]);">提交/更新围栏设置</button>
							<span v-html="'<br>'"></span>
						</div>
						
						<!-- -4dmsg历史查询独立界面-需返回按钮 -->
						<div v-if="seen_id==-4" style="display: inline-block;">
							<button class="btn btn-primary" @click="restore_seen_id();">返回原主页</button>
							<span v-html="'<br><br>'"></span>
						    <div v-for="(data_each,data_index) in temp_data" style="width: 100%; display: flex;flex-direction: column;align-items: center;">
						        <p style="color: orangered">{{data_each["at"]}}</p>
								<span v-html="'<br>'"></span>
								<p v-if="data_each['value'].split(',')[0]=='volte'"><button @click="get_play_volte(_tmp_seen_detail_device,data_each['value']);">播放语音信息-{{data_each['value'].split(',')[3]}}</button></p>
								<p v-else @click="showToast(data_each['value'])">{{data_each['value'].split(',')[2]}}</p>
								<span v-html="'<br>'"></span>
								<!-- #ifdef H5 -->
								<hr style="width: 100%; size: 3em;" />
								<!-- #endif -->
								<!-- #ifndef H5 -->
								<view class="divider" />
								<!-- #endif -->
								
							</div>
						</div>
				</div>


	    </div>


</template>

<script>
	import index from "./index.js";
	export default index;
</script>

<style>
	.flex {
	    display: -webkit-box;
	    display: -moz-box;
	    display: -ms-flexbox;
	    display: -webkit-flex;
	    display: flex;
	}

	.flex-child {
	    -webkit-box-flex: 1 1 auto;
	    -moz-box-flex:  1 1 auto;
	    -webkit-flex:  1 1 auto;
	    -ms-flex:  1 1 auto;
	    flex:  1 1 auto;
	    margin-right:5upx;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}



	/* .charts{width: 750upx; height:500upx;background-color: #FFFFFF;} */
	.charts{width: 750upx; height:500upx;background-color: #FFFFFF;}
</style>
