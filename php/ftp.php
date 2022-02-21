<?php
function error($message,$code=5000){
	if(isset($ftp)) $ftp->ftp_close();
	http_response_code($code);
	exit($message);
}
class ftp{
    public $conn;

    public function __construct($url){
        $this->conn = ftp_connect($url);
    }
   
    public function __call($func,$a){
        if(strstr($func,'ftp_') !== false && function_exists($func)){
            array_unshift($a,$this->conn);
            return call_user_func_array($func,$a);
        }else{
            // replace with your own error handler.
            die("$func is not a valid FTP function");
        }
    }
}
$ini = parse_ini_file("server.ini");

$ftp = new ftp($ini['host']);
if(!$ftp->ftp_login($ini['user'],$ini['pass'])) error("Failed to login to ftp server!");
$ftp->ftp_pasv(true);
?>