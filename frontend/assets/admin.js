var clients = {};

var admin = {
    avatar: "admin.jpg",
    token: "adminkey"
};

var bot = {
    avatar: "android.gif",
    isErrorStatusSend: false,
    sendErrorStatus: function() {
        if (this.isErrorStatusSend == false) {
            insertChat("bot", "Oppss !, You are not Connected... Try To Reconnect in 5 second");
            this.isErrorStatusSend = true;
        }
    }
};

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function insertChat(who, text){
    var control = "";
    var date = formatAMPM(new Date());
    
    if (who == "admin"){
        
        control = '<li style="width:100%">' +
                        '<div class="msj macro">' +
                        '<div class="avatar"><img class="img-circle" style="width:100%;" src="client.jpg" /></div>' +
                            '<div class="text text-l">' +
                                '<p>'+ text +'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '</div>' +
                    '</li>';                    
    }else if(who == 'client'){
        control = '<li style="width:100%;">' +
                        '<div class="msj-rta macro">' +
                            '<div class="text text-r">' +
                                '<p>'+text+'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="'+admin.avatar+'" /></div>' +                                
                  '</li>';
    }else{
        control = '<li style="width:100%;">' +
                        '<div class="msj-rta macro">' +
                            '<div class="text text-r">' +
                                '<p>'+text+'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="'+bot.avatar+'" /></div>' +                                
                  '</li>';
    }

    $("#textChat ul").append(control);    
}

function resetChat(){
    $("#textChat ul").empty();
}

$(".mytext").on("keyup", function(e) {
    if (e.which == 13){
        var text = $(this).val();
        if (text !== ""){
            insertChat("admin", text);

            admin.message = text;
            websocket.send(JSON.stringify(admin));
            $(this).val('');
        }
    }
});

document.querySelectorAll('.listChat').forEach(function(elemen){
    elemen.addEventListener('click',function() {
        alert('haha');
    });
});


function MySocket() {
    //var wsUri = "ws://echo.websocket.org/";
    var wsUri = "ws://localhost:9090?token="+admin.token;

    websocket = new WebSocket(wsUri);

    websocket.onopen = function(message) {
        bot.isErrorStatusSend = false;
        var text = 'Connected ...';
        insertChat('bot',text);
    };

    websocket.onmessage = function(message) {
        insertChat("client",message.data);
    };

    websocket.onclose = function(message) {
        bot.sendErrorStatus();
        if (websocket.readyState == 3) {
            setTimeout(MySocket(), 5000);
        }
    };
}



//-- Clear Chat
resetChat();

//start chat
MySocket();