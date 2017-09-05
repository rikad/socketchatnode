/*
* @Author: elawliet
* @Date:   2017-08-30 09:47:05
* @Last Modified by:   elawliet
* @Last Modified time: 2017-09-04 16:03:30
*/
'use strict';

const KEY = 'adminkey';
const WebSocket = require('ws');

const socketServer =  new WebSocket.Server({ port: 9090, clientTracking: true});

var Myclients = {};
var clientsInfo = {};
var admin = {};
var id;
var url;

socketServer.on('connection',function (ws, req) {
    id = ws._ultron.id;
    clientsInfo[id]= {};
    clientsInfo[id].address = req.connection.remoteAddress;
    url = req.url;

    if(isAdmin()) {
        whenAdminConnected(ws);
        whenAdminClosed(ws);
    } else {
        whenClientConnected(ws);
        whenClientClosed(ws);
    }

});

function isAdmin() {
    var token = require('url').parse(url, true);
    token = token.query.token;

    return token == KEY ? true : false;
}

function isAdminOnline() {
    return admin.send == undefined ? false : true;
}

function whenAdminClosed(ws) {
    ws.on('close', function (){
        admin = {};
        colorLog('Closed Admin '+id+':'+clientsInfo[id].address,'red');
    });
}

function whenClientClosed(ws) {
    ws.on('close', function (){
        delete Myclients[id];

        if (isAdminOnline()) {
            admin.send('{ clients: '+totalOnline()+'}');
        }

        colorLog('Closed Client '+id+':'+clientsInfo[id].address,'red');
        printTotalOnline();
    });
}

function whenAdminConnected(ws) { //pr
    //when admin send message, forward to spesific client
    ws.on('message', function (message) {
        var text = JSON.parse(message);

        colorLog('received: '+ message,'blue');
        ws.send(text.message);
    });

    admin = ws;
    colorLog('Admin Connected ... with ID '+ id+':'+clientsInfo[id].address,'yellow');
}

function whenClientConnected(ws) {

    //when client send message, forward to admin
    ws.on('message', function (message) {
        var text = JSON.parse(message);
        text.address = clientsInfo[id].address;

        colorLog('received: '+ message,'blue');
        if (isAdminOnline()) {
            admin.send(JSON.stringify(text));
        } else {
            ws.send('Mohon Maaf Admin Sedang Offline');
        }

    });

    //start when client connect
    Myclients[id] = ws;

    if (isAdminOnline()) {
        admin.send('{ clients: '+totalOnline()+'}');
    }

    colorLog('New Client Connected ... with ID '+ id+':'+clientsInfo[id].address,'yellow');
    printTotalOnline();
}

function totalOnline() {
    return Object.keys(Myclients).length;
}
function printTotalOnline() {
    colorLog('Total Online : '+totalOnline(), 'green'); //Total Online
}

function colorLog(text,color) {

    var colors = {
        blue: '\x1b[34m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        green: '\x1b[32m',
        reset: '\x1b[0m'
    };

    console.log(colors[color] + text + colors['reset']);
}


colorLog('Chat Server Listening ....','green');