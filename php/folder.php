<?php
	require_once('./ftp.php');
				
	//check for method and id
	$id = $_GET["id"];
	$method = $_GET["method"];
	if(empty($id) or empty($method)) error("id and method are required!");
	$id = urlencode($id);

	//check if file exists
	if($ftp->ftp_size($id.'.json') === -1) error("File does not exist!",410);
	
	//retrieve the metadata for the file download
	ob_start();
	$result = $ftp->ftp_get("php://output", './'.$id.'.json', FTP_BINARY);
	$meta = json_decode(ob_get_contents(),true);
	ob_end_clean();
	
	echo '<link rel="stylesheet" href="../css/folder.css">';
	echo '<script type="module" src="../js/folder.js"></script>';

	foreach($meta['files'] as $id){
		echo '<iframe data-src="/php/file.php?method='.$method.'&id='.$id.'"></iframe>';		
	}
?>