<?php
require_once('./ftp.php');

$id = $_GET["id"];
$method = $_GET["method"];
if(empty($id) or empty($method)) error("id and method are required!");
$id = urlencode($id);

if($ftp->ftp_size($id.'.json') === -1) error("File does not exist!",410);
if($ftp->ftp_size($id) === -1) error("File does not exist!",410);

switch($method){
	case "delete":
		$ftp->ftp_delete($id.'.json');
		$ftp->ftp_delete($id);
		$ftp->ftp_close();
		exit("File deleted successfully!");
		break;
}

ob_start();
$result = $ftp->ftp_get("php://output", './'.$id.'.json', FTP_BINARY);
$meta = json_decode(ob_get_contents(),true);
ob_end_clean();

header('Content-Description: File Transfer');
header('Expires: 0');
header('Cache-Control: no-store, must-revalidate');
header('Pragma: no-cache');

switch($method){
	case "metadata":
		header('Content-Type: application/json');
		header('Accept-Ranges: none');
		header("Content-disposition: attachment; filename=\"" . $id . ".json\""); 
		exit(json_encode($meta,JSON_PRETTY_PRINT));
		break;
	case "download":
		header("Content-disposition: attachment; filename=\"" . $meta["name"] . "\""); 
	case "preview":
		header('Accept-Ranges: bytes');
		header('Content-Type: '.$meta["type"]);
		break;
	default:
		error("Invalid method!",418);
		break;
}

//write file to cache
$file = tmpfile();
if(!$file) error("Temporary file could not be opened!");
$result = $ftp->ftp_fget($file, './'.$id, FTP_BINARY);
fseek($file, 0); //move file pointer back to beginning

// multipart-download and download resuming support
if(isset($_SERVER['HTTP_RANGE'])){
	list($a, $range) = explode("=", $_SERVER['HTTP_RANGE'], 2);
	list($range) = explode(",", $range, 2);
	list($range, $range_end) = explode("-", $range);
	$range = intval($range);
	if(!$range_end){
		$range_end = $meta["size"] - 1;
	}else{
		$range_end = intval($range_end);
	}
	fseek($file, $range);

	$new_length = $range_end - $range + 1;
	header("HTTP/1.1 206 Partial Content");
	header("Content-Length: $new_length");
	header("Content-Range: bytes $range-$range_end/".$meta["size"]);
}else{
	$new_length = $meta["size"];
	header('Content-Length: ' . $meta["size"]);
}


$chunksize = 32768;
$sec = 0.1;

/* output the file itself */
$bytes_sent = 0;
while(!feof($file) && (!connection_aborted()) && ($bytes_sent < $new_length)){
	$buffer = fread($file, $chunksize);
	echo($buffer); //echo($buffer); // is also possible
	flush();
	usleep($sec * 1000000);
	$bytes_sent += strlen($buffer);
}

fclose($file);

$ftp->ftp_close();


?>