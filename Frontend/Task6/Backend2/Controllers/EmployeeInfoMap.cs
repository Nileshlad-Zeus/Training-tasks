using CsvHelper.Configuration;

namespace Backend2.Models;
public sealed class EmployeeInfoMap : ClassMap<EmployeeInfo>
{
    public EmployeeInfoMap()
    {
        Map(m => m.EmailId).Name("email_id");
        Map(m => m.Name).Name("name");
        Map(m => m.Country).Name("country");
        Map(m => m.State).Name("state");
        Map(m => m.City).Name("city");
        Map(m => m.TelephoneNumber).Name("telephone_number");
        Map(m => m.AddressLine1).Name("address_line_1");
        Map(m => m.AddressLine2).Name("address_line_2");
        Map(m => m.DateOfBirth).Name("date_of_birth");
        Map(m => m.GrossSalary201920).Name("gross_salary_FY2019_20");
        Map(m => m.GrossSalary202021).Name("gross_salary_FY2020_21");
        Map(m => m.GrossSalary202122).Name("gross_salary_FY2021_22");
        Map(m => m.GrossSalary202223).Name("gross_salary_FY2022_23");
        Map(m => m.GrossSalary202324).Name("gross_salary_FY2023_24");
    }
}
