using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;

using System.Text;
using System.Text.Json;

using RabbitMQ.Client;
using RabbitMQ.Client.Events;

using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using System.IO;
// using Newtonsoft.Json;

using Backend2.Models;

namespace Backend2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeController : ControllerBase
    {

        private const int ChunkSize = 10;

        private readonly string _connectionString;

        private readonly RabbitMQService _rabbitMQService;

        public EmployeeController(RabbitMQService rabbitMQService)
        {
            _connectionString = "server=localhost;database=database1;uid=root;pwd=bAKU@#0919;";
            _rabbitMQService = rabbitMQService;
        }





        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeInfo>>> Get()
        {
            var employees = new List<EmployeeInfo>();

            using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = "SELECT * FROM employee_info LIMIT 50";
            var e1 = await connection.QueryAsync<EmployeeInfo>(query);
            return Ok(e1);
        }

        [HttpPost]
        public async Task<IActionResult> Post()
        {


            string csvFilePath = "D:/Training-tasks/Frontend/Task6/Backend2/users.csv";
            if (!System.IO.File.Exists(csvFilePath))
            {
                return NotFound("CSV file not found.");
            }

            var lines = new List<string>();
            
            using (var reader = new StreamReader(csvFilePath))
            {
                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    lines.Add(line);
                }
            }

            int chunkSize = 500;
            for (int i = 0; i < lines.Count(); i += chunkSize)
            {
                var chunk = lines.Skip(i).Take(chunkSize).ToList();
                string combinedMessage = string.Join("\n", chunk);
                _rabbitMQService.PublishMessage(combinedMessage);
            }

            return Ok("Messages have been published in chunks.");










            // List<EmployeeInfoCsv> users = new List<EmployeeInfoCsv>();
            // using (var reader = new StreamReader(csvFilePath))
            // using (var csv = new CsvReader(reader, new CsvHelper.Configuration.CsvConfiguration(CultureInfo.InvariantCulture)))
            // {
            //     users = csv.GetRecords<EmployeeInfoCsv>().ToList();
            // }

            // var chunks = users.Select((employee, index) => new { employee, index })
            //                     .GroupBy(x => x.index / ChunkSize)
            //                     .Select(g => g.Select(x => x.employee).ToList())
            //                     .ToList();

            // Console.WriteLine($"Number of chunks possible: {chunks.Count}");
            // var result = chunks.Take(10).ToList();


            // for (var chunkId = 0; chunkId < chunks.Count; chunkId++)
            // {
            //     // var jsonChunk = JsonSerializer.Serialize(chunks[chunkId]); ;
            //     _rabbitMQService.PublishMessage(chunks[chunkId]);
            // }
            // return Ok(result);
        }
    }
}









// using Microsoft.AspNetCore.Mvc;
// using CsvHelper;
// using CsvHelper.Configuration;
// using System.Globalization;
// using System.IO;
// using System.Linq;
// using System.Collections.Generic;
// using System.Threading.Tasks;
// using Microsoft.EntityFrameworkCore;
// using System.Collections.Generic;
// using System.Threading.Tasks;

// using Backend2.Models;

// namespace Backend2.Controllers;

// [ApiController]
// [Route("/api/[controller]")]
// public class EmployeeController : ControllerBase
// {
//     private const int ChunkSize = 10000;

//     private readonly Database1Context _context;

//     public EmployeeController(Database1Context context)
//     {
//         _context = context;
//     }

//     [HttpGet]
//     public async Task<ActionResult<IEnumerable<EmployeeInfo>>> Get()
//     {
//         //fetch all
//         // return _context.EmployeeInfos.ToList();

//         //fetch by email id
//         // return _context.EmployeeInfos.Where(auth=> auth.EmailId == "000qL32RpD@example.com").ToList();
//     }


//     // [HttpPost]
//     // public async Task<IActionResult> Post()
//     // {
//     //     string csvFilePath = "C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/users.csv";

//     //     if (!System.IO.File.Exists(csvFilePath))
//     //     {
//     //         return NotFound("CSV file not found.");
//     //     }

//     //     IEnumerable<EmployeeInfo> employees;
//     //     using (var reader = new StreamReader(csvFilePath))
//     //     using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
//     //     {
//     //         BadDataFound = null,
//     //         HeaderValidated = null,
//     //         MissingFieldFound = null
//     //     }))
//     //     {
//     //         csv.Context.RegisterClassMap<EmployeeInfoMap>();
//     //         employees = csv.GetRecords<EmployeeInfo>().ToList();
//     //     }

//     //     var chunks = employees
//     //         .Select((employee, index) => new { employee, index })
//     //         .GroupBy(x => x.index / ChunkSize)
//     //         .Select(g => g.Select(x => x.employee).ToList())
//     //         .ToList();

//     //     Console.WriteLine($"Number of chunks possible: {chunks.Count}");

//     //     var top10Chunks = chunks.Take(10).ToList();

//     //     // for (int i = 0; i < chunks.Count; i++)
//     //     // {
//     //     //     Console.WriteLine($"Chunk {i + 1}:");
//     //     //     foreach (var employee in top10Chunks[i])
//     //     //     {
//     //     //         Console.WriteLine($"{employee.Name}");
//     //     //     }
//     //     //     Console.WriteLine();
//     //     // }

//     //     // if (top10Chunks.Any())
//     //     // {
//     //     //     return Ok(top10Chunks);
//     //     // }

//     //     // return NotFound("No data found.");

//     //     foreach (var chunk in chunks)
//     //     {
//     //         await InsertChunkIntoDatabase(chunk);
//     //     }

//     //     return Ok("Data inserted into the database.");
//     // }

//     // private async Task InsertChunkIntoDatabase(List<EmployeeInfo> chunk)
//     // {
//     //     try
//     //     {
//     //         _context.EmployeeInfos.AddRange(chunk);
//     //         await _context.SaveChangesAsync();
//     //     }
//     //     catch (Exception ex)
//     //     {
//     //         Console.WriteLine($"An error occurred while inserting data: {ex.Message}");
//     //         throw;
//     //     }
//     // }
// }



