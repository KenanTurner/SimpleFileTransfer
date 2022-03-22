import AsyncQueue from './async-queue.js';
const MAX_CONCURRENT_REQUESTS = 4;
console.log("Loaded");

window.resize = function(iframe){
	let content = iframe.contentDocument.documentElement;
	let width_ratio = iframe.clientWidth / iframe._width;
	let height_ratio = iframe.clientHeight / iframe._height;
	let ratio = Math.min(width_ratio,height_ratio);
	let content_width = Math.round(ratio * iframe._width);
	let content_height = Math.round(ratio * iframe._height);
	
	//update iframe sizing
	iframe.style.marginBottom = (iframe.clientHeight <= content_height)? "0px": content_height - iframe.clientHeight + "px";
	iframe.style.paddingLeft = ((document.body.clientWidth - content_width)/2) + "px";
	
	//scale content to fit
	content.style.transform = "scale(" + ratio + ")";
	content.style.transformOrigin = "top left";
	content.style.overflow = "hidden";
}

window.iframes = Array.from(document.querySelectorAll("iframe"));
iframes.forEach(function(iframe){
	iframe.addEventListener('load',function(){
		let content = iframe.contentDocument.documentElement;
		iframe._width = content.scrollWidth; //keep original width
		iframe._height = content.scrollHeight; //keep original height
		iframe.style.width = "100%";
		iframe.style.height = "100%";
		iframe.style.visibility = "visible";
		resize(iframe);
	});
});

window.addEventListener('resize', function(event){
    iframes.forEach(function(frame){
		resize(frame);
	});
});

async function load(iframe){
	let p = new Promise(function(res,rej){
		iframe.addEventListener('load',res,{once:true});
		iframe.addEventListener('error',rej,{once:true});
	});
	iframe.src = iframe.dataset.src;
	return p;
}

let queue = new AsyncQueue(MAX_CONCURRENT_REQUESTS);
let parr = iframes.map(function(iframe){
	return queue.enqueue(load,iframe);
});