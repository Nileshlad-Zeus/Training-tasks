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

        private readonly MySqlConnection _connection;

        private readonly RabbitMQService _rabbitMQService;

        public EmployeeController(RabbitMQService rabbitMQService, MySqlConnection connection)
        {
            _connection = connection;
            _rabbitMQService = rabbitMQService;
        }


        [HttpGet]
        public async Task<IActionResult> Get(int offset)
        {
            try
            {
                await _connection.OpenAsync();
                var query = $"SELECT * FROM employee_info ORDER BY RowNo LIMIT 500 OFFSET {offset * 500}";
                var result = await _connection.QueryAsync(query);
                return Ok(new { Status = true, result });
            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }

        }



        [HttpPost]
        [Route("UploadFile")]
        public async Task<IActionResult> Post(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { Status = false, Message = "Invalid file." });
            }
            try
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
                    return NotFound(new { Status = false, Message = "CSV file not found." });
                }


                var lines = new List<string>();
                using (var reader = new StreamReader(csvFilePath))
                {
                    string line;
                    int rowNumber = 1;
                    while ((line = reader.ReadLine()) != null)
                    {
                        lines.Add($"{rowNumber},{line}");
                        rowNumber++;
                    }
                }

                await _connection.OpenAsync();
                var totalChunk = Math.Ceiling((decimal)lines.Count / chunkSize);
                var query = $"INSERT INTO progress (totalchunks) VALUES (@TotalChunk);";

                using (var command = new MySqlCommand(query, _connection))
                {
                    command.Parameters.AddWithValue("@TotalChunk", totalChunk);
                    await command.ExecuteNonQueryAsync();
                }

                for (int i = 0; i < lines.Count; i += chunkSize)
                {
                    var chunk = lines.Skip(i).Take(chunkSize).ToList();
                    string combinedMessage = string.Join("\n", chunk);
                    _rabbitMQService.PublishMessage(combinedMessage);
                }

                return Ok(new { Status = true, Message = "Messages have been published in chunks." });
            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }

        }


        [HttpGet]
        [Route("GetProgress")]
        public async Task<IActionResult> GetProgress()
        {
            try
            {
                await _connection.OpenAsync();
                var query = $"SELECT * FROM progress";
                var result = await _connection.QueryAsync(query);
                return Ok(new { Status = true, result });
            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        [HttpPost]
        [Route("updatevalue")]
        public async Task<IActionResult> Updatevalue(string column, int row, string text = " ")
        {
            if (string.IsNullOrEmpty(column) || string.IsNullOrEmpty(text))
            {
                return BadRequest(new { Status = false, Message = "Invalid parameters." });
            }

            if (column.Contains("`") || column.Contains("'") || column.Contains(";"))
            {
                return BadRequest(new { Status = false, Message = "Invalid column name." });
            }

            try
            {
                await _connection.OpenAsync();
                var query = $"UPDATE employee_info SET `{column}` = @Text WHERE `RowNo` = @Row";
                using var command = new MySqlCommand(query, _connection);
                command.Parameters.AddWithValue("@Text", text);
                command.Parameters.AddWithValue("@Row", row);

                await command.ExecuteNonQueryAsync();
                return Ok(new { Status = true, Message = "Value Updated Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }

        }


        [HttpPost]
        [Route("findandreplace")]
        public async Task<IActionResult> FindandReplace([FromBody] FindAndReplace request)
        {
            if (string.IsNullOrEmpty(request.findText) || string.IsNullOrEmpty(request.replaceText))
            {
                return BadRequest("Invalid parameters.");
            }

            var tableName = "employee_info";
            var databaseName = "database1";

            try
            {
                await _connection.OpenAsync();

                var columnsQuery = @"
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = @TableName 
        AND TABLE_SCHEMA = @DatabaseName 
        AND DATA_TYPE IN ('varchar', 'char', 'text', 'nvarchar', 'nchar', 'ntext')";

                var columns = await _connection.QueryAsync<string>(columnsQuery, new { TableName = tableName, DatabaseName = databaseName });
                if (!columns.Any())
                {
                    return NotFound("No columns found for the specified table.");
                }

                double noOfRowsAffected = 0;

                foreach (var column in columns)
                {
                    var selectQuery = $@"SELECT COUNT(*) FROM `{tableName}` WHERE `{column}` LIKE @FindText";
                    using (var command = new MySqlCommand(selectQuery, _connection))
                    {
                        command.Parameters.AddWithValue("@FindText", "%" + request.findText + "%");
                        var count = (long)await command.ExecuteScalarAsync();
                        noOfRowsAffected += count;
                    }
                }

                foreach (var column in columns)
                {
                    var query = $"UPDATE `{tableName}` SET `{column}` = REPLACE(`{column}`, @FindText, @ReplaceText)  WHERE `{column}` LIKE CONCAT('%', @FindText, '%')";
                    using (var command = new MySqlCommand(query, _connection))
                    {
                        command.Parameters.AddWithValue("@FindText", request.findText);
                        command.Parameters.AddWithValue("@ReplaceText", request.replaceText);
                        await command.ExecuteNonQueryAsync();
                    }
                }
                return Ok(new { Status = true, noOfRowsAffected });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        [HttpPost]
        [Route("pastedata")]
        public async Task<IActionResult> PasteData([FromBody] PasteData request)
        {
            // string[] rowsOfText = request.copiedText.Split(new[] { "\r\n" }, StringSplitOptions.None);
            var rowsOfText = request.copiedText.Split('\n');
            int numberOfRows = rowsOfText.Length - 1;
            int numberOfCols = rowsOfText[0].Split('\t').Length;

            var tableName = "employee_info";
            try
            {
                await _connection.OpenAsync();
                int rowIndex = 0;
                for (int row = request.startRow; row < request.startRow + numberOfRows; row++)
                {
                    string[] cells = rowsOfText[rowIndex].Split('\t');
                    rowIndex++;
                    int colIndex = 0;
                    for (int col = request.startCol; col < request.startCol + numberOfCols; col++)
                    {
                        char character = (char)('A' + col);
                        var query = $"UPDATE employee_info SET `{character.ToString()}` = @Text WHERE `RowNo` = @Row";
                        using var command = new MySqlCommand(query, _connection);
                        command.Parameters.AddWithValue("@Text", cells[colIndex]);
                        command.Parameters.AddWithValue("@Row", row);
                        await command.ExecuteNonQueryAsync();
                        colIndex++;
                    }
                }
                return Ok(new { Status = true, Message = $"Data Pasted Successfully" });
            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }


        [HttpPost]
        [Route("deletedata")]
        public async Task<IActionResult> DeleteData(int startRow, int endRow, char startCol, char endCol)
        {
            var tableName = "employee_info";
            try
            {
                await _connection.OpenAsync();

                var setClauseBuilder = new StringBuilder();
                for (char i = startCol; i <= endCol; i++)
                {
                    setClauseBuilder.Append($"`{i}` = '', ");
                }

                var setClause = setClauseBuilder.ToString(0, setClauseBuilder.Length - 2);


                var query = $"UPDATE `{tableName}` SET {setClause} WHERE `RowNo` BETWEEN @StartRow AND @EndRow";

                using (var command = new MySqlCommand(query, _connection))
                {
                    command.Parameters.AddWithValue("@StartRow", startRow);
                    command.Parameters.AddWithValue("@EndRow", endRow);

                    await command.ExecuteNonQueryAsync();
                }
                return Ok(new { Status = true, Message = $"Data Deleted Successfully" });

            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }


        [HttpPost]
        [Route("deleterow")]
        public async Task<IActionResult> DeleteRow(int startRow, int endRow)
        {
            var tableName = "employee_info";
            try
            {
                await _connection.OpenAsync();
                var query = $"DELETE FROM `{tableName}` WHERE `RowNo` BETWEEN @StartRow AND @EndRow";

                using (var command = new MySqlCommand(query, _connection))
                {
                    command.Parameters.AddWithValue("@StartRow", startRow);
                    command.Parameters.AddWithValue("@EndRow", endRow);
                    await command.ExecuteNonQueryAsync();
                }

                int rowsDeleted = endRow - startRow + 1;
                var updateQuery = $"UPDATE `{tableName}` SET `RowNo` = `RowNo` - @RowsDeleted WHERE `RowNo` > @EndRow";
                using (var updateCommand = new MySqlCommand(updateQuery, _connection))
                {
                    updateCommand.Parameters.AddWithValue("@RowsDeleted", rowsDeleted);
                    updateCommand.Parameters.AddWithValue("@EndRow", endRow);
                    await updateCommand.ExecuteNonQueryAsync();
                }

                return Ok(new { Status = true, Message = "Rows deleted and RowNo updated successfully." });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }


        }


        [HttpPost]
        [Route("addrowabove")]
        public async Task<IActionResult> AddRowAbove(int startRow, int endRow)
        {
            var tableName = "employee_info";
            try
            {
                await _connection.OpenAsync();
                int numberOfRows = endRow - startRow + 1;
                var query = $"UPDATE `{tableName}` SET `RowNo` = `RowNo` + @NumberOfRows WHERE `RowNo` >= @StartRow";

                using (var command = new MySqlCommand(query, _connection))
                {
                    command.Parameters.AddWithValue("@StartRow", startRow);
                    command.Parameters.AddWithValue("@NumberOfRows", numberOfRows);
                    await command.ExecuteNonQueryAsync();
                }

                var insertQuery = $"INSERT INTO `{tableName}` (`RowNo`) VALUES (@RowNo)";
                for (int i = 0; i < numberOfRows; i++)
                {
                    using (var insertCommand = new MySqlCommand(insertQuery, _connection))
                    {

                        insertCommand.Parameters.AddWithValue("@RowNo", startRow + i);
                        await insertCommand.ExecuteNonQueryAsync();
                    }
                }
                return Ok(new { Status = true, Message = "Rows added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }

        }


        [HttpPost]
        [Route("InsertRow")]
        public async Task<IActionResult> InsertRow(int startRow)
        {
            var tableName = "employee_info";
            try
            {
                await _connection.OpenAsync();

                var checkQuery = $"SELECT COUNT(1) FROM `{tableName}` WHERE `RowNo` = @RowNo";
                using (var checkCommand = new MySqlCommand(checkQuery, _connection))
                {
                    checkCommand.Parameters.AddWithValue("@RowNo", startRow);
                    var exists = (long)await checkCommand.ExecuteScalarAsync() > 0;

                    if (exists)
                    {
                        return Conflict(new { Status = false, Message = "Row already exists." });
                    }
                }

                var insertQuery = $"INSERT INTO `{tableName}` (`RowNo`) VALUES (@RowNo)";
                using (var insertCommand = new MySqlCommand(insertQuery, _connection))
                {
                    insertCommand.Parameters.AddWithValue("@RowNo", startRow);
                    await insertCommand.ExecuteNonQueryAsync();
                }
                return Ok(new { Status = true, Message = "Row inserted successfully." });

            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }

        }


        [HttpPost]
        [Route("findvalue")]
        public async Task<IActionResult> FindValue([FromBody] FindTextRequest request)
        {
            if (string.IsNullOrEmpty(request.findText))
            {
                return BadRequest("Invalid parameters.");
            }

            var tableName = "employee_info";
            var databaseName = "database1";

            var updateStatements = new List<string>();
            try
            {
                await _connection.OpenAsync();
                var columnsQuery = @" SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @TableName AND TABLE_SCHEMA = @DatabaseName 
                                    AND DATA_TYPE IN ('varchar', 'char', 'text', 'nvarchar', 'nchar', 'ntext')";

                var columns = await _connection.QueryAsync<string>(columnsQuery, new { TableName = tableName, DatabaseName = databaseName });
                if (columns.Any())
                {
                    var foundResults = new List<dynamic>();
                    foreach (var column in columns)
                    {
                        var selectQuery = $@"SELECT * FROM `{tableName}` WHERE `{column}` LIKE @FindText ORDER BY `rowNo`";
                        using (var command = new MySqlCommand(selectQuery, _connection))
                        {
                            command.Parameters.AddWithValue("@FindText", "%" + request.findText + "%");
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    var rowNo = reader["RowNo"].ToString();
                                    var value = reader[column].ToString();

                                    foundResults.Add(new
                                    {
                                        RowNo = rowNo,
                                        ColumnName = column,
                                        Value = value
                                    });
                                }
                            }
                        }
                    }
                    return Ok(new { Status = true, Result = foundResults });
                }
                else
                {
                    return NotFound(new { Status = false, Message = "No columns found for the specified table." });
                }
            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
            finally
            {
                await _connection.CloseAsync();
            }


        }


    }
}




public class FindTextRequest
{
    public string findText { get; set; }
}

public class FindAndReplace
{
    public string findText { get; set; }
    public string replaceText { get; set; }
}

public class PasteData
{
    public int startRow { get; set; }
    public int startCol { get; set; }
    public string copiedText { get; set; }
}