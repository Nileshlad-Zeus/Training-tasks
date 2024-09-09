using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Text;

using Backend2.Models;


namespace Backend2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeController : ControllerBase
    {

        private const int chunkSize = 500;
        private readonly IMongoCollection<BsonDocument> _employeeCollection;
        private readonly IMongoCollection<BsonDocument> _progressCollection;
        private readonly RabbitMQService _rabbitMQService;

        public EmployeeController(RabbitMQService rabbitMQService, IMongoDatabase database)
        {
            _employeeCollection = database.GetCollection<BsonDocument>("excel_data");
            _progressCollection = database.GetCollection<BsonDocument>("progress");
            _rabbitMQService = rabbitMQService;
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
                var exactpath = Path.Combine(filePath, fileName);

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

                var totalChunk = Math.Ceiling((decimal)lines.Count / chunkSize);
                var progress = new BsonDocument
                {
                    { "totalchunks", (int)totalChunk }
                };
                await _progressCollection.InsertOneAsync(progress);

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
                Console.WriteLine(ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Status = false,
                    Message = "An unexpected error occurred"
                });
            }
        }


        [HttpGet]
        public async Task<IActionResult> Get(int offset)
        {
            try
            {
                var filter = new BsonDocument();
                var sort = Builders<BsonDocument>.Sort.Ascending("RowNo");
                var resultTemp = await _employeeCollection.Find(filter).Sort(sort).Skip(offset).Limit(100).ToListAsync();

                var result = resultTemp.Select(doc => doc.ToDictionary(
                     element => element.Name,
                     element => element.Value.ToString()
                 )).ToList();

                return Ok(new { Status = true, result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [Route("GetProgress")]
        public async Task<IActionResult> GetProgress()
        {
            try
            {
                var filter = new BsonDocument();
                var resultTemp = await _progressCollection.Find(filter).ToListAsync();
                var result = resultTemp.Select(doc => doc.ToDictionary(
                  element => element.Name,
                  element => element.Value.ToString()
              )).ToList();

                return Ok(new { Status = true, result });
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
        }

        [HttpPost]
        [Route("updatevalue")]
        public async Task<IActionResult> Updatevalue([FromBody] UpdateData request)
        {
            if (string.IsNullOrEmpty(request.column) || string.IsNullOrEmpty(request.text))
            {
                return BadRequest(new { Status = false, Message = "Invalid parameters." });
            }

            if (request.column.Contains("`") || request.column.Contains("'") || request.column.Contains(";"))
            {
                return BadRequest(new { Status = false, Message = "Invalid column name." });
            }

            try
            {
                var filter = Builders<BsonDocument>.Filter.Eq("RowNo", request.row);
                var update = Builders<BsonDocument>.Update.Set(request.column, request.text);
                var result = _employeeCollection.UpdateOne(filter, update);
                return Ok(new { Status = true, Message = "Value Updated Successfully" });
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
        }


        [HttpPost]
        [Route("findandreplace")]
        public async Task<IActionResult> FindandReplace([FromBody] FindAndReplace request)
        {
            if (string.IsNullOrEmpty(request.findText) || string.IsNullOrEmpty(request.replaceText))
            {
                return BadRequest("Invalid parameters.");
            }
            try
            {
                var columns = await _employeeCollection.Find(new BsonDocument()).Limit(1).FirstOrDefaultAsync();
                if (columns == null)
                {
                    return NotFound("No columns found for the specified table.");
                }
                var textColumns = columns.Names
                .Where(name => columns[name].IsString)
                .ToList();

                if (!textColumns.Any())
                {
                    return NotFound("No text columns found for the specified collection.");
                }
                double noOfRowsAffected = 0;
                foreach (var column in textColumns)
                {
                    var filter = Builders<BsonDocument>.Filter.Regex(column, new BsonRegularExpression(request.findText, "i"));
                    var documents = await _employeeCollection.Find(filter).ToListAsync();
                    foreach (var document in documents)
                    {

                        noOfRowsAffected++;
                        var update = Builders<BsonDocument>.Update.Set(column, request.replaceText);
                        await _employeeCollection.UpdateOneAsync(Builders<BsonDocument>.Filter.Eq("_id", document["_id"]), update);
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

        }



        [HttpPost]
        [Route("pastedata")]
        public async Task<IActionResult> PasteData([FromBody] PasteData request)
        {
            var rowsOfText = request.CopiedText.Split('\n');
            int numberOfRows = rowsOfText.Length - 1;
            int numberOfCols = rowsOfText[0].Split('\t').Length;

            try
            {
                int rowIndex = 0;
                for (int row = request.startRow; row < request.startRow + numberOfRows; row++)
                {
                    string[] cells = rowsOfText[rowIndex].Split('\t');
                    rowIndex++;

                    var filter = Builders<BsonDocument>.Filter.Eq("RowNo", row);
                    var updateDefinitionBuilder = Builders<BsonDocument>.Update;
                    var updateDefinitions = new List<UpdateDefinition<BsonDocument>>();
                    int colIndex = 0;
                    for (int col = request.startCol; col < request.startCol + numberOfCols; col++)
                    {
                        char character = (char)('A' + col);
                        updateDefinitions.Add(updateDefinitionBuilder.Set(character.ToString(), cells[colIndex]));
                        colIndex++;
                    }

                    var updateDefinition = updateDefinitionBuilder.Combine(updateDefinitions);
                    await _employeeCollection.UpdateOneAsync(filter, updateDefinition);
                }
                return Ok(new { Status = true, Message = $"Data Pasted Successfully" });
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
        }






    }
}


public class FindAndReplace
{
    public string findText { get; set; }
    public string replaceText { get; set; }
}

public class UpdateData
{
    public string column { get; set; }
    public int row { get; set; }
    public string text { get; set; }
}

public class PasteData
{
    public int startRow { get; set; }
    public int startCol { get; set; }
    public string CopiedText { get; set; }
}