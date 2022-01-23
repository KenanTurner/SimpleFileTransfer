<?php
require_once('./ftp.php');

if(empty($_FILES["data"]) or empty($_FILES["meta"])) error("Data and Meta file are required!");

$obj = json_decode(file_get_contents($_FILES["meta"]['tmp_name']),true);
//var_dump($obj);

//var_dump($ftp->ftp_nlist("."));
$meta_result = $ftp->ftp_put("./".$obj["id"].".json", $_FILES["meta"]['tmp_name'], FTP_BINARY);
$data_result = $ftp->ftp_put("./".$obj["id"], $_FILES["data"]['tmp_name'], FTP_BINARY);

$ftp->ftp_close();

if(!$meta_result) error("Failed to upload meta file!");
if(!$data_result) error("Failed to upload data file!");

?>