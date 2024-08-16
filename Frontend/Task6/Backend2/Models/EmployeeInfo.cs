using System;
using System.Collections.Generic;

namespace Backend2.Models;

public partial class EmployeeInfo
{
    public string EmailId { get; set; } = null!;

    public string? Name { get; set; }

    public string? Country { get; set; }

    public string? State { get; set; }

    public string? City { get; set; }

    public string? TelephoneNumber { get; set; }

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public decimal? GrossSalary201920 { get; set; }

    public decimal? GrossSalary202021 { get; set; }

    public decimal? GrossSalary202122 { get; set; }

    public decimal? GrossSalary202223 { get; set; }

    public decimal? GrossSalary202324 { get; set; }
}
