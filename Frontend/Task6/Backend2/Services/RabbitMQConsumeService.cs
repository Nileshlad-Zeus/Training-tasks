using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

public class RabbitMQConsumerService : IHostedService
{
    private readonly RabbitMQService _rabbitMQService;

    public RabbitMQConsumerService(RabbitMQService rabbitMQService)
    {
        _rabbitMQService = rabbitMQService;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _rabbitMQService.ConsumeMessage();
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
