using MySql.Data;
using MySql.Data.MySqlClient;


string? connetionString = null;
connetionString = "server=localhost;database=database1;uid=root;pwd=bAKU@#0919;";

using (MySqlConnection cn = new MySqlConnection(connetionString))
{
    try
    {
        string query = "INSERT INTO employee_info(email_id, name) VALUES (?email_id,?name);";
        cn.Open();
        using (MySqlCommand cmd = new MySqlCommand(query, cn))
        {
            cmd.Parameters.Add("?email_id", MySqlDbType.VarChar).Value = "nileshlad871@gmail.com";
            cmd.Parameters.Add("?name", MySqlDbType.VarChar).Value = "Nileshlad";
            cmd.ExecuteNonQuery();
        }
    }
    catch (MySqlException ex)
    {
        Console.WriteLine(ex.Message);
    }
}
