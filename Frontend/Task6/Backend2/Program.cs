using Microsoft.EntityFrameworkCore;
using Backend2.Models;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


builder.Services.AddDbContext<Database1Context>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
                      Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.37-mysql")));

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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