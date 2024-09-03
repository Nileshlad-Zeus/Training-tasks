using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using MongoDB.Bson;
using MongoDB.Driver;

public class RabbitMQService
{
    private readonly IConfiguration _configuration;
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly IMongoDatabase _database;

    public RabbitMQService(IConfiguration configuration, IMongoDatabase database)
    {
        _configuration = configuration;
        _database = _database = database ?? throw new ArgumentNullException(nameof(database), "MongoDB Database instance is null."); ;

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

        var totoal = 1;
        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += async (model, ea) =>
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var lines = message.Split('\n');
                var valuesList = new List<BsonDocument>();
                foreach (var line in lines)
                {
                    var values = line.Split(',');
                    if (values.Length == 15)
                    {
                        var document = new BsonDocument{
                         { "RowNo", int.Parse(values[0]) },
                    { "A", values[1] },
                    { "B", values[2] },
                    { "C", values[3] },
                    { "D", values[4] },
                    { "E", values[5] },
                    { "F", values[6] },
                    { "G", values[7] },
                    { "H", values[8] },
                    { "I", values[9] },
                    { "J", values[10] },
                    { "K", values[11] },
                    { "L", values[12] },
                    { "M", values[13] },
                    { "N", values[14] }
                       };
                        valuesList.Add(document);
                    }
                }

                if (valuesList.Count > 0)
                {
                    var employeeCollection = _database.GetCollection<BsonDocument>("excel_data");
                    await employeeCollection.InsertManyAsync(valuesList);
                    var progressCollection = _database.GetCollection<BsonDocument>("progress");
                    var update = Builders<BsonDocument>.Update.Inc("CompletedChunks", 1);
                    await progressCollection.UpdateOneAsync(new BsonDocument(), update);
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