<?php
require_once('./ftp.php');

//check for method and id
$id = $_GET["id"];
$method = $_GET["method"];
if(empty($id) or empty($method)) error("id and method are required!");
$id = urlencode($id);

//check if both files exist
if($ftp->ftp_size($id.'.json') === -1) error("File does not exist!",410);
if($ftp->ftp_size($id) === -1) error("File does not exist!",410);

//delete files if requested
if($method == "delete"){
	$ftp->ftp_delete($id.'.json');
	$ftp->ftp_delete($id);
	$ftp->ftp_close();
	exit("File deleted successfully!");
}

//retrieve the metadata for the file download
ob_start();
$result = $ftp->ftp_get("php://output", './'.$id.'.json', FTP_BINARY);
$meta = json_decode(ob_get_contents(),true);
ob_end_clean();

//set header info
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

// multipart-download and download resuming support
if(isset($_SERVER['HTTP_RANGE'])){
	list($_, $__) = explode("=", $_SERVER['HTTP_RANGE'], 2);
	list($__) = explode(",", $__, 2);
	list($start, $end) = explode("-", $__);
	$start = intval($start);
	if(!$end){
		$end = $meta["size"] - 1;
	}else{
		$end = intval($end);
	}

	$length = $end - $start + 1;
	header("HTTP/1.1 206 Partial Content");
	header("Content-Length: $length");
	header("Content-Range: bytes $start-$end/".$meta["size"]);
}else{
	$start = 0;
	$length = $meta["size"];
	header('Content-Length: ' . $meta["size"]);
}

//write directly to output until connection is closed
$ret = $ftp->ftp_nb_get("php://output", "./".$id, FTP_BINARY, $start);
while($ret == FTP_MOREDATA && (!connection_aborted())){
   // Continue downloading...
   set_time_limit(0); // Reset time limit for big files
   $ret = $ftp->ftp_nb_continue();
   flush(); // Free up memory. Otherwise large files will trigger PHP's memory limit.
}

$ftp->ftp_close();


?>