$(function() {
    $.ajax(
        '/getFAQ',
        {
            success: function(data, textStatus) {
                console.log('FAQ data:', data);
                for (var i = 0; i < data.length; i++) {
                    var temp = $('#faq_template')[0].cloneNode(true);
                    var $temp = $(temp);
                    $temp.find('.faq_q').text(data[i].QUESTION);
                    $temp.find('.faq_a').text(data[i].ANSWER);
                    $temp.attr('id', data[i].FAQ_ID);
                    $temp.insertAfter('#faq_template');
                }
            },
            failure: function(jqXHR, textStatus, error) {
                console.error(error);
            }
        }
    );
});
