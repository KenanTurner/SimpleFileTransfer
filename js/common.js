//Global endpoints
export const UPLOAD_URL = "./php/upload.php";
export const DOWNLOAD_URL = "./php/file.php?method=download&id=";
export const METADATA_URL = "./php/file.php?method=metadata&id=";
export const PREVIEW_URL = "./php/file.php?method=preview&id=";
export const DELETE_URL = "./php/file.php?method=delete&id=";
export const STATUS_URL = "./php/file.php?method=status&id=";
/*console.assert(saveAs,"FileSaver saveAs failed to import!"); //Check if FileSaver is loaded
console.assert(JSZip,"JSZip failed to import!"); //Check if JSZip is loaded*/

async function fetchRequest(url,method='json'){
	let response = await fetch(url,{method: 'GET'});
	if(!response.ok) throw new Error("Bad response code");
	return await response[method](); //server returns file
}

//Retrieve file metadata from server
export function fetchMetaFile(id){
	return fetchRequest(DOWNLOAD_URL + id,'json');
}
//Retrieve file blob from server
export function fetchFile(id){
	return fetchRequest(DOWNLOAD_URL + id,'blob');
}

export async function uploadFile(obj){
	let form_data = new FormData();
	for(let o in obj){
		form_data.append(o, obj[o]);
	}
	let response = await fetch(UPLOAD_URL,{
		method: 'POST',
		body: form_data
	})
	if(!response.ok) throw new Error("Bad response code!");
}


//Compress a file using JSZip
export async function zipFile(file){
	let zip = new JSZip();
	zip.file(file.name,file);
	let blob = await zip.generateAsync({type:"blob",compression:"DEFLATE"});
	return new File([blob],file.name,file); //TODO append zip extension?
}
//Uncompress the file
export async function unZipFile(file){
	let zip = new JSZip();
	let contents = await zip.loadAsync(file);
	let blob = await contents.files[file.name].async('blob');
	return new File([blob],file.name,file);
}

function createHandler(name,div){
	return {
		set(target, property, value, receiver){      
			target[property] = value;
			localStorage.setItem(name,JSON.stringify(target));
			return true;
		}
	}
}

const _upload_history = JSON.parse(localStorage.getItem('uploads')) || [];
const _download_history = JSON.parse(localStorage.getItem('downloads')) || [];
export const upload_history = new Proxy(_upload_history, createHandler('uploads'));
export const download_history = new Proxy(_download_history, createHandler('downloads'));