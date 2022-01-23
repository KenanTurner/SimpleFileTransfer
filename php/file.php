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

switch($method){
	case "status":
		break;
	case "download":
		header('Content-Type: '.$meta["type"]);
		header("Content-Transfer-Encoding: Binary"); 
		header("Content-disposition: attachment; filename=\"" . $meta["name"] . "\""); 
		header('Content-Length: ' . $meta["size"]);
		$result = $ftp->ftp_get("php://output", './'.$id, FTP_BINARY);
		break;
	case "metadata":
		header('Content-Type: application/json');
		header("Content-Transfer-Encoding: Binary");
		header("Content-disposition: attachment; filename=\"" . $id . ".json\""); 
		$result = $ftp->ftp_get("php://output", './'.$id.'.json', FTP_BINARY);
		break;
	case "preview":
		header('Content-Type: '.$meta["type"]);
		header("Content-Transfer-Encoding: Binary"); 
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