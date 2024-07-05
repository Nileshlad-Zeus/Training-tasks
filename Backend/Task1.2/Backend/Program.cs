using MySql.Data.MySqlClient;
using Dapper;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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


builder.Services.AddControllers();

var app = builder.Build();
app.UseCors(MyAllowSpecificOrigins);


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

string? connectionString = null;
connectionString = "server=localhost;database=database1;uid=root;pwd=bAKU@#0919;";
using var connection = new MySqlConnection(connectionString);
await connection.OpenAsync();

app.MapGet("/getalldata/{offset}", async (int offset) =>
{
    var offset2 = (offset-1)*100;
    var query = $"SELECT * FROM employee_info LIMIT 100 OFFSET {offset2}";
    var employees = await connection.QueryAsync<Employee>(query);
    return employees.ToArray();
})
.WithName("getalldata")
.WithOpenApi();

string csvFilePath = "C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/users.csv";

app.MapPost("/uploadcsv", async () =>
{
    string tableName = "employee_info";

    using var transaction = await connection.BeginTransactionAsync();

    try
    {
        string query = $"LOAD DATA INFILE '{csvFilePath}' " +
                       $"INTO TABLE {tableName} " +
                       "FIELDS TERMINATED BY ',' " +
                       "ENCLOSED BY '\"' " +
                       "LINES TERMINATED BY '\n' " +
                       "IGNORE 1 ROWS";

        var command = new MySqlCommand(query, connection);
        int rowsAffected = await command.ExecuteNonQueryAsync();

        await transaction.CommitAsync();

        return $"{rowsAffected} rows loaded successfully.";
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        return $"Error: {ex.Message}";
    }
})
.WithName("UploadCSV")
.WithOpenApi();

app.Run();

public class Employee
{
    public string email_id { get; set; }
    public string name { get; set; }
    public string country { get; set; }
    public string state { get; set; }
    public string city { get; set; }
    public string telephone_number { get; set; }
    public string address_line_1 { get; set; }
    public string address_line_2 { get; set; }
    public DateTime date_of_birth { get; set; }
    public decimal gross_salary_2019_20 { get; set; }
    public decimal gross_salary_2020_21 { get; set; }
    public decimal gross_salary_2021_22 { get; set; }
    public decimal gross_salary_2022_23 { get; set; }
    public decimal gross_salary_2023_24 { get; set; }

}