using System;
using System.Text;
using RabbitMQ.Client;


//create new connection Factory
var factory = new ConnectionFactory{HostName="localhost"};

//new connection
using var connection = factory.CreateConnection();

//create new channels
using var channel = connection.CreateModel();

channel.QueueDeclare(queue:"letterbox", durable:false, exclusive:false, autoDelete:false, arguments:null);

var message = "Nilesh";

var encodeMessage = Encoding.UTF8.GetBytes(message);

channel.BasicPublish("","letterbox", null, encodeMessage);

Console.WriteLine($"Published message {message}");





