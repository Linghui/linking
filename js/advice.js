
function submit(){
    document.getElementById('act_icon').style.display = 'inline';
    //var t=setTimeout(exit,5000)
    var content = document.getElementById('content').value;
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var ad_kind = $("input[name='ad_kind']:checked").val();
    if(typeof content != 'undefined' && content != null && content != ""){
        console.log( 'content : ' + content);
    } else {
        console.log( 'content : null : ' + content);
        return;
    }
    $.ajaxSetup({
        url: "http://www.jian-yin.com/linking/php/advice.php",
        //url: "http://192.168.1.27/php/advice.php",
        global: false,
        type: "POST",
        success: function(){
            console.log( 'done');
            exit();
        },
        error: function(){
            console.log( 'error');
            exit();
        }

    });
    $.ajax({
      data: {'ad_kind': ad_kind, 'content': encodeURI(content), 'name': encodeURI(name), 'email':email}
    });
}
function exit(){
    alert('Thank you! :)');
    window.close();
}