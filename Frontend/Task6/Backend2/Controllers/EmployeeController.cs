using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Dapper;

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
            Console.WriteLine(exactpath);

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


            for (int i = 0; i < lines.Count; i += chunkSize)
            {
                var chunk = lines.Skip(i).Take(chunkSize).ToList();
                string combinedMessage = string.Join("\n", chunk);
                _rabbitMQService.PublishMessage(combinedMessage);
            }

            return Ok("Messages have been published in chunks.");
        }


        [HttpPost]
        [Route("findandreplace")]
        public async Task<IActionResult> FindandReplace()
        {
            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = $"UPDATE employee_info SET ";
            var e1 = await connection.QueryAsync(query);
            return Ok(e1);
        }



    }
}