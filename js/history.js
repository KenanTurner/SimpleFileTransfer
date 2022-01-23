import {upload_history,PREVIEW_URL,DOWNLOAD_URL,DELETE_URL,STATUS_URL} from './common.js';
console.log("LOADED");
window.upload_history = upload_history;

const table = document.getElementById('table');
const none = document.getElementById('none');

function createNode(tag_name,options = {},class_list = [],child_nodes = []){
	let el = document.createElement(tag_name);
	for(let key in options){
		el[key] = options[key];
	}
	class_list.forEach(function(cl){
		el.classList.add(cl);
	});
	child_nodes.forEach(function(node){
		el.appendChild(node);
	});
	return el;
}

let rows = upload_history.map(function createTable(obj,i){
	let tr = table.insertRow();
	let num_cell = tr.insertCell();
	let num = createNode("td",{"innerText":i});
	num_cell.appendChild(num);
	
	let filename_cell = tr.insertCell();
	let filename = createNode("td",{"innerText":obj.name,"title":obj.name});
	filename_cell.appendChild(filename);
	
	let preview_cell = tr.insertCell();
	let preview = createNode("td");
	let preview_link = createNode("a",{"innerText":"Preview","href":PREVIEW_URL+obj.id,"target":"_blank"});
	preview.appendChild(preview_link);
	preview_cell.appendChild(preview);
	
	let download_cell = tr.insertCell();
	let download = createNode("td");
	let download_link = createNode("a",{"innerText":"Download","href":DOWNLOAD_URL+obj.id,"target":"_blank"});
	download.appendChild(download_link);
	download_cell.appendChild(download);
	
	let delete_cell = tr.insertCell();
	let del = createNode("td");
	let del_link = createNode("a",{"innerText":"Delete","href":DELETE_URL+obj.id,"target":"_blank"});
	del_link.addEventListener('click',function(){
		let j = upload_history.length;
		while(j--){
			if(upload_history[j].id === obj.id) upload_history.splice(j,1);
		}
		rows.forEach(function(el){el.remove();});
		rows = upload_history.map(createTable);
		if(upload_history.length === 0){
			table.classList.add('hidden');
			none.classList.remove('hidden');
		}
	});
	del.appendChild(del_link);
	delete_cell.appendChild(del);
	return tr;
});

if(upload_history.length === 0){
	none.classList.remove('hidden');
}else{
	table.classList.remove('hidden');
}