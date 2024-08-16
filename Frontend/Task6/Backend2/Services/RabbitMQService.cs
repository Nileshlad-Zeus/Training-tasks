using RabbitMQ.Client;
using RabbitMQ.Client.Events;

using System.Text;
using Microsoft.Extensions.Configuration;

public class RabbitMQService
{
    private readonly IConfiguration _configuration;
    private readonly IConnection _connection;
    private readonly IModel _channel;

    public RabbitMQService(IConfiguration configuration)
    {
        _configuration = configuration;

        var factory = new ConnectionFactory()
        {
            HostName = _configuration["RabbitMQ:HostName"],
            UserName = _configuration["RabbitMQ:UserName"],
            Password = _configuration["RabbitMQ:Password"]
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        _channel.QueueDeclare(queue: _configuration["RabbitMQ:QueueName"],
                             durable: false,
                             exclusive: false,
                             autoDelete: false,
                             arguments: null);
    }

    public void PublishMessage(string message)
    {

        Console.WriteLine(message);
        var body = Encoding.UTF8.GetBytes(message);
        _channel.BasicPublish(exchange: "",
                             routingKey: _configuration["RabbitMQ:QueueName"],
                             basicProperties: null,
                             body: body);

    }

    public void ConsumeMessage()
    {
        Console.WriteLine("ConsumeMessage");
        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += (model, ea) =>
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                
                Console.WriteLine($"Message Received: {message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing message: {ex.Message}");
            }
        };

        _channel.BasicConsume(queue: _configuration["RabbitMQ:QueueName"], autoAck: true, consumer: consumer);
        Console.WriteLine("Press [enter] to exit.");
        Console.ReadKey();
    }
}