<?php
require_once('./ftp.php');

$id = $_GET["id"];
$method = $_GET["method"];
if(empty($id) or empty($method)) error("id and method are required!");
$id = urlencode($id);

if($ftp->ftp_size($id.'.json') === -1) error("File does not exist!");
if($ftp->ftp_size($id) === -1) error("File does not exist!");

ob_start();
$result = $ftp->ftp_get("php://output", './'.$id.'.json', FTP_BINARY);
$meta = json_decode(ob_get_contents(),true);
ob_end_clean();

if(!$result) error("Metadata could not be found!");

/*
//Future partial content support
$offset = 0;
$length = $meta["size"];
$partialContent = false;
if(isset($_SERVER['HTTP_RANGE'])){
    // if the HTTP_RANGE header is set we're dealing with partial content
    $partialContent = true;

    // find the requested range
    // this might be too simplistic, apparently the client can request
    // multiple ranges, which can become pretty complex, so ignore it for now
    preg_match('/bytes=(\d+)-(\d+)?/', $_SERVER['HTTP_RANGE'], $matches);

    $offset = intval($matches[1]);
    $length = intval($matches[2]) - $offset;
}*/

switch($method){
	case "status":
		break;
	case "download":
		header('Accept-Ranges: none');
		header('Content-Description: File Transfer');
		header('Expires: 0');
		header('Cache-Control: no-store, must-revalidate');
		header('Pragma: no-cache');
		header('Content-Type: '.$meta["type"]);
		header("Content-Transfer-Encoding: Binary"); 
		header("Content-disposition: attachment; filename=\"" . $meta["name"] . "\""); 
		header('Content-Length: ' . $meta["size"]);
		$result = $ftp->ftp_get("php://output", './'.$id, FTP_BINARY);
		break;
	case "metadata":
		header('Accept-Ranges: none');
		header('Content-Description: File Transfer');
		header('Expires: 0');
		header('Cache-Control: no-store, must-revalidate');
		header('Pragma: no-cache');
		header('Content-Type: application/json');
		header("Content-Transfer-Encoding: Binary");
		header("Content-disposition: attachment; filename=\"" . $id . ".json\""); 
		$result = $ftp->ftp_get("php://output", './'.$id.'.json', FTP_BINARY);
		break;
	case "preview":
		header('Accept-Ranges: none');
		header('Content-Description: File Transfer');
		header('Expires: 0');
		header('Cache-Control: no-store, must-revalidate');
		header('Pragma: no-cache');
		header('Content-Type: '.$meta["type"]);
		header('Content-Length: ' . $meta["size"]);
		$result = $ftp->ftp_get("php://output", './'.$id, FTP_BINARY);
		break;
	case "delete":
		$result = $ftp->ftp_delete($id.'.json');
		$result = $ftp->ftp_delete($id);
		break;
	default:
		error("Invalid method!");
		break;
}

if(!$result) error("File could not be found!");
if($method = "delete") echo "File deleted successfully!";

$ftp->ftp_close();


?>