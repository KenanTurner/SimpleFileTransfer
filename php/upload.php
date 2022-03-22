<?php
require_once('./ftp.php');

$id = $_GET["id"];
if(empty($id)) error("id is required!");
$id = urlencode($id);

//var_dump($obj);

//var_dump($ftp->ftp_nlist("."));
if(!empty($_FILES["meta"])) $ftp->ftp_put("./".$id.".json", $_FILES["meta"]['tmp_name'], FTP_BINARY);
if(!empty($_FILES["data"])) $ftp->ftp_put("./".$id, $_FILES["data"]['tmp_name'], FTP_BINARY);
if(!empty($_FILES["folder"])) $ftp->ftp_put("./".$id.".json", $_FILES["folder"]['tmp_name'], FTP_BINARY);

$ftp->ftp_close();

?>