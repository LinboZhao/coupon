<template>
	<view class="containner">
		<view class="top">
			<view class="title">{{title +' · ' + now.text}}</view>
			<view class="time">{{time | timeFormat}}更新</view>
			<view class="weather">
				<text class="temperature">{{now.temp}}°C</text>
				<image class="weatherIcon" :src="'/static/tq/'+now.icon+'.png'"></image>
			</view>
			<canvas canvas-id="canvasTemperature" id="canvasTemperature" class="canvasTemperature" @touchstart="showChart"></canvas>
		</view>

		<view class="list">
			<view v-for="(weather,index) in weathers" :key="'weather'+index">
				<view class="list_item">
					<view class="left">
						<image class="weatherIcon" :src="'/static/tq/'+weather.icon+'.png'"></image>
						<text class="weakday">{{weather.date | weakdayFormat}}</text>
					</view>
					<view class="right">
						<text class="min-temperature">{{weather.min}}°C</text>
						<text class="max-temperature">{{weather.max}}°C</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import uCharts from '@/components/u-charts/u-charts.js';
	import amapFile from '@/components/amap/amap-wx.js';
	import {
		getweatherinfo
	} from '@/api/weatherinfo.js';
	export default {
		data() {
			return {
				title: '',
				time: new Date(),
				tip: '  ',
				currentTemperature: '26',
				now: {text: '晴', temp: 0, icon: 100},
				weathers: []
			}
		},
		filters: {
			timeFormat: (time) => {
				let dateee = new Date(time).toTimeString();
				return dateee.substr(0,5)
			},
			weakdayFormat: (time) => {
				let data = new Date(time);
				let days = data.getDay();
				switch (days) {
					case 1:
						days = '星期一';
						break;
					case 2:
						days = '星期二';
						break;
					case 3:
						days = '星期三';
						break;
					case 4:
						days = '星期四';
						break;
					case 5:
						days = '星期五';
						break;
					case 6:
						days = '星期六';
						break;
					case 0:
						days = '星期日';
						break;
				}
				let today = new Date()
				if (data.getDay() == today.getDay() + 1) {
					days = "明天"
				}
				return days
			}
		},
		onLoad() {
			console.log("页面加载完成");
			this.dataPrototype();
			let that = this;
			uni.authorize({
			    scope: 'scope.userLocation',
			    success() {
			        uni.getLocation({
			        	type: 'wgs84',
			        	success(data) {
			        		console.log('获取位置成功');
			        		//获取地区信息
			        		let amap = new amapFile.AMapWX({
			        			key: 'b1530913bbeef8cf45ca1554c496d61b'
			        		});
			        		amap.getWeather({
			        			success: function(data) {
			        				that.title = data.city.data;
			        			},
			        			fail: function(info) {
			        				//失败回调
			        				console.log(info)
			        			}
			        		})
			        		getweatherinfo(data.longitude + ',' + data.latitude, 'now').then((res) => {
			        			that.now = res.data.now
			        			that.time = res.data.updateTime
			        		});
			        		getweatherinfo(data.longitude + ',' + data.latitude, '3d').then((res) => {
			        			that.weathers = res.data.daily.map((w) => {
			        				return {
			        					min: w.tempMin,
			        					max: w.tempMax,
			        					date: w.fxDate,
			        					icon: w.iconDay
			        				}
			        			})
			        			that.$nextTick(function() {
			        				that.showChart()
			        			})
			        		});
			        	},
			        	fail(e) {
			        		console.log('获取位置失败');
			        	}
			        })
			    }
			})
		},
		methods: {
			dataPrototype() {
				Date.prototype.Format = function(fmt) {
					var o = {
						"M+": this.getMonth() + 1, //月份 
						"d+": this.getDate(), //日 
						"H+": this.getHours(), //小时 
						"m+": this.getMinutes(), //分 
						"s+": this.getSeconds(), //秒 
						"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
						"S": this.getMilliseconds() //毫秒 
					};
					if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
					for (var k in o)
						if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" +
							o[k]).substr(("" + o[k]).length)));
					return fmt;
				}
			},
			showChart() {
				let that = this
				let chartData = {
					categories: ['星期一', '星期二', '星期三', '星期', '星期二', '星期二', '星期二'],
					series: [{
						name: 'min',
						data: this.weathers.map(w => w.min),
						color: '#FFFFFF'
					}, {
						name: 'max',
						data: this.weathers.map(w => w.max),
						color: '#FFFFFF'
					}]
				}
				let canvasTemperature = new uCharts({
					$this: that,
					canvasId: 'canvasTemperature',
					type: 'line',
					legend: {
						show: false
					},
					dataLabel: false,
					dataPointShape: false,
					categories: chartData.categories,
					series: chartData.series,
					animation: true,
					xAxis: {
						disabled: true,
						disableGrid: true
					},
					yAxis: {
						disabled: true,
						disableGrid: true
					},
					width: uni.upx2px(710),
					height: uni.upx2px(200),
					extra: {
						line: {
							type: 'curve',
							width: 4
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	$primary-color:#4c8ce2;
	$light-color:#83c0f3;
	$text-color:#FFFFFF;
	$text--dark-color:#000000;
	$bg-color:#FFFFFF;
	$bg-dark-color:#F6F9FE;

	:not(not) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.containner {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		width: 100vw;
		height: 100vh;
		overflow: hidden;

		.top {
			width: 100%;
			background: linear-gradient($primary-color, $light-color);
			padding: 20rpx;
			text-align: center;
			color: $text-color;
			position: relative;

			.title {
				font-size: 20pt;
			}

			.time {
				opacity: 0.6;
				font-size: 14pt;
			}

			.weather {
				display: flex;
				justify-content: space-around;
				align-items: center;

				.temperature {
					font-size: 40pt;
				}

				.weatherIcon {
					width: 300rpx;
					height: 300rpx;
					margin: 30rpx 0;
				}
			}

			.tip {
				font-size: 14pt;
				opacity: 0.6;
			}

			.canvasTemperature {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 200upx;
				background-color: rgba(0, 0, 0, 0);
				opacity: 0.1;
				transform: scale(2);
			}
		}

		.list {
			width: 100%;
			flex: 1;
			overflow-y: scroll;

			.list_item {
				height: 150rpx;
				width: 100%;
				color: $text--dark-color;
				background-color: $bg-color;
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx;

				.left {
					display: flex;
					align-items: center;

					.weatherIcon {
						width: 100rpx;
						height: 100rpx;
					}

					.weakday {
						padding-left: 40rpx;
						padding-right: 40rpx;
						font-size: 20pt;
					}

					.weatherInfo {
						opacity: 0.4;
					}
				}

				.right {
					.min-temperature {
						padding-right: 20rpx;
					}
				}
			}

			.list_item:nth-child(2n) {
				background-color: $bg-dark-color;
			}
		}
	}
</style>
