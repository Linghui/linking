<?php
///*
// $servername = 'localhost';
// $username   = 'DB1FA7A';
// $password   = '899f80';
//*/
$servername = 'localhost';
$username   = 'root';
$password   = 'root';
$con = mysql_connect($servername,$username,$password);
if (!$con){
    die('Could not connect: ' . mysql_error());
}
if(!$_REQUEST[ad_kind] || !$_REQUEST[content]){
    die("content request");
}
$content = urldecode($_REQUEST[content]);
$name = urldecode($_REQUEST[name]);

mysql_select_db("linking", $con);
$sql="INSERT INTO advice (advice_kind, content, name, email)
VALUES
('$_REQUEST[ad_kind]','$content','$name','$_REQUEST[email]')";

if (!mysql_query($sql,$con))
  {
  die('Error: ' . mysql_error());
  }
mysql_close($con);
echo "success";
?>