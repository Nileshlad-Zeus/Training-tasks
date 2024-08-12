﻿using System;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

//create new connection Factory
var factory = new ConnectionFactory{HostName="localhost"};

//new connection
using var connection = factory.CreateConnection();

//create new channels
using var channel = connection.CreateModel();

channel.QueueDeclare(queue:"letterbox", durable:false, exclusive:false, autoDelete:false, arguments:null);


var consumer = new EventingBasicConsumer(channel);
consumer.Received += (model, ea)=>
{
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    Console.WriteLine($"Message Received: {message}");    
};

channel.BasicConsume(queue:"letterbox", autoAck:true, consumer:consumer);

Console.ReadKey();


