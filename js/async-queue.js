export default class AsyncQueue{
	constructor(max_concurrent_promises = 1){
		this.max_concurrent_promises = max_concurrent_promises;
		this.concurrent_promises = 0;
		this.queue = [];
	}
	async enqueue(f,...args){
		return new Promise(function(res,rej){
			this.queue.push({f,res,rej,args});
			this.dequeue(); //attempt to execute function immediately
		}.bind(this));
	}
	async dequeue(){
		if(this.queue.length === 0) return;
		if(this.concurrent_promises >= this.max_concurrent_promises) return;
		this.concurrent_promises++;
		let {f,res,rej,args} = this.queue.shift();
		try{
			let e = await f(...args);
			res(e);
		}catch(e){
			rej(e);
		}finally{
			this.concurrent_promises--;
			return this.dequeue();
		}
	}
	async clear(){
		this.queue.length = 0;
		this.concurrent_promises = 0;
	}
}