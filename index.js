var express = require('express')
var app = express();
var server = app.listen(5000, function(){
    console.log('App is listening at 5000 and ' + ip.address());
    
});
var ip = require('ip')
var io = require('socket.io').listen(server)

var mongo = require('mongodb').MongoClient;

mongo.connect('mongodb://localhost:27017/', function(err, db){
    if(err)
    {
        throw err;
    } else{
        var dbo = db.db('chatdb');
        console.log("Connected to db"); 

        io.on('connection',function(socket){
            console.log('New connection');

            let chat = dbo.collection("chats")

            //create function to send status
            SendStatus = function(s){
                socket.emit('status',s)
            }
            //get chats from mongo collection
            chat.find().limit(100).sort({_id: 1}).toArray(function(err,res){
                if(err)
                {
                    throw err
                }
                
            //emit the messages
            socket.emit('output', res);
            })

            //handle input event
            socket.on('input',function(data){
                let name = data.name;
                let message = data.message;
                if(name == '' || message == ''){
                    SendStatus('Please enter name and msg')
                } else{
                    chat.insert({
                        name: name,
                        message: message
                    })
                    io.emit('output',[data])


                    SendStatus({
                        message: 'message sent',
                        clear: true
                    })
                }
            })

            //check for name and messages

            //insert messages

            socket.on('clear', function(data){
                chat.remove({}, function(){
                    socket.emit('cleared')
                })
            })
        
            socket.on('disconnect',function(){
                console.log('Disconnected');
                
            })
            
        })
        
    }
})



app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html')
})
