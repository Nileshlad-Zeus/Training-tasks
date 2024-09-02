using System;
using System.Text.Json.Serialization;

namespace Backend2.Models
{
    public partial class EmployeeInfo
    {
        public string Email_Id { get; set; } = null!;

        public string? Name { get; set; }

        public string? Country { get; set; }

        public string? State { get; set; }

        public string? City { get; set; }

        public string? Telephone_Number { get; set; }

        public string? Address_Line_1 { get; set; }

        public string? Address_Line_2 { get; set; }

        public string? Date_Of_Birth { get; set; }

        public string? Gross_Salary_2019_20 { get; set; }

        public string? Gross_Salary_2020_21 { get; set; }

        public string? Gross_Salary_2021_22 { get; set; }

        public string? Gross_Salary_2022_23 { get; set; }

        public string? Gross_Salary_2023_24 { get; set; }
    }
}
