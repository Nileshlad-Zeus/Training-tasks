using System;
using System.Text.Json.Serialization;

namespace Backend2.Models
{
    public partial class EmployeeInfoCsv
    {
        public string email_id { get; set; } = null!;

        public string? name { get; set; }

        public string? country { get; set; }

        public string? state { get; set; }

        public string? city { get; set; }

        public string? telephone_number { get; set; }

        public string? address_line_1 { get; set; }

        public string? address_line_2 { get; set; }

        public string? date_of_birth { get; set; }

        public string? gross_salary_2019_20 { get; set; }

        public string? gross_salary_2020_21 { get; set; }

        public string? gross_salary_2021_22 { get; set; }

        public string? gross_salary_2022_23 { get; set; }

        public string? gross_salary_2023_24 { get; set; }
    }
}
