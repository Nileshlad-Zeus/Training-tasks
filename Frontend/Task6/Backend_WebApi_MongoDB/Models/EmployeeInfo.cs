using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend2.Models
{
    public partial class EmployeeInfo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId  _id { get; set; }
        public string RowNo { get; set; }
        public string A { get; set; }
        public string? B { get; set; } 
        public string? C { get; set; } 
        public string? D { get; set; } 
        public string? E { get; set; } 
        public string? F { get; set; } 
        public string? G { get; set; } 
        public string? H { get; set; } 
        public string? I { get; set; } 
        public string? J { get; set; } 
        public string? K { get; set; } 
        public string? L { get; set; } 
        public string? M { get; set; } 
        public string? N { get; set; } 
    }
}
