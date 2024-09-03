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
                    { "TotalChunks", (int)totalChunk }
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
                var result = await _employeeCollection.Find(filter).Sort(sort).Skip(offset).Limit(100).ToListAsync();

                var formattedResult = result.Select(doc => doc.ToDictionary(
                     element => element.Name,
                     element => element.Value.ToString()
                 )).ToList();

                return Ok(formattedResult);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}