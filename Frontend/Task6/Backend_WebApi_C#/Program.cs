using Microsoft.EntityFrameworkCore;
using Backend2.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MySql.Data.MySqlClient;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<RabbitMQService>();

builder.Services.AddHostedService<RabbitMQConsumerService>();

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";


builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      builder =>
                      {
                          builder.WithOrigins("http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:5500")
                                 .AllowAnyHeader()
                                 .AllowAnyMethod()
                                 .AllowCredentials();
                      });
});


// Add services to the container.

// builder.Services.AddDbContext<Database1Context>(options =>
//     options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
//                       Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.37-mysql")));

// var connection = new MySqlConnection("server=localhost;database=database1;uid=root;pwd=bAKU@#0919;")
builder.Services.AddTransient(sp =>
{
    return new MySqlConnection("server=localhost;database=database1;uid=root;pwd=bAKU@#0919;");
});
 

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors(MyAllowSpecificOrigins);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();


// dotnet ef dbcontext scaffold "server=localhost;database=database1;uid=root;pwd=bAKU@#0919;" Microsoft.EntityFrameworkCore.sqlServer -o Models