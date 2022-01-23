import {uploadFile,fetchFile,fetchMetaFile,zipFile,unZipFile,upload_history,download_history,PREVIEW_URL} from './common.js';
import {encryptFile,digestFile,genUserKey,decryptFile} from './crypto.js';
console.log("LOADED");

const upload = document.getElementById('upload-file');
const upload_btn = document.getElementById('upload-btn');
const upload_name = document.getElementById('upload-name');
const progress = document.getElementById('progress');
const complete = document.getElementById('complete');
const failed = document.getElementById('failed');
const compress = document.getElementById('compress');
const encrypt = document.getElementById('encrypt');
const share = document.getElementById('share');
const link = document.getElementById('link');
const MAX_FILE_SIZE = 1024*1024*128; //512mb

upload.addEventListener('change',function(e){
	upload_btn.disabled = upload.files.length === 1? false: true;
	upload_name.disabled = upload.files.length === 1? false: true;
	upload_name.value = upload.files.length === 1? upload.files[0].name: "";
});

//Upload button clicked
upload_btn.addEventListener('click',async function(e){
	if(upload.files.length !== 1) return window.alert("Select a file before uploading");
	let options = {'compress':compress.checked,'encrypt':encrypt.checked};
	let file = upload.files[0];
	
	if(file.size > MAX_FILE_SIZE) return window.alert("File is too large!");
	
	complete.classList.add('hidden');
	progress.classList.remove('hidden');
	failed.classList.add('hidden');
	upload_btn.disabled = true;
	
	try{
		//TODO enable cool features
		if(options.compress) file = await zipFile(file);
		if(options.encrypt){
			let obj = await encryptFile(file);
			options.iv = obj.iv;
			options.salt = obj.salt;
			file = obj.file;
		}
		
		options.name = upload_name.value || file.name;
		options.type = file.type;
		options.size = file.size;
		options.lastModified = file.lastModified;
		options.hash = await digestFile(file);
		options.id = encodeURIComponent(options.hash.substring(0,8));
		let metafile = new File([JSON.stringify(options,null,'\t')],options.id,{type:"application/json"});
		
		await uploadFile({'meta':metafile,'data':file});
		upload_history.push(options); //TODO prevent upload if id already exists?
		
		console.log(options);
		
		link.href = PREVIEW_URL + options.id;
		share.innerText = "Click to share!";
		complete.classList.remove('hidden');
		progress.classList.add('hidden');
		failed.classList.add('hidden');
		//window.alert("Upload complete!");
	}catch(e){
		complete.classList.add('hidden');
		progress.classList.add('hidden');
		failed.classList.remove('hidden');
		//window.alert("Upload Failed!");
		console.error(e);
	}finally{
		upload_btn.disabled = false;
	}
});

share.addEventListener('click',async function(){
	if(upload_history.length === 0) return;
	let obj = upload_history[upload_history.length -1];
	let url = window.location.origin + PREVIEW_URL.substring(1) + obj.id;
	if(!navigator.share){
		await navigator.clipboard.writeText(url);
		share.innerText = "Link copied!";
	}else{
		await navigator.share({url:url});
		share.innerText = "Link shared!";
	}
});