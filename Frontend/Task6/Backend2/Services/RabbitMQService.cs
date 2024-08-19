using RabbitMQ.Client;
using RabbitMQ.Client.Events;

using System.Threading.Tasks;

using MySql.Data.MySqlClient;
using Dapper;
using System.Text;
using System.Text.Json;


using Microsoft.Extensions.Configuration;
// using Newtonsoft.Json;
using Backend2.Models;

public class RabbitMQService
{
    private readonly IConfiguration _configuration;
    private readonly IConnection _connection;
    private readonly IModel _channel;

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




    public async Task ConsumeMessage()
    {

        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += async (model, ea) =>
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            using var transaction = await connection.BeginTransactionAsync();
            try
            {

                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                string[] lines = message.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);

                foreach (string line in lines)
                {
                    string[] l1 = line.Split(new[] { "," }, StringSplitOptions.None);

                    var query = @"INSERT INTO employee_info 
                            (email_id, name, country, state, city, telephone_number, address_line_1,address_line_2,date_of_birth,gross_salary_2019_20,gross_salary_2020_21,gross_salary_2021_22,gross_salary_2022_23, gross_salary_2023_24) 
                            VALUES (@value1, @value2,@value3, @value4, @value5, @value6, @value7, @value8,@value9, @value10, @value11, @value12, @value13, @value14)";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.Clear();
                        for (var i = 0; i < l1.Count(); i++)
                        {
                            command.Parameters.AddWithValue($"@value{i + 1}", l1[i]);
                        }

                        if (command.Parameters.Count == 14)
                        {
                            await command.ExecuteNonQueryAsync();
                        }
                        else
                        {

                            await transaction.RollbackAsync();
                            Console.WriteLine($"Line skipped due to incorrect number of fields: {line}");
                        }
                    }
                }

                await transaction.CommitAsync();
            }
            catch (Newtonsoft.Json.JsonException jsonEx)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"JSON error 2 processing message: {jsonEx.Message}");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine(ex);
                Console.WriteLine($"Error processing message 2: {ex.Message}");
            }
        };

        _channel.BasicConsume(queue: _configuration["RabbitMQ:QueueName"], autoAck: true, consumer: consumer);
    }
}