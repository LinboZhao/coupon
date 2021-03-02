import {
	request
} from './request.js'
const APPKEY ="3c5b25f4e02a4d4e983dc53a84e9dc58";
export function getweatherinfo(location, type){
	return new Promise((resolve,reject)=>{
		request({
			url:'/v7/weather/' + type,
			data:{
				location : location,
				key : APPKEY
			}
		}).then((data)=>{
			resolve(data)
		}).catch((e)=>{
			reject(e)
		})
	})
	
}