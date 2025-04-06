<?php
$result = 0;
$output = "";
exec("python3 quote.py 2>&1", $output, $result);
if ( $result != 0 ) {
  http_response_code(500);
  header("Content-Type: text/html");
  echo "500 Internal Server Error<br />Python exited with code " . strval($result) . "<br /><pre>" . str_replace("\n", "<br />", htmlentities(join("\n", $output))) . "</pre>";
} else {
  header("Content-Type: text/plain");
  echo "h" . join("\n", $output);
}
?>