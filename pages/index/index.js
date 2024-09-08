// import uCharts from '@/static/u-charts/u-charts.js';
// import wxCharts from '@/static/wxcharts.js'; //@=../..
// var mqtt = require('@/static/mqtt.min.js');
var _self;
// var canvaGauge=null; //必须！否则报错
// //这里的Data为测试使用，生产环境请从服务器获取
// var Data={
// 	LineA:{categories:['2012', '2013', '2014', '2015', '2016', '2017'],series:[{name: '成交量A',data:[35, 20, 25, 37, 4, 20]},{name: '成交量B',data:[70, 40, 65, 100, 44, 68]},{name: '成交量C',data:[100, 80, 95, 150, 112, 132]},{name: '成交量D',data:[100, 80, 95, 150, 112, 132]}]},
// 	}

export default {
	data() {
		return {
			showPassword: true,
			product_id: "", //决定是否使用旧版
			device_ids: "",
			device_type: "",
			api_key: "",
			comments: "",
			trigger_time: "",
			hid_usb: "",
			hid_usb_context: "",
			// canvasnamelist:["canvasGauge0","canvasGauge1"],
			// username: "",
			intervalId: null,
			seen_id_tags: ["远程物联", "修改信息", "广域HID", "小程序介绍及联系方式"],
			seen_id: 1,
			// 地图轨迹
			timeStart: '',
			timeEnd: '',
			polyline:[
				{//指定一系列坐标点，从数组第一项连线至最后一项
				points:[],
				markers:[],
				color: "#31c27c",
				width:10,//线的宽度
				arrowLine: true,
				// 　　　　dottedLine:true,//是否虚线
				}
			],
			polykey: '',
			//////////////
			///画图变量
			cWidth:'',
			cHeight:'',
			pixelRatio:1,
			//翻页变量
			temp_index: 0,
			all_count: null,
			charts_len: 7,
			//
			info_dump: '',
			input_val: [null, null, null, null,
				null, null, 5, null,
				null, null, "", "", 
				0], //初始化, null可缺省
			// 0-设备ids，1-备注，2-apikey，3-触发秒数，4-hidusbid, [5-hidusb文本，6-hidusb速度]
			// 7-类型[0-全IO,1-剪裁IO,2-红外控制,3-地图类型, 4-地图类型定时工作版]，
			// 8-产品id, 9-补充配置的字符串输入, 10-邮箱号, 11-PIN码
			// 12-卫星图模式

			rail_val: [36.2332, 120.23423, "", "", 0], //围栏相关 - 经纬度，设备号，新规则"{0:[[[lat1,lon1],[lat2,lon2]], ...]}"], 触发规则
			config_json: {}, // 补充配置

			emails: "",
			pincode: "",
			res_pincode: "",
			enable_detail_view: 0,

			temp_data: {},
			//#ifndef H5
			direction: "https://iot-api.heclouds.com", // "http://183.230.40.34"
			direction_old: "https://api.heclouds.com", // 183.230.40.33
			mybackend: "http://127.0.0.1:8880/openapi",
			//#endif
			//#ifdef H5
			direction: "/apionenets", //"/api",
			direction_old: "/apionenet",
			mybackend: "/openapi",
			//#endif
			mybackend_res: {"sync": {}, "emailmap": {}},
			// manage_timer_v: {"pick_data": [], "picked": ["12:00", "", "", "", "", []], "pick_action": {"on":"常高", "off":"常低", "t_on":"触高", "t_off":"触低"},
			// 	"pick_duplicate": [{label: "仅一次",value: "once"},{label: "每天",value: "all"},{label: "周一",value: "1"},{label: "周二",value: "2"},{label: "周三",value: "3"},{label: "周四",value: "4"},{label: "周五",value: "5"},{label: "周六",value: "6"},{label: "周日",value: "7"}]
			// },
			manage_timer_v: {"pick_data": [], "picked": ["12:00", ], "pick_action": {"on":"常高", "off":"常低", "t_on":"触高", "t_off":"触低"},
				"pick_duplicate": [{text: "仅一次",value: "once", is_selected: false},{text: "每天",value: "all", is_selected: false},{text: "周一",value: "1", is_selected: false},{text: "周二",value: "2", is_selected: false},{text: "周三",value: "3", is_selected: false},{text: "周四",value: "4", is_selected: false},{text: "周五",value: "5", is_selected: false},{text: "周六",value: "6", is_selected: false},{text: "周日",value: "7", is_selected: false}]
			},
			
			_tmp_seen_detail_device: "",
			volte_data: "", // new ArrayBuffer(153600),
			innerAudioContext: uni.createInnerAudioContext(),
		}
	},
	onLoad(options) {
		// console.log("Op:",options)
		// if(options=={}){
		// this.username="test";
		// }
		// else{
		// this.username = options.username;
		// }
		this.restore_seen_id();
		// this.seen_id = -3;
		console.log("seen_id:", this.seen_id);

		//加载时先刷新一下
		this.fresh();
		// this.check_main(this.seen_id);

		//定时器
		// this.dataRefresh();

		//画布
		_self = this;
		//#ifdef H5 || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
		uni.getSystemInfo({
			success: function (res) {
				if(res.pixelRatio>1){
					_self.pixelRatio =2;
					//正常这里_self.pixelRatio给2就行，如果要求高可用下行
					//_self.pixelRatio =res.pixelRatio;
				}
			}
		});
		//#endif
		this.cWidth=uni.upx2px(750);
		this.cHeight=uni.upx2px(500);
	},
	onReady() {
		// this.showLineA("canvasLineA",Data.LineA);
			},
	onShow(){
		this.timeStart = new Date(new Date().getTime() - (24-8)*60*60*1000).toISOString().split('.')[0];
		this.timeEnd = new Date(new Date().getTime() + 8*60*60*1000).toISOString().split('.')[0];
		// debug
	},
	methods: {
		//////////////////////////////////
			quit(event) {
				  var url = "../index/index"
				  wx.navigateTo({url})
			},
			// draw(){
			// 	this.showLineA("canvasLineA",Data.LineA);
			// },
			fresh() {
				console.log("fresh")
				this.change_seen_id(this.seen_id);
			},
			// 定时刷新数据函数
			dataRefresh() {
				// 计时器正在进行中，退出函数
				if (this.intervalId != null) {
					return;
				}
				// 计时器为空，操作
				this.intervalId = setInterval(() => {
					// console.log("刷新 " + new Date());
					this.fresh(); //加载数据函数
				}, 30000);
			},
			// 停止定时器
			clear() {
				clearInterval(this.intervalId); //清除计时器
				this.intervalId = null; //设置为null
			},
			//定时器
			created() {
				this.dataRefresh();
			},
			destroyed() {
				// 在页面销毁后，清除计时器
				this.clear();
			},
			/////////////////////////////////////
			//操作--button1
			change_seen_id(new_seen_id){
				console.log(new_seen_id);
				var that = this;
				var changed = false;
				if(new_seen_id != that.seen_id)
				{
					changed = true;
					that.seen_id = new_seen_id;
					if(new_seen_id>=0){
						uni.setStorageSync("seen_id", that.seen_id);
					}
				}
				// 主页刷新
				if(that.seen_id == '0'){
					that.check_main(0);
				}else if(that.seen_id == '1'){
					that.init_info();
					// if(changed){that.init_info();}
				}else if(that.seen_id == '2'){
					that.check_main(2);
				}
				// this.debug();
			},
			restore_seen_id(e){
				if(uni.getStorageSync("seen_id")){
					// this.seen_id = uni.getStorageSync("seen_id");
					this.change_seen_id(uni.getStorageSync("seen_id"));
				} else{
					this.change_seen_id(0);
				}
			},
			onPullDownRefresh () {
				console.log('触发下拉刷新了');
				this.fresh();
				uni.stopPullDownRefresh();
				this.$forceUpdate(); // 异步后拉到数据后刷新
			},
			getDefaultDict(input_dict, input_key, default_val=''){
				return input_dict[input_key]?input_dict[input_key]:(default_val?default_val:input_key);
			},
			check_main(seen_id = "") {
				console.log("check once");
				var that = this;
				that.load_storage();
				var device_id_split = that.device_ids.split(",");
				var comments_split = that.comments.split(",");
				var devices_type = that.device_type.split(",");
				var hid_usb_split = that.hid_usb.split(",");
				var temp_data = {};
				that.res_pincode = "";

				try{
					// WIFI-HID类型只查询在线状态
					if (seen_id == 2){
						for(var idx=0;idx<hid_usb_split.length;idx++){
							temp_data["+"+hid_usb_split[idx]] = {
								"status": "在线",
								"datastreams": [],
							}
							if(that.product_id){
								uni.request({
								url: that.direction + "/device/detail?product_id=" + that.product_id.split("&")[0] + "&device_name=" + that.hid_usb,
								header: { "authorization": that.api_key.split(";")[0]},
								method:'GET',//请求方式  或GET，必须为大写
								success: res => {
									if (res.data["code"] == 0){
										device_id_split.forEach(function (element, index, array) {
											if(element.indexOf(res.data["data"]["name"]) !== -1 ) temp_data["+"+element]["status"] = "";
										});
									}
								}
							});}
						}
						if(!that.product_id){
							uni.request({
								url: that.direction_old + "/devices/status",
								// url: "http://183.230.40.34/devices/status",
								header: { "api-key": that.api_key},
								data: {'devIds':that.hid_usb},
								method:'GET',//请求方式  或GET，必须为大写
								success: res => {
									// console.log('返回status', res.data["data"]);
									for (var idx=0; idx < res.data["data"]["devices"].length; idx++){
										var device_data = res.data["data"]["devices"][idx];
										if (device_data["online"] == false){
											temp_data["+"+device_data["id"]]["status"] = ""; //离线
										}
									}
								}
							});
						}
					}
					else {
						// 首页
						for(var idx=0;idx<device_id_split.length;idx++){
							temp_data["+"+device_id_split[idx]] = {
								"device_type": devices_type[idx],
								"comments": comments_split[idx],
								"status": "在线",
								"datastreams": [],
							};
							if(that.product_id){
								uni.request({
									url: that.direction + "/device/detail?product_id=" + that.product_id.split("&")[0] + "&device_name=" + device_id_split[idx].split("&")[0],
									header: { "authorization": that.api_key.split(";")[0]},
									method:'GET',//请求方式  或GET，必须为大写
									success: res => {
										if (res.data["code"] == 0){
											device_id_split.forEach(function (element, index, array) {
												if(res.data["data"]["status"] != 1 ) temp_data["+"+element]["status"] = "";
											});
										}
									}
								});
							}

						}
						// 在线状态
						if(!that.product_id){
							uni.request({
								url: that.direction_old + "/devices/status",
								// url: "http://183.230.40.34/devices/status",
								header: { "api-key": that.api_key},
								data: {'devIds':that.device_ids},
								method:'GET',//请求方式  或GET，必须为大写
								success: res => {
									// console.log('返回status', res.data["data"]);
									for (var idx=0; idx < res.data["data"]["devices"].length; idx++){
										var device_data = res.data["data"]["devices"][idx];
										if (device_data["online"] == false){
											temp_data["+"+device_data["id"]]["status"] = ""; //离线
										}
									}
								}
							});
						}
						
						// 数据内容
						if(that.product_id){
							uni.request({
								url: that.direction + "/datapoint/current-datapoints?product_id=" + that.product_id.split("&")[0] + "&device_name=" + (that.device_ids+',').replace(/\&(.*?)\,/g, '\,').slice(0,-1),
								header: { "authorization": that.api_key.split(";")[0]},
								method:'GET',//请求方式  或GET，必须为大写
								success: res => {
									console.log('返回', res.data["data"]);
									for (var idx=0; idx < res.data["data"]["devices"].length; idx++){
										var device_data = res.data["data"]["devices"][idx];
										var device_data_dev_name = "";
										device_id_split.forEach(function (element, index, array) {
											if(element.indexOf(device_data["title"]) !== -1 ){
												device_data_dev_name = element;
											}
										});
										// 修改顺序 data0 data2 ..
										device_data["datastreams"].sort((a, b)=>{
											return (a["id"] > b["id"])? 1:-1;
										});
										// 删除隐藏pin
										for(var n = device_data["datastreams"].length-1 ; n>=0 ; n--){
											if(!that.check_seen_status(device_data_dev_name, device_data["datastreams"][n]["id"])) device_data["datastreams"].splice(n,1);
										};
										// 更新pin码、 坐标转换
										var device_kv_in_idx = {};
										for (var in_idx = 0; in_idx < device_data["datastreams"].length;in_idx++){
											if(device_data["datastreams"][in_idx]["id"] == "pwd"){
												var tmp_pwd = device_data["datastreams"][in_idx]["value"].toString();
												// console.log("recv pwd", tmp_pwd)
												if(tmp_pwd != "" && tmp_pwd != "0" && that.res_pincode != "None"){
													if(that.res_pincode == ""){
														that.res_pincode = tmp_pwd;
													}
													else if(that.res_pincode != tmp_pwd){
														that.res_pincode = "None";
													}
													// 相等时不需要再赋值

													if(that.pincode != tmp_pwd || that.res_pincode == "None"){
														device_data["datastreams"] = []
														return;
													}
												}
											}
											if(device_data["datastreams"][in_idx]["id"] == "location"){
												var translate_coor = that.translate_gps(device_data["datastreams"][in_idx]["value"]["lat"], device_data["datastreams"][in_idx]["value"]["lon"]);
												device_data["datastreams"][in_idx]["value"]["lat"] = translate_coor.latitude;
												device_data["datastreams"][in_idx]["value"]["lon"] = translate_coor.longitude;

												device_data["datastreams"][in_idx]["value"]["st"] = ['']; //默认
												device_data["datastreams"][in_idx]["value"]["m_conf"] = ['']; //默认
												for (var in_in_idx = 0; in_in_idx < device_data["datastreams"].length;in_in_idx++){
													// 添加wifi名
													if(device_data["datastreams"][in_in_idx]["id"] == "ssid"){
														if(device_data["datastreams"][in_in_idx]["at"] == device_data["datastreams"][in_idx]["at"]){
															device_data["datastreams"][in_idx]["value"]["ssid"] = device_data["datastreams"][in_in_idx]["value"];
														}
													}
													// 添加电量数据
													if(device_data["datastreams"][in_in_idx]["id"] == "b"){
														device_data["datastreams"][in_idx]["value"]["battery"] = device_data["datastreams"][in_in_idx]["value"];
													}

													// // 扫描并添加自身st_time/围栏等信息 -- 后置-单独走kv
												}
												// 额外获取离线数据 k-v
												device_kv_in_idx[device_data_dev_name] = in_idx; // 存储对应的索引 - 否则等到res后会变化
												uni.request({
													url: that.direction + "/thingmodel/query-device-property?product_id="+that.product_id.split("&")[1]+"&device_name="+device_data_dev_name.split("&")[1],
													header: { "authorization": that.api_key.split(";")[1]},
													method:'GET',
													success: (res_kv) => {
														for(var dp_idx in res_kv.data["data"]){
															var value_name = res_kv.data["data"][dp_idx]["name"];
															// k-v: 睡眠、围栏等离线信息
															if(["st","m_conf"].indexOf(value_name) != -1){
																device_data["datastreams"][device_kv_in_idx[device_data_dev_name]]["value"][value_name] = (res_kv.data["data"][dp_idx]["value"] || '').split(',');
																that.$forceUpdate(); // 异步后拉到数据后刷新
															}
															if(["erail", "erail_flag"].indexOf(value_name) != -1){
																device_data["datastreams"][device_kv_in_idx[device_data_dev_name]]["value"][value_name] = res_kv.data["data"][dp_idx]["value"] || '';
																that.$forceUpdate(); // 异步后拉到数据后刷新
															}
														}
													}
												});
											}
										}
										temp_data["+"+device_data_dev_name]["datastreams"] = device_data["datastreams"];
									}
								}
							});
						}
						else{
							uni.request({
								url: that.direction_old + "/devices/datapoints",
								header: { "api-key": that.api_key},
								data: {'devIds':that.device_ids},
								method:'GET',//请求方式  或GET，必须为大写
								success: res => {
									console.log('返回', res.data["data"]);
									for (var idx=0; idx < res.data["data"]["devices"].length; idx++){
										var device_data = res.data["data"]["devices"][idx];
										// 修改顺序 data0 data2 ..
										device_data["datastreams"].sort((a, b)=>{
											return (a["id"] > b["id"])? 1:-1;
										});
										// 删除隐藏pin
										for(var n = device_data["datastreams"].length-1 ; n>=0 ; n--){
											if(!that.check_seen_status(device_data["id"], device_data["datastreams"][n]["id"])) device_data["datastreams"].splice(n,1);
										};
										// 更新pin码、坐标转换
										for (var in_idx = 0; in_idx < device_data["datastreams"].length;in_idx++){
											if(device_data["datastreams"][in_idx]["id"] == "pwd"){
												var tmp_pwd = device_data["datastreams"][in_idx]["value"].toString();
												// console.log("recv pwd", tmp_pwd)
												if(tmp_pwd != "" && tmp_pwd != "0" && that.res_pincode != "None"){
													if(that.res_pincode == ""){
														that.res_pincode = tmp_pwd;
													}
													else if(that.res_pincode != tmp_pwd){
														that.res_pincode = "None";
													}
													// 相等时不需要再赋值

													if(that.pincode != tmp_pwd || that.res_pincode == "None"){
														device_data["datastreams"] = []
														return;
													}
												}
											}
											if(device_data["datastreams"][in_idx]["id"] == "location"){
												var translate_coor = that.translate_gps(device_data["datastreams"][in_idx]["value"]["lat"], device_data["datastreams"][in_idx]["value"]["lon"]);
												device_data["datastreams"][in_idx]["value"]["lat"] = translate_coor.latitude;
												device_data["datastreams"][in_idx]["value"]["lon"] = translate_coor.longitude;

												device_data["datastreams"][in_idx]["value"]["st"] = ['']; //默认
												device_data["datastreams"][in_idx]["value"]["m_conf"] = ['']; //默认
												for (var in_in_idx = 0; in_in_idx < device_data["datastreams"].length;in_in_idx++){
													// 添加wifi名
													if(device_data["datastreams"][in_in_idx]["id"] == "ssid"){
														if(device_data["datastreams"][in_in_idx]["at"] == device_data["datastreams"][in_idx]["at"]){
															device_data["datastreams"][in_idx]["value"]["ssid"] = device_data["datastreams"][in_in_idx]["value"];
														}
													}

													// 添加电量信息
													if(device_data["datastreams"][in_in_idx]["id"] == "b"){
														device_data["datastreams"][in_idx]["value"]["battery"] = device_data["datastreams"][in_in_idx]["value"];
													}

													// 添加围栏信息
													if(device_data["datastreams"][in_in_idx]["id"] == "erail"){
														device_data["datastreams"][in_idx]["value"]["erail"] = device_data["datastreams"][in_in_idx]["value"];
													}
													if(device_data["datastreams"][in_in_idx]["id"] == "erail_flag"){
														device_data["datastreams"][in_idx]["value"]["erail_flag"] = device_data["datastreams"][in_in_idx]["value"];
													}

													// 添加st_time
													if(device_data["datastreams"][in_in_idx]["id"] == "st"){
														device_data["datastreams"][in_idx]["value"]["st"] = device_data["datastreams"][in_in_idx]["value"].split(',');
														// that.input_st_time[idx] = device_data["datastreams"][in_in_idx]["value"].split(',');
													}
													// 添加m_conf
													if(device_data["datastreams"][in_in_idx]["id"] == "m_conf"){
														device_data["datastreams"][in_idx]["value"]["m_conf"] = device_data["datastreams"][in_in_idx]["value"].split(',');
														// that.input_st_time[idx] = device_data["datastreams"][in_in_idx]["value"].split(',');
													}
												}
											}
										}
										temp_data["+"+device_data["id"]]["datastreams"] = device_data["datastreams"];
									}
								}
							});
						}

					}
					that.temp_data = temp_data;

				}catch(e){
					console.log("check main error", e);
				}
			},

			// 通过onenet下发mqtt指令到硬件 - synccmd
			send_check(device_id, key_name, action, period=null) {
				var that = this;
				uni.showModal({
				title: '提示',
				content: '是否确认操作',
					success: function (res) {
				if (res.confirm) {
				// if (res.cancel) {
					that.send(device_id, key_name, action, period);

					that.delay_fresh();
				}
				}
				});
			},
			send(device_id, key_name, action, period=null) {
				var that = this;
				uni.request({
					url: that.product_id?(that.direction + "/datapoint/synccmds?timeout=5&product_id=" + that.product_id.split("&")[0] + "&device_name=" + device_id.split("&")[0]):(that.direction_old + "/cmds?device_id=" + device_id),
					header: that.product_id?{"authorization": that.api_key.split(";")[0]}:{ "api-key": that.api_key},
					data: {
						// key_name: JSON.stringify(action, that.trigger_time),
						"key_name": key_name,
						"action": action,
						"period": period || that.trigger_time,
						"pwd": that.pincode
					},
					method:'POST',//请求方式  或GET，必须为大写
					success: res => {
						uni.showToast({
							title: "成功",
							icon: "none"
						})
					}
				  });
			},
			send_usb(mode) {
				var that = this;
				var params = {
						"mode": mode
					};
				if(mode == "kb") {
					params["context"] = that.ench2Unicode(that.input_val[5]);
				}
				else if(mode == "dkb"){
					params["context"] = [that.input_val[5]];
				}
				else {
					params["speed"] = that.input_val[6];
				}
				// console.log(params["context"]);
				uni.request({
					url: that.product_id?(that.direction + "/datapoint/synccmds?timeout=5&product_id=" + that.product_id.split("&")[0] + "&device_name=" + that.hid_usb):(that.direction_old + "/cmds?device_id=" + that.hid_usb),
					header: that.product_id?{"authorization": that.api_key.split(";")[0]}:{ "api-key": that.api_key},
					data: params,
					method:'POST',//请求方式  或GET，必须为大写
					success: res => {
						uni.showToast({
							title: "成功",
							icon: "none"
						})
					}
				  });
			},
			translate_gps(lat, lon){
				var util = require('../../static/WSCoordinate.js');
				var res1 = util.transformFromWGSToGCJ(lat, lon); // 坐标转换
				// console.log(res1);
				return res1;
			},
			isChinese(s){
				return /[\u4e00-\u9fa5]/.test(s);
			},
			ench2Unicode(str){
				if(!str){
					return;
				}
				var unicode = '';
				for (var i = 0; i <  str.length; i++) {
					var temp = str.charAt(i);
					if(this.isChinese(temp)){
						unicode += '\\u' +  temp.charCodeAt(0).toString(16);
					}
					else{
						unicode += '\\u' + temp;
					}
				}
				return unicode;
			},
			calc_hash(input_data){
				var tmp = JSON.stringify(input_data);
				var hash = 0, i, chr;
				if (tmp.length === 0) return hash;
				for (i = 0; i < tmp.length; i++) {
					chr = tmp.charCodeAt(i);
					hash = ((hash << 5) - hash) + chr;
					hash |= 0; // Convert to 32bit integer
				}
				return hash;
			},
			load_config_show(device_id, key_name, ori_name){
				var res = "";
				try { res = res || this.config_json[device_id]["show"][key_name][ori_name]} catch(e) {}
				try { res = res || this.config_json["*"]["show"][key_name][ori_name] } catch(e) {}
				return res || ori_name;
			},
			check_seen_status(device_id, key_name, action = ""){
				// try {
					if (action=="") { if (((this.config_json[device_id] || {})["hidep"] || []).indexOf(key_name) != -1) return false; }
					else if (((this.config_json[device_id] || {})["hidef"] || []).indexOf(action) != -1 || ((((this.config_json[device_id] || {})["hidefp"] || {})[key_name] || []).indexOf(action) != -1)) return false;

					if (action=="") { if (((this.config_json["*"] || {})["hidep"] || []).indexOf(key_name) != -1) return false; }
					else if (((this.config_json["*"] || {})["hidef"] || []).indexOf(action) != -1 || ((((this.config_json["*"] || {})["hidefp"] || {})[key_name] || []).indexOf(action) != -1)) return false;
				// } catch(e) {
				// 	console.log("info!!", device_id, key_name, action)
				// }
				return true;
			},
			check_in_show(device_id, key_name){
				var res = null;
				if ((((this.config_json[device_id] || {})["inp"] || {})[key_name]) != null) {
					res = (((this.config_json[device_id] || {})["inp"] || {})[key_name]);
				}
				if((((this.config_json["*"] || {})["inp"] || {})[key_name]) != null) {
					res = (((this.config_json["*"] || {})["inp"] || {})[key_name]);
				}
				return res;
			},
			check_update_pin(res_pin, old_pin, new_pin, device_ids){
				if(res_pin != "" && res_pin != old_pin){
					uni.showToast({
						title: "更新前pin不一致",
						icon: "none"
					})
					return false;
				}
				// 修改onenet属性 - 类似设置st_time
				if(old_pin != new_pin){
					for (var device_idx in device_ids.split(",")){
						console.log("change:", device_ids.split(",")[device_idx], "pwd", new_pin)
						this.set_onenet_http(device_ids.split(",")[device_idx], "pwd", new_pin);
					};
				}
				return false; // TODO
				// return true;
			},
			// 加载缓存
			load_storage(){
				var that = this;
				that.device_ids = uni.getStorageSync("device_ids");
				that.api_key = uni.getStorageSync("api_key");
				that.comments = uni.getStorageSync("comments");
				that.trigger_time = uni.getStorageSync("trigger_time");
				that.hid_usb = uni.getStorageSync("hid_usb");
				that.hid_usb_context = uni.getStorageSync("hid_usb_context");
				that.input_val[5] = that.hid_usb_context; // 特殊 - 跨页面显示 且仅本地缓存
				that.device_type = uni.getStorageSync("device_type");
				that.product_id = uni.getStorageSync("product_id");
				that.config_json = uni.getStorageSync("config_json");
				that.config_json = that.config_json?JSON.parse(that.config_json):{};
				that.emails = uni.getStorageSync("emails");
				that.pincode = uni.getStorageSync("pincode");
				that.mapmode = uni.getStorageSync("mapmode");
			},
			//修改信息
			change() {
				var alert_ok = true;
				var that = this;
				// if(that.input_val[0]){uni.setStorageSync("device_ids", that.input_val[0]);}
				if(that.input_val[0]){uni.setStorageSync("device_ids", that.input_val[0]);}
				if(that.input_val[1]){uni.setStorageSync("comments", that.input_val[1]);}
				if(that.input_val[2]){uni.setStorageSync("api_key", that.input_val[2]);}
				if(that.input_val[3]){uni.setStorageSync("trigger_time", that.input_val[3]);}
				if(that.input_val[4]){uni.setStorageSync("hid_usb", that.input_val[4]);}
				if(that.input_val[5]){uni.setStorageSync("hid_usb_context", that.input_val[5]);}
				if(that.input_val[7]){uni.setStorageSync("device_type", that.input_val[7]);}
				uni.setStorageSync("product_id", that.input_val[8]);
				if(that.input_val[9]){
					uni.setStorageSync("config_json", that.input_val[9]);
					that.config_json = JSON.parse(that.input_val[9]);
				}
				if(that.input_val[10]){uni.setStorageSync("emails", that.input_val[10]);}
				if(that.input_val[11]){
					if(!that.check_update_pin(that.res_pincode, that.pincode, that.input_val[11], that.device_ids)){
						uni.showToast({
							title: "设置完成，请回主页刷新",
							icon: "none"
						})
						alert_ok = false;
					};
				}
				uni.setStorageSync("pincode", that.input_val[11] || "");
				
				uni.setStorageSync("mapmode", that.input_val[12]);
				// console.log("set done and get:", uni.getStorageSync("comments"));
				// this.check_main();
				if(alert_ok){
					uni.showToast({
						title: "成功",
						icon: "none"
					})
				}
			},
			// 加载缓存显示
			init_info() {
				var that = this;
				that.load_storage();
				that.input_val[0] = that.device_ids;
				that.input_val[1] = that.comments;
				that.input_val[2] = that.api_key;
				that.input_val[3] = that.trigger_time;
				that.input_val[4] = that.hid_usb;
				that.input_val[5] = that.hid_usb_context;
				that.input_val[7] = that.device_type;
				that.input_val[8] = that.product_id;
				that.input_val[9] = JSON.stringify(that.config_json);
				that.input_val[10] = that.emails;
				that.input_val[11] = that.pincode;
				that.input_val[12] = that.mapmode;
				that.$forceUpdate();
			},
			// 修改状态
			change_stat(list_target, idx){
				list_target[idx] = (list_target[idx]+1) % 2;
			},
			// 复制id
			copy(value){
				uni.setClipboardData({
					data: value,
					success: function () {
					//调用方法成功
					// console.log('success');
				}
				})
			},
			// 密码显示
			showPwd: function() {
				this.showPassword = !this.showPassword;
			},
			// 跳转三方app地图
			open_location(latitude, longitude){
				if(!latitude){
					latitude = this.polyline[0].points[this.polyline[0].points.length-1].latitude;
					longitude = this.polyline[0].points[this.polyline[0].points.length-1].longitude;
				}
				uni.openLocation({
					latitude: latitude,
					longitude: longitude,
					scale: 15
				});
			},
			// 修改时间
			changeTime(e, mode){
				if(mode=="start"){
					this.timeStart = e;
				}
				else{
					this.timeEnd = e;
				}
			},
			// 独立子页面 -1
			// 定位轨迹回看
			create_path(device_id = ''){
				var that = this;
				that.seen_id = -1;
				console.log("地图轨迹绘制");
				if(device_id){that.polykey = device_id;}
				console.log("that.polykey:", that.polykey);
				that.polyline[0].points = [];
				that.polyline[0].markers = [];
				uni.request({
					url: that.product_id?(that.direction + "/datapoint/history-datapoints?product_id="+that.product_id.split("&")[0]+"&device_name="+that.polykey+"&datastream_id=location&limit=6000&start="+that.timeStart.replace(" ", "T")+"&end="+that.timeEnd.replace(" ", "T")):(that.direction_old + "/devices/" + that.polykey + "/datapoints"),
					header: that.product_id?{"authorization": that.api_key.split(";")[0]}:{ "api-key": that.api_key},
					data: that.product_id?{}:{
						'datastream_id': 'location',
						'start': that.timeStart.replace(" ", "T"),
						'end': that.timeEnd.replace(" ", "T"),
						'limit': 6000
					},
					method:'GET',//请求方式  或GET，必须为大写
					success: res => {
						console.log('返回', res.data["data"]);
						if(that.product_id){
							for (var in_idx = 0; in_idx < parseInt(res.data["data"]["datastreams"][0]["datapoints"].length / 2);in_idx++){
								var tmp_change = res.data["data"]["datastreams"][0]["datapoints"][in_idx];
								res.data["data"]["datastreams"][0]["datapoints"][in_idx] = res.data["data"]["datastreams"][0]["datapoints"][res.data["data"]["datastreams"][0]["datapoints"].length - 1 - in_idx];
								res.data["data"]["datastreams"][0]["datapoints"][res.data["data"]["datastreams"][0]["datapoints"].length - 1 - in_idx] = tmp_change;
							}
						}
						// 坐标转换
						for (var in_idx = 0; in_idx < res.data["data"]["datastreams"][0]["datapoints"].length;in_idx++){
							var translate_coor = that.translate_gps(
								res.data["data"]["datastreams"][0]["datapoints"][in_idx]["value"]["lat"],
								res.data["data"]["datastreams"][0]["datapoints"][in_idx]["value"]["lon"]
							);
							res.data["data"]["datastreams"][0]["datapoints"][in_idx]["value"]["lat"] = translate_coor.latitude;
							res.data["data"]["datastreams"][0]["datapoints"][in_idx]["value"]["lon"] = translate_coor.longitude;
							// append
							that.polyline[0].points.push({
								latitude: res.data["data"]["datastreams"][0]["datapoints"][in_idx]["value"]["lat"],
								longitude: res.data["data"]["datastreams"][0]["datapoints"][in_idx]["value"]["lon"]});
						}
						// console.log(that.polyline[0].points[that.polyline[0].points.length-1].latitude);
						that.polyline[0].markers.push(
							{
								id: 0,
								latitude:res.data["data"]["datastreams"][0]["datapoints"][0]["value"]["lat"],
								longitude:res.data["data"]["datastreams"][0]["datapoints"][0]["value"]["lon"],
								width:20, height:20,
								//#ifdef H5
								iconPath: '/static/images/location.png',
								//#endif
								callout: { //气泡窗口
									content: res.data["data"]["datastreams"][0]["datapoints"][0]["at"].split('.')[0], //文本
									color: '#ffffff',
									fontSize: 15,
									borderRadius: 15,
									padding: '10',
									bgColor: '#406390',
									display: 'ALWAYS', //常显
								  }
							},
							{
								id: 1,
								latitude:res.data["data"]["datastreams"][0]["datapoints"][res.data["data"]["datastreams"][0]["datapoints"].length - 1]["value"]["lat"],
								longitude:res.data["data"]["datastreams"][0]["datapoints"][res.data["data"]["datastreams"][0]["datapoints"].length - 1]["value"]["lon"],
								width:20, height:20,
								//#ifdef H5
								iconPath: '/static/images/location.png',
								//#endif
								callout: { //气泡窗口
									content: res.data["data"]["datastreams"][0]["datapoints"][res.data["data"]["datastreams"][0]["datapoints"].length - 1]["at"].split('.')[0], //文本
									color: '#ffffff',
									fontSize: 15,
									borderRadius: 15,
									padding: '10',
									bgColor: '#406390',
									display: 'ALWAYS', //常显
								  }
							},
						);
					}
				});
			},
			// 独立子页面 -2
			// 管理定时信息
			jump_manage_timer(){
				var that = this;
				that.seen_id = -2;
				that.check_main(0);
				that.check_timer_version();
				console.log("管理定时信息");
				setTimeout(function() {
					that.manage_timer_v["pick_data"] = [];
					for (var device_id_plus in that.temp_data){
						var device_id = device_id_plus.substr(1,);
						var child_list = [];
						for (var pin_data_idx = 0; pin_data_idx < that.temp_data[device_id_plus]['datastreams'].length; pin_data_idx++) {
							var pin_data_item = that.temp_data[device_id_plus]['datastreams'][pin_data_idx];
							if (pin_data_item['id'].slice(0,4)=='data') {
								var action_child = [];
								for( var action_name in that.manage_timer_v['pick_action']){
									// 1. 隐藏否 2. 改名否
									if (that.check_seen_status(device_id, pin_data_item['id'], action_name)){
										action_child.push({
											value: action_name,
											text: that.load_config_show(device_id, pin_data_item['id'], that.manage_timer_v['pick_action'][action_name])
										})
									}
								}
								child_list.push({
									value: pin_data_item['id'],
									text: pin_data_item['id'],
									children: action_child,
								})
							}
						};
						if (child_list.length > 0){
							that.manage_timer_v['pick_data'].push({
								value: device_id,
								text: that.temp_data[device_id_plus]['comments'],
								children: child_list
							})
						}
					}
				that.$forceUpdate();}, 500);
			},
			select_timer_item(e) {
				this.manage_timer_v['picked'][2] = e.detail.value[0].value; // device_id
				this.manage_timer_v['picked'][3] = e.detail.value[1].value; // pin
				this.manage_timer_v['picked'][4] = e.detail.value[2].value; // action
			},
			select_timer_time(e) {
				this.manage_timer_v['picked'][0] = e.detail.value; // time
				this.$forceUpdate();
			},
			trigger_timer_duplicate(e){// duplicate
				var select_list = [];
				for(var idx=0; idx<e.length;idx++){
					if(e[idx]['is_selected']){
						select_list.push(e[idx]['value']);
					}
				}
				this.select_timer_duplicate(select_list);
			},
			select_timer_duplicate(e) { // duplicate
				var that = this;
				that.manage_timer_v['picked'][1] = ""; // duplicate
				for (var idx=0; idx<e.length;idx++){
					if (e[idx] == "all" || e[idx] == "once"){
						that.manage_timer_v['picked'][1] = e[idx];
						if(e.length > 1){
							uni.showToast({
								title: "仅一次/每天下不能多选!",
								icon: "none"
							});
						}
						break
					}

					else {
						if (that.manage_timer_v['picked'][1] != ""){
							that.manage_timer_v['picked'][1] += "/";
						}
						that.manage_timer_v['picked'][1] += e[idx];
					}
				}
			},
			create_timer_config(e){
				var that = this;
				if (that.config_json["timer"] == null){
					that.config_json["timer"] = {};
				}
				if (that.config_json["timer"][that.manage_timer_v['picked'][2]] == null){
					that.config_json["timer"][that.manage_timer_v['picked'][2]] = {"rules":[]};
				}
				var has_same_config = false;
				var pack_config = [that.manage_timer_v['picked'][3], that.manage_timer_v['picked'][0], that.manage_timer_v['picked'][1], that.manage_timer_v['picked'][4], that.trigger_time || 1];
				for (var idx=0;idx<pack_config.length;idx++){
					if(pack_config[idx]==null){
						uni.showToast({
							title: "信息不能为空",
							icon: "none"
						});
						return;
					}
				}
				var exists_rules = that.config_json["timer"][that.manage_timer_v['picked'][2]]["rules"];
				for (var item in exists_rules){
					if(exists_rules[item][0] == pack_config[0] && exists_rules[item][1] == pack_config[1] && exists_rules[item][2] == pack_config[2] && exists_rules[item][3] == pack_config[3] && exists_rules[item][4] == pack_config[4]){
						has_same_config = true;
						console.log("has same config, pass")
						break;
					}
				}
				if (!has_same_config){
					that.config_json["timer"][that.manage_timer_v['picked'][2]]["rules"].push(pack_config);
					// 更新缓存
					uni.setStorageSync("config_json", JSON.stringify(that.config_json));
					that.check_timer_version();
				}
			},
			del_timer_config(device_id, idx){
				var that = this;
				uni.showModal({
					title: '设备-'+that.temp_data["+"+device_id]['comments'],
					content: '是否确认删除第'+(idx+1).toString()+'条配置',
					success: function (res) {
						if (res.confirm) {
							console.log("delete config");
							that.config_json["timer"][device_id]["rules"].splice(idx, 1);
							if(that.config_json["timer"][device_id]["rules"].length == 0){
								delete that.config_json["timer"][device_id];
							}
							// 更新缓存
							uni.setStorageSync("config_json", JSON.stringify(that.config_json));
							that.check_timer_version();
						}
					}
				});
			},
			get_show_info_from_config(device_id, rule_list){
				var res = "管脚-"+rule_list[0]+"; "+rule_list[1]+"; ";
				var duplicate = "";
				if(rule_list[2] == "all"){
					duplicate = "每天";
				} else if (rule_list[2] == "once"){
					duplicate = "仅一次";
				} else {
					duplicate = "周" + rule_list[2];
				}
				res += duplicate + "; " + this.load_config_show(device_id, rule_list[0], this.manage_timer_v['pick_action'][rule_list[3]]);
				return res;
			},


			// 独立子页面 -3 电子围栏设置
			jump_manage_rail(pid = "", lat = 36.2332, lon = 120.23423, erail="", erail_flag = 0){
				console.log("pid:", pid, lat, lon);
				var that = this;
				that.seen_id = -3;
				that.rail_val[0] = lat.toFixed(5);
				that.rail_val[1] = lon.toFixed(5);
				that.rail_val[2] = pid;
				that.rail_val[3] = erail;
				that.rail_val[4] = erail_flag;
				if(erail_flag == 1){
					uni.showModal({
					    title: '围栏报警',
					    success: function (res) {
					        // if (res.confirm) { } else if (res.cancel) {
					    }
					});
				}
				console.log("电子围栏信息");
			},
			get_poly_list(merge_info = ""){
				var tmp_info = JSON.parse(merge_info || "{}")
				var res = [];
				for(var type in [0, 1]){
					if (tmp_info[type] != null){
						for(var idx_area in tmp_info[type]){
							if(tmp_info[type][idx_area].length >= 3){
								var add_new_dict = {
									points: [],
									strokeWidth: "2",
									strokeColor: (type==0)?"#2223FD":"#c85a64",
									fillColor: (type==0)?"#9FA4F66a":"#c85a646a",

								}
								for(var idx_point in tmp_info[type][idx_area]){
									add_new_dict["points"].push({
										latitude: tmp_info[type][idx_area][idx_point][0],
										longitude: tmp_info[type][idx_area][idx_point][1]
									});
								}
								res.push(add_new_dict);
							}
						}
					}
				}
				return res;
			},

            // 独立子页面 -4
            // dmsg查看
            get_dmsg_log(device_id = ''){
            	var that = this;
				that._tmp_seen_detail_device = device_id;
            	that.seen_id = -4;
            	console.log("dmsg查看");
				var check_num = 20;
            	uni.request({
            		url: that.product_id?(that.direction + "/datapoint/history-datapoints?product_id="+that.product_id.split("&")[0]+"&device_name="+device_id.split("&")[0]+"&datastream_id=msg&limit="+check_num):(that.direction_old + "/devices/" + device_id + "/datapoints"),
            		header: that.product_id?{"authorization": that.api_key.split(";")[0]}:{ "api-key": that.api_key},
            		data: that.product_id?{}:{
            			'datastream_id': 'msg',
            			'limit': check_num
            		},
            		method:'GET',//请求方式  或GET，必须为大写
            		success: res => {
            			console.log('dmsg_log 返回', res.data["data"]);
            			that.temp_data = res.data["data"]["datastreams"][0]["datapoints"];
					}
            	});
            },

			// 配置导出和导入
			export_info(){
				console.log(this.input_val);
				this.info_dump = (JSON.stringify(this.input_val));
			},
			load_info(){
				this.input_val = (JSON.parse(this.info_dump));
				this.change(); //保存修改
			},
			// 设定离线变量
			set_onenet_http(device_id, key_name, value){
				var value = value.replace(/\s+/g, '');
				console.log("st_val", device_id, key_name, value);
				var that = this;
				var up_data = {};
				if(that.product_id){
					var datastreams = {}
					datastreams[key_name] = {"value": value}
					up_data = {
						"id": "1",
						"params":datastreams
					}
				}
				else {
					var datastreams = [];
					datastreams.push({
							"id": key_name,
							"datapoints": [{
								"value": value
							}]
						})
					up_data = {'datastreams': datastreams};
				}
				uni.request({
					url: that.product_id?("https://open.iot.10086.cn/fuse/http"+"/device/thing/property/post?topic=$sys/"+that.product_id.split("&")[1]+"/"+device_id.split("&")[1]+"/thing/property/post&protocol=http"):(that.direction_old + "/devices/" + device_id + "/datapoints"),
					header: that.product_id?{"token": that.api_key.split(";")[1]}:{ "api-key": that.api_key},
					data: up_data,
					method:'POST',
					success: res => {
						// console.log('返回status', res.data["data"]);
						uni.showToast({
							title: "成功",
							icon: "none"
						})
					}
				});
				that.send(device_id, key_name, key_name, value);
			},
			delay_fresh(delay_time=2000){
				var that = this;
				setTimeout(function() {
				  // 这里写要延时执行的代码
				  that.change_seen_id(that.seen_id);
				}, delay_time); // 这里的 1000 表示延时的时间，单位是毫秒
			},


			// 三方通信部分 - 设定定时信息
			set_timer_info(){
				var that = this;
				if(that.config_json['timer']){
					var send_info = that.config_json['timer'];
					for (var device_idx in send_info){
						send_info[device_idx]['code'] = that.calc_hash(send_info[device_idx]["rules"]);
					};
					// send
					uni.request({
						url: that.mybackend + "/set_timer_config/" ,
						header:{
							'content-type': 'application/x-www-form-urlencoded'
						},
						data: {
							'data': JSON.stringify(send_info),
							'api_key': that.api_key,
							'emails': that.emails,
						},
						method:'POST',
						success: res => {
							if (res['data']['status'] == 'ok'){
								uni.showToast({
									title: "定时信息更新成功",
									icon: "none"
								});
								// that.mybackend_res['sync'] = {};
								// for (var device_idx in send_info){
								// 	that.mybackend_res['sync'][device_idx] = "刚刚";
								// };
								that.mybackend_res['sync'] = res['data']['sync'];
								that.mybackend_res['emailmap'] = res['data']['emailmap'];
							}
							else{
								uni.showToast({
									title: "失败: " + res['data']['status'],
									icon: "none"
								});
							}
						}
					});
				}
			},
			// 从服务器拉取同步
			get_timer_info(){
				var that = this;
				var send_info = {};
				for (var device_idx in that.device_ids.split(",")){
					send_info[that.device_ids.split(",")[device_idx]] = {};
				};
				uni.showModal({
					title: '拉取同步',
					content: '拉取同步将覆盖本地配置,是否继续',
					success: function (res) {
						if (res.confirm) {
							// send
							uni.request({
								url: that.mybackend + "/get_timer_config/" ,
								header:{
									'content-type': 'application/x-www-form-urlencoded'
								},
								data: {
									'data': JSON.stringify(send_info),
									'api_key': that.api_key
								},
								method:'POST',
								success: res => {
									if(Object.keys(res['data']['data']).length > 0){
										that.config_json['timer'] = res['data']['data'];
										// 更新缓存
										uni.setStorageSync("config_json", JSON.stringify(that.config_json));
										// that.mybackend_res['sync'] = {};
										// for (var device_idx in send_info){
										// 	that.mybackend_res['sync'][device_idx] = res['data']['sync'][device_idx] || "";
										// };
										that.mybackend_res['sync'] = res['data']['sync'];
										that.mybackend_res['emailmap'] = res['data']['emailmap'];
										uni.showToast({
											title: "拉取同步完成",
											icon: "none"
										});
										setTimeout(function() { that.$forceUpdate();}, 500);
									}
								}
							});
						}
					}
				});
			},

			// 校验同步信息
			check_timer_version(){
				var that = this;
				if(that.config_json['timer']){
					var send_info = that.config_json['timer'];
					var check_send_info = {}
					for (var device_idx in send_info){
						check_send_info[device_idx]={};
						check_send_info[device_idx]['code'] = that.calc_hash(send_info[device_idx]["rules"]);
					};
					// send
					uni.request({
						url: that.mybackend + "/check_timer_config/" ,
						header:{
							'content-type': 'application/x-www-form-urlencoded'
						},
						data: {
							'data': JSON.stringify(check_send_info),
							'api_key': that.api_key
						},
						method:'POST',
						success: res => {
							that.mybackend_res['sync'] = res['data']['sync'];
							that.mybackend_res['emailmap'] = res['data']['emailmap'];
							// setTimeout(function() { that.$forceUpdate();}, 500);
						}
					});
				}
			},

			volte_get(device_id, starttime = '', endtime = ''){
				var that = this;
				console.log("volte_get", device_id, starttime, endtime);
				return new Promise((resolve, reject)=>{
					uni.request({
						url: that.direction_old + "/devices/" + device_id + "/datapoints",
						header:{ "api-key": that.api_key},
						data: {
							'datastream_id': 'dat',
							'start': starttime,
							'end': endtime,
							// 'limit': 24
						},
						method:'GET',//请求方式  或GET，必须为大写
						success: (res) => {
							var resultStr = [];
							for(var idx=0; idx<res.data["data"]["datastreams"][0]["datapoints"].length;idx++){
								var rawStr = res.data["data"]["datastreams"][0]["datapoints"][idx]["value"];
								for (var i = 0; i < rawStr.length; i = i + 2) {
									var curCharCode = parseInt(rawStr.substr(i, 2), 16);
									resultStr.push(curCharCode);
								}
							}
							that.volte_data = new ArrayBuffer(resultStr.length);
							for (var i = 0; i < resultStr.length; i++) {
								that.volte_data[i] = resultStr[i];
							}
							resolve('suc')
						}
					});
				})
			},
			async doGetVolte(device_id, wxAudio, starttime = '', endtime = '') {
				var that = this;
				const target = `${wx.env.USER_DATA_PATH}/tmp.wav`
				
				await this.volte_get(device_id, starttime, endtime);
				
				let fileManager = uni.getFileSystemManager()
				
				let view = this.encodeWAV(that.volte_data, 1, 16000);
				// console.log("finish::", view);
				return new Promise((resolve, reject)=>{
					fileManager.writeFile({
						data: view.buffer,
						filePath: target,
						encoding: 'binary', // add
						success: res => {
							// 拿封装好的文件进行操作
							wxAudio.src = target;
							resolve('suc')
						},
						fail: (res)=>{
							console.log("fail: ", res);
						}
					})
				})
			},
			async get_play_volte(device_id, stat_info=''){
				var that = this;
				that.innerAudioContext.autoplay = true;
				that.innerAudioContext.onCanplay((res) => {
					that.innerAudioContext.play()
				});
				await this.doGetVolte(device_id, that.innerAudioContext,stat_info.split(',')[1], stat_info.split(',')[2]);
				that.innerAudioContext.play();
				
				// console.log(that.innerAudioContext.src)
				
			},
			
			// 一些工具函数，将数据进行转码、封装
			encodeWAV(samples, numChannels, sampleRate) {
				var buffer = new ArrayBuffer(44 + samples.byteLength);
				var view = new DataView(buffer);
				/* RIFF identifier */
				this.writeString(view, 0, 'RIFF');
				/* RIFF chunk length */
				view.setUint32(4, 36 + samples.byteLength, true);
				/* RIFF type */
				this.writeString(view, 8, 'WAVE');
				/* format chunk identifier */
				this.writeString(view, 12, 'fmt ');
				/* format chunk length */
				view.setUint32(16, 16, true);
				/* sample format (raw) */
				view.setUint16(20, 1, true);
				/* channel count */
				view.setUint16(22, numChannels, true);
				/* sample rate */
				view.setUint32(24, sampleRate, true);
				/* byte rate (sample rate * block align) */
				view.setUint32(28, sampleRate * numChannels * 2, true); // 16位采样
				/* block align (channel count * bytes per sample) */
				view.setUint16(32, numChannels * 2, true); // 16位采样
				/* bits per sample */
				view.setUint16(34, 16, true); // 16位采样
				/* data chunk identifier */
				this.writeString(view, 36, 'data');
				/* data chunk length */
				view.setUint32(40, samples.byteLength, true);
				
				this.copyBytes(view, 44, samples);
			
				return view;
			},
			copyBytes(output, offset, input) {
				// const dataView = new DataView(input);
				for (var i = 0; i < input.byteLength; i++, offset++) {
					output.setInt8(offset, input[i]);
				}
				// const dataView = new DataView(input);
				// for (var i = 0; i < input.byteLength; i++, offset++) {
				// 	output.setInt8(offset, dataView.getInt8(i));
				// }
			},
			writeString(view, offset, string) {
				for (var i = 0; i < string.length; i++) {
					view.setUint8(offset + i, string.charCodeAt(i));
				}
			},
			showToast(info){
				uni.showToast({title: info,icon: 'none'});
			},
			calc_percent_by_voltage(x){
				x /= 1000;
				// const arr = [3.318203744375, 3.39022274, 3.448861355625, 3.49542656, 3.532748046875, 3.56435406, 3.593802918125, 3.6241702399999998, 3.657691869375, 3.6955625, 3.7378900006249998, 3.78380544, 3.831728811875, 3.8797904599999993, 3.926408203124999, 3.9710201599999975, 4.014973274374999, 4.062567539999998, 4.122255925624995, 4.16];
				const arr = [3.318203744375, 3.3336653179430398, 3.34860902780516, 3.36302137450496, 3.37689388314444, 3.39022274, 3.40300843910324, 3.41525543878656, 3.42697182819356, 3.43816900375424, 3.448861355625, 3.45906596409344, 3.46880230594796, 3.47809197081216, 3.48695838744404, 3.49542656, 3.50352281426364, 3.51127455383936, 3.51871002631076, 3.52585809936384, 3.532748046875, 3.5394093449638397, 3.54587147801076, 3.55216375463936, 3.5583151336636396, 3.56435406, 3.57030831054404, 3.57620485001216, 3.58206969674796, 3.58792779849344, 3.593802918125, 3.59971752935424, 3.60569272239356, 3.6117481195865597, 3.61790180100324, 3.6241702399999998, 3.63056824874444, 3.63710893370496, 3.6438036611051596, 3.6506620323430403, 3.657691869375, 3.6648992100646396, 3.6722883134963595, 3.67986167525376, 3.6876200526628393, 3.6955625, 3.7036864136648395, 3.71198758731776, 3.7204602769823603, 3.7290972761126397, 3.7378900006249998, 3.7468285838950397, 3.75590198171916, 3.7650980872409594, 3.7744038558424395, 3.78380544, 3.7932883341052386, 3.8028375292505596, 3.8124376779795592, 3.822073269002239, 3.831728811875, 3.841389031645439, 3.8510390734619597, 3.860664717148161, 3.8702526017420396, 3.87979046, 3.8892673628656396, 3.8986739739033602, 3.9080028136967586, 3.9172485342118395, 3.926408203124999, 3.935481598115837, 3.9444715111247604, 3.9533840625753616, 3.9622290255616397, 3.9710201599999975, 3.9797755567460413, 3.9885179916761597, 3.99727528973396, 4.00608069894144, 4.014973274374998, 4.023998272106239, 4.033207553107561, 4.042659997122566, 4.052421926501236, 4.062567539999998, 4.073179356546437, 4.084348668968957, 4.09617600769116, 4.108771614391037, 4.122255925625002, 4.136760066416641, 4.15242635381036, 4.169408810389753, 4.187873687760843,   4.16];
				let left = 0;  
				let right = arr.length - 1;  

				while (left <= right) {  
				const mid = Math.floor((left + right) / 2);  

				if (arr[mid] < x) {  
					left = mid + 1; // 搜索右半部分  
				} else {  
					right = mid - 1; // 搜索左半部分  
				}  
				}

				// // 处理边界情况  
				// if (left === 0 && (arr.length === 0 || arr[0] >= x)) {  
				// // 如果数组为空或x小于数组的第一个元素，返回数组长度表示插入位置  
				// 	left = arr.length;  
				// }
				
				return parseInt((100/(arr.length)) * left);
			},
	}

}
