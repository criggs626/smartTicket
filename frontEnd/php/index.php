<!DOCTYPE html>
<html lang=en>
    <?php include 'query.php'; ?>
    <head>
        <meta charset=utf-8>
        <title>SmartTicket - Submit a Ticket</title>

        <link rel=stylesheet href=../css/materialize.min.css>
        <link rel=stylesheet href=../css/custom.css>

        <script src=../js/jquery.min.js></script>
        <script src=../js/materialize.min.js></script>
        <script src=../js/view_tickets.js></script>
        <script src=../js/index.js></script>
    </head>
    <body><nav>
            <img src="../img/logo.png" height="35px">
        </nav>
        <nav class="links">

        </nav>

        <main>
            <div class="row">
                <div class="col s10 offset-s1 main">
                    <section id=ticketsTable>
                        <h4>Submit a Ticket</h4>
                        <h6>
                            Fill out the form below or email
                            <a href="mailto:newticket@SmartTicket.com"
                               target=_blank>
                                newticket@SmartTicket.com
                            </a> to submit a ticket.
                        </h6>
<?php
$fName = $lName = $subject = $email = $details = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fName = (isset($_POST["fName"])) ? $_POST["fName"] : "";
    $lName = (isset($_POST["lName"])) ? $_POST["lName"] : "";
    $subject = (isset($_POST["subject"])) ? $_POST["subject"] : "";
    $email = (isset($_POST["email"])) ? $_POST["email"] : "";
    $details = (isset($_POST["details"])) ? $_POST["details"] : "";
    
    // if ALL are set
    if ($fName !== "" && $lName !== "" && $subject !== ""
            && $email !== "" && $details !== "") {
        $fName = filter_var($fName, FILTER_SANITIZE_STRING);
        $lName = filter_var($lName, FILTER_SANITIZE_STRING);
        $subject = filter_var($subject, FILTER_SANITIZE_STRING);
        $email = filter_var($email, FILTER_SANITIZE_STRING);
        $details = filter_var($details, FILTER_SANITIZE_STRING);
        $query = "insert into tickets(subject,asignee_id,user_id,priority,description) values('$subject','Caleb Riggs','$fName $lName',1,'$details');";
        $message = "";
        if (query($query)) {
            $fName = $lName = $subject = $email = $details = "";
            $message = "You ticket has been submitted succesfully!";
        } else {
            $message = "Error submitting your ticket.";
        }
        echo "<script>$(function() { alert(\"$message\"); });</script>";
    }
}
?>
                        <br>
                        <form id=ticketForm method=post action=index.php>
                            <input name=fName placeholder="First Name"
                                   class=name
                                   value="<?php echo $fName ?>">
                            <input name=lName placeholder="Last Name"
                                   class=name
                                   value="<?php echo $lName ?>">
                            <input name=email placeholder="Email"
                                   value="<?php echo $email ?>">
                            <input name=subject placeholder="Subject"
                                   value="<?php echo $subject ?>">
                            <div id=textAreaBorder>
                                <textarea name=details id=details
                                          class=materialize-textarea
                                          ><?php echo $details;
                                    ?></textarea>
                            </div>
                            <br><br>
                            <label for=file>
                                <a id=fileLink
                                   class="waves-effect waves-light btn">
                                    Attach a file
                                </a>
                            </label>
                            <input type=file name=fileUpload id=file>
                            <a id=formSubmit
                               class="waves-effect waves-light btn">
                                Submit
                            </a>
                        </form>
                        <br>
                    </section>
                </div>
            </div>
        </main>
    </body>
</html>