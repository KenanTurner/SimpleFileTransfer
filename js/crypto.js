function bufferToStr(buffer){
	return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
function strToBuffer(str){
	return Uint8Array.from(atob(str), function(c){return c.charCodeAt(0)});
}

export async function digestFile(file) {
    let buffer = await file.arrayBuffer();
	buffer = await crypto.subtle.digest('SHA-256', buffer);
    return bufferToStr(buffer);
}
function genKey(){
    return crypto.subtle.generateKey({name:"AES-GCM",length: 256},true,["encrypt","decrypt"]);
}
//{'salt':salt}
export async function genUserKey(obj = {}){
	let password = window.prompt("Enter your password: ");
	let enc = new TextEncoder();
	let salt = crypto.getRandomValues(new Uint8Array(16));
	if(obj.salt) salt = strToBuffer(obj.salt);
	let str_salt = bufferToStr(salt);
	let key = await window.crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits", "deriveKey"]);
	key = await window.crypto.subtle.deriveKey({"name": "PBKDF2",salt: salt,"iterations": 100000,"hash": "SHA-256"},key,{ "name": "AES-GCM", "length": 256},true,["encrypt", "decrypt"]);
	let key_str = await exportKey(key);
	return {'key':key_str,'salt':str_salt};
}
async function exportKey(key){
	let buffer = await crypto.subtle.exportKey("raw",key);
	return bufferToStr(buffer);
}
function importKey(str){
	var buffer = strToBuffer(str);
	return crypto.subtle.importKey("raw",
		buffer,
		"AES-GCM",
		true,
		["encrypt","decrypt"]
	);
}
export async function encryptFile(obj = {}){
	if(obj.constructor === File) obj = {file:obj};
    let iv = window.crypto.getRandomValues(new Uint8Array(12));
	if(obj.iv) iv = strToBuffer(obj.iv);
	let str_iv = bufferToStr(iv);
    let {'key':str_key,'salt':salt} = await genUserKey(obj);
	let key = await importKey(str_key);
	
	let buffer = await obj.file.arrayBuffer();
	buffer = await crypto.subtle.encrypt({name:"AES-GCM",iv:iv},key,buffer);
	let enc_file = new File([buffer],obj.file.name,{
		type: obj.file.type,
		lastModified: obj.file.lastModified,
	});
	return {'key':str_key,'iv':str_iv,'file':enc_file,'salt':salt};
}
//{'file':file,'key':key,'iv':iv}
export async function decryptFile(obj){
	let buffer = await obj.file.arrayBuffer();
	let key = await importKey(obj.key);
	let iv = strToBuffer(obj.iv);
	buffer = await crypto.subtle.decrypt({name:"AES-GCM",iv:iv},key,buffer);
	return new File([buffer],obj.file.name,{
		type: obj.file.type,
		lastModified: obj.file.lastModified,
	});
}