<?php
$queries = array();
parse_str($_SERVER['QUERY_STRING'], $queries);
if ( ! isset($queries["day"]) ) {
  $queries["day"] = "0";
}
if ( strval($queries["day"]) !== strval(intval($queries["day"])) ) {
  http_response_code(400);
  header("Content-Type: text/plain");
  echo "400 Bad Request";
  return;
}
$result = 0;
$output = "";
exec("python3 day.py " . $queries["day"] . " 2>&1", $output, $result);
if ( $result != 0 ) {
  http_response_code(500);
  header("Content-Type: text/html");
  echo "500 Internal Server Error<br />Python exited with code " . strval($result) . "<br /><pre>" . str_replace("\n", "<br />", htmlentities(join("\n", $output))) . "</pre>";
} else {
  header("Content-Type: application/json");
  echo join("\n", $output);
}
?>