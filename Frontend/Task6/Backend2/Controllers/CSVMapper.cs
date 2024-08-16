using CsvHelper.Configuration;

using Backend2.Models;

public class EmployeeInfoMap : ClassMap<EmployeeInfo>
{
    public EmployeeInfoMap()
    {
        Map(m => m.Email_Id).Name("email_id");
        Map(m => m.Name).Name("name");
        Map(m => m.Country).Name("country");
        Map(m => m.State).Name("state");
        Map(m => m.City).Name("city");
        Map(m => m.Telephone_Number).Name("telephone_number");
        Map(m => m.Address_Line_1).Name("address_line_1");
        Map(m => m.Address_Line_2).Name("address_line_2");
        Map(m => m.Date_Of_Birth).Name("date_of_birth");
        Map(m => m.Gross_Salary_2019_20).Name("gross_salary_2019_20");
        Map(m => m.Gross_Salary_2020_21).Name("gross_salary_2020_21");
        Map(m => m.Gross_Salary_2021_22).Name("gross_salary_2021_22");
        Map(m => m.Gross_Salary_2022_23).Name("gross_salary_2022_23");
        Map(m => m.Gross_Salary_2023_24).Name("gross_salary_2023_24");
    }
}
