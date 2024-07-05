//----------------Array----------------
// string[] str1 = new string[3];
// str1[0]="Nilesh";
// str1[1]="Lad";
// str1[2]="09/10/2002";
// foreach(string str in str1){
//     Console.WriteLine(str);
// }

// string[] str2 = {"Nilesh","Ramesh","Lad"};
// foreach(string str in str2){
//     Console.WriteLine(str);
// }



//----------------Scope----------------
// bool flag = true;
// int value;

// if (true)
// {
//     value = 10;
//     Console.WriteLine($"Inside the code block: {value}");
// }

// Console.WriteLine($"Outside the code block: {value}");



//----------------Switch----------------\
string sku = "01-MN-L";

string[] product = sku.Split('-');

foreach(string productItem in product){
    Console.WriteLine(productItem);
}