using System;
using System.Text;
using RabbitMQ.Client;

var factory = new ConnectionFactory { HostName = "localhost" };

using var connection = factory.CreateConnection();

using var channel = connection.CreateModel();
channel.QueueDeclare(queue: "letterbox", durable: false, exclusive: false, autoDelete: false, arguments: null);
for (var i = 0; i < 15; i++)
{
    var message = $"Nilesh {i}";
    var encodeMessage = Encoding.UTF8.GetBytes(message);
    channel.BasicPublish("", "letterbox", null, encodeMessage);
    Console.WriteLine($"Published message {message} {i}");
}