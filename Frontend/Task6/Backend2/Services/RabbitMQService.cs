using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using MySql.Data.MySqlClient;
using System.Text;

public class RabbitMQService
{
    private readonly IConfiguration _configuration;
    private readonly IConnection _connection;
    private readonly IModel _channel;

    public readonly string[] NewlineSeparators = ["\r\n", "\r", "\n"];

    private readonly string _connectionString;

    public RabbitMQService(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = "server=localhost;database=database1;uid=root;pwd=bAKU@#0919;";

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

    public void PublishMessage(string combinedMessage)
    {

        try
        {
            var body = Encoding.UTF8.GetBytes(combinedMessage);
            _channel.BasicPublish(exchange: "",
                                 routingKey: _configuration["RabbitMQ:QueueName"],
                                 basicProperties: null,
                                 body: body);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error publishing message: {ex.Message}");
        }
    }




    public void ConsumeMessage()
    {

        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += async (model, ea) =>
        {
            using var connection = new MySqlConnection(_connectionString);
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                var lines = message.Split('\n');
                var valuesList = new List<string>();

                foreach (var line in lines)
                {
                    var values = line.Split(',');
                    if (values.Length == 15)
                    {
                        var valuesFormatted = string.Join(",", values.Select(v => $"'{v}'"));
                        valuesList.Add($"({valuesFormatted})");
                    }
                }

                if (valuesList.Count > 0)
                {

                    await connection.OpenAsync();

                    var query = $"INSERT INTO employee_info (RowNo,A,B,C,D,E,F,G,H,I,J,K,L,M,N) VALUES {string.Join(",", valuesList)};";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        await command.ExecuteNonQueryAsync();
                    }

                    await connection.CloseAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing message: {ex.Message}");
            }

        };

        _channel.BasicConsume(queue: _configuration["RabbitMQ:QueueName"], autoAck: true, consumer: consumer);
    }
}