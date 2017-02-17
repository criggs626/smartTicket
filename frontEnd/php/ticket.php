<?php

include 'query.php';

$id = (int) $_GET["id"];
if ($id == 0) {
    die ("Error loading ticket data: id not found.");
}

$query = "SELECT * FROM tickets WHERE id=$id;";
$array = query($query);

if ($array !== FALSE && count($array) > 0) {
    echo json_encode($array[0]);
} else {
    die("Error loading ticket data: is there anything in the database?");
}

?>