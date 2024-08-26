using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Dapper;
using System.Text;

namespace Backend2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeController : ControllerBase
    {

        private const int chunkSize = 500;

        private readonly string _connectionString;

        private readonly RabbitMQService _rabbitMQService;

        public EmployeeController(RabbitMQService rabbitMQService)
        {
            _connectionString = "server=localhost;database=database1;uid=root;pwd=bAKU@#0919;";
            _rabbitMQService = rabbitMQService;
        }


        [HttpGet]
        public async Task<IActionResult> Get(int offset)
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            var query = $"SELECT * FROM employee_info ORDER BY RowNo LIMIT 500 OFFSET {offset * 500}";
            var e1 = await connection.QueryAsync(query);
            return Ok(e1);
        }

        [HttpPost]
        [Route("UploadFile")]
        public async Task<IActionResult> Post(IFormFile file)
        {
            var fileName = file.FileName;

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Upload\\Files");
            if (!Directory.Exists(filePath))
            {
                Directory.CreateDirectory(filePath);
            }
            var exactpath = Path.Combine(Directory.GetCurrentDirectory(), "Upload\\Files", fileName);

            using (var stream = new FileStream(exactpath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string csvFilePath = exactpath;

            if (!System.IO.File.Exists(csvFilePath))
            {
                return NotFound("CSV file not found.");
            }


            var lines = new List<string>();

            using (var reader = new StreamReader(csvFilePath))
            {
                string line;
                int rowNumber = 1;
                while ((line = reader.ReadLine()) != null)
                {
                    string row = $"{rowNumber},{line}";
                    lines.Add(row);
                    rowNumber++;
                }
            }

            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            var query = $"INSERT INTO progress (totalchunks) VALUES ({lines.Count / chunkSize});";

            using (var command = new MySqlCommand(query, connection))
            {
                await command.ExecuteNonQueryAsync();
            }
            await connection.CloseAsync();

            for (int i = 0; i < lines.Count; i += chunkSize)
            {
                var chunk = lines.Skip(i).Take(chunkSize).ToList();
                string combinedMessage = string.Join("\n", chunk);
                _rabbitMQService.PublishMessage(combinedMessage);
            }

            return Ok("Messages have been published in chunks.");
        }


        [HttpGet]
        [Route("GetProgress")]
        public async Task<IActionResult> Get()
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            var query = $"SELECT * FROM progress";
            var e1 = await connection.QueryAsync(query);
            return Ok(e1);
        }

        [HttpPost]
        [Route("updatevalue")]
        public async Task<IActionResult> Updatevalue(string column, int row, string text=" ")
        {
            if (string.IsNullOrEmpty(column) || string.IsNullOrEmpty(text))
            {
                return BadRequest("Invalid parameters.");
            }
            if (column.Contains("`") || column.Contains("'") || column.Contains(";"))
            {
                return BadRequest("Invalid column name.");
            }

            try
            {
                using var connection = new MySqlConnection(_connectionString);
                await connection.OpenAsync();

                var query = $"UPDATE employee_info SET `{column}` = @Text WHERE `RowNo` = @Row";

                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@Text", text);
                command.Parameters.AddWithValue("@Row", row);

                var count = await command.ExecuteNonQueryAsync();
                return Ok(new { Status = true, Count = count });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return StatusCode(500, "Internal server error.");
            }
        }


        [HttpPost]
        [Route("findandreplace")]
        public async Task<IActionResult> FindandReplace(string findText, string replaceText)
        {
            if (string.IsNullOrEmpty(findText) || string.IsNullOrEmpty(replaceText))
            {
                return BadRequest("Invalid parameters.");
            }

            var connectionString = _connectionString;
            var tableName = "employee_info";
            var databaseName = "database1";

            var updateStatements = new List<string>();

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                var columnsQuery = @"
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = @TableName 
            AND TABLE_SCHEMA = @DatabaseName 
            AND DATA_TYPE IN ('varchar', 'char', 'text', 'nvarchar', 'nchar', 'ntext')";

                var columns = await connection.QueryAsync<string>(columnsQuery, new { TableName = tableName, DatabaseName = databaseName });
                if (columns.Any())
                {
                    var noOfRowsAffected = (double)0;
                    foreach (var column in columns)
                    {
                        var selectQuery = $@" SELECT COUNT(*) FROM `{tableName}` WHERE `{column}` = @FindText";

                        using (var command = new MySqlCommand(selectQuery, connection))
                        {
                            command.Parameters.AddWithValue("@FindText", findText);

                            var count = (long)await command.ExecuteScalarAsync();
                            noOfRowsAffected += count;
                        }
                    }

                    foreach (var column in columns)
                    {
                        // Construct the SET clause for the UPDATE statement
                        var query = $"UPDATE `{tableName}` SET `{column}` = @ReplaceText WHERE `{column}` = @FindText";
                        using (var command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@FindText", findText);
                            command.Parameters.AddWithValue("@ReplaceText", replaceText);
                            await command.ExecuteNonQueryAsync();
                        }
                    }



                    var Status = true;
                    return Ok(new { Status = true, noOfRowsAffected = noOfRowsAffected });
                }
                else
                {
                    return NotFound("No columns found for the specified table.");
                }
            }
        }


    }
}