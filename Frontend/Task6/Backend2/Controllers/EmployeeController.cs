using Microsoft.AspNetCore.Mvc;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend2.Models;

namespace Backend2.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class EmployeeController : ControllerBase
{
    private const int ChunkSize = 10000;

    private readonly Database1Context _context;

    public EmployeeController(Database1Context context)
    {
        _context = context;
    }

    // [HttpGet]
    // public IEnumerable<EmployeeInfo> Get()
    // {
    //     //fetch all
    //     // return _context.EmployeeInfos.ToList();

    //     //fetch by email id
    //     return _context.EmployeeInfos.Where(auth=> auth.EmailId == "000qL32RpD@example.com").ToList();


    //     //add newData
    //     // EmployeeInfo employee = new EmployeeInfo();
    //     // employee.EmailId = "nilesh09@gmail.com";
    //     // _context.EmployeeInfos.Add(employee);
    //     // _context.SaveChanges();
    //     // return _context.EmployeeInfos.Where(auth => auth.EmailId == "nileshlad871@gmail.com").ToList();
    // }


    [HttpPost]
    public async Task<IActionResult> Post()
    {
        string csvFilePath = "C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/users.csv";

        if (!System.IO.File.Exists(csvFilePath))
        {
            return NotFound("CSV file not found.");
        }

        IEnumerable<EmployeeInfo> employees;
        using (var reader = new StreamReader(csvFilePath))
        using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            BadDataFound = null,
            HeaderValidated = null,
            MissingFieldFound = null
        }))
        {
            csv.Context.RegisterClassMap<EmployeeInfoMap>();
            employees = csv.GetRecords<EmployeeInfo>().ToList();
        }

        var chunks = employees
            .Select((employee, index) => new { employee, index })
            .GroupBy(x => x.index / ChunkSize)
            .Select(g => g.Select(x => x.employee).ToList())
            .ToList();

        Console.WriteLine($"Number of chunks possible: {chunks.Count}");

        var top10Chunks = chunks.Take(10).ToList();

        // for (int i = 0; i < chunks.Count; i++)
        // {
        //     Console.WriteLine($"Chunk {i + 1}:");
        //     foreach (var employee in top10Chunks[i])
        //     {
        //         Console.WriteLine($"{employee.Name}");
        //     }
        //     Console.WriteLine();
        // }

        // if (top10Chunks.Any())
        // {
        //     return Ok(top10Chunks);
        // }

        // return NotFound("No data found.");

        foreach (var chunk in chunks)
        {
            await InsertChunkIntoDatabase(chunk);
        }

        return Ok("Data inserted into the database.");
    }

    private async Task InsertChunkIntoDatabase(List<EmployeeInfo> chunk)
    {
        try
        {
            _context.EmployeeInfos.AddRange(chunk);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred while inserting data: {ex.Message}");
            throw;
        }
    }
}
