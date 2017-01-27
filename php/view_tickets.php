<!DOCTYPE html>
<html lang=en>
    <?php include 'query.php'; ?>
    <head>
        <meta charset=utf-8>
        <title>SmartTicket - View Tickets</title>

        <link rel=stylesheet href=../css/materialize.min.css>
        <link rel=stylesheet href=../css/custom.css>

        <script src=../js/jquery.min.js></script>
        <script src=../js/materialize.min.js></script>
        <script src=../js/view_tickets.js></script>
    </head>
    <body>

        <nav>
            <img src="../img/logo.png" height="35px">
        </nav>
        <nav class="links">

        </nav>

        <main><div class="row">
                <div class="col s10 offset-s1 main">
                    <section id=ticketsTable>
                        <table class="striped highlight">
                            <thead>
                                <tr>
                                    <th>Ticket&nbsp;#</th>
                                    <th>Subject</th>
                                    <th>Client</th>
                                    <th>Priority</th>
                                    <th>Assignee</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                $array = query("SELECT * FROM tickets");
                                if (empty($array)) {
                                    echo "
                        <tr id=-1 class=\"ticket noresults\">
                            <td>No tickets found</td>
                        </tr>";
                                } else {
                                    foreach ($array as $ticket) {
                                        echo "
                        <tr id={$ticket[0]} class=ticket>
                            <td class=\"ticketNum\">
                                {$ticket[0]}
                            </td>
                            <td class=\"subject\">
                                {$ticket[1]}
                            </td>
                            <td class=\"client\">
                                {$ticket[2]}
                            </td>
                            <td class=\"priority\">
                                {$ticket[4]}
                            </td>
                            <td class=\"assignee\">
                                {$ticket[3]}
                            </td>
                        </tr>";
                                    }
                                }
                                echo "\n";
                                ?>
                            </tbody>
                        </table>
                    </section>

                    <div class="row viewHead">
                        <div class="col s3">
                            <div id=viewTicketID>
                                <h5>Ticket # <span class=data></span></h5>
                            </div>
                        </div>
                        <div class="col s6">
                            <h5><div id=viewTicketTitle></div></h5>
                        </div>
                        <div class="col s3">
                            <h5><div id=viewTicketClient style="text-align:right;"></div></h5>
                        </div>
                    </div>
                    
                       
                        <div id=viewTicketActions class="row viewNav">
                            <div id=viewTicketReply class="col s3">Reply</div>
                            <div id=viewTicketAssign class="col s3">Assign</div>
                            <div id=viewTicketAccept class="col s3">Accept</div>
                            <div id=viewTicketClose class="col s3">Close</div>
                        </div>
                        <div id=viewTicketBodyMessages class="description">
                            Messages will appear here.
                        </div></div>
            </div>
        </main>
    </body>
</html>