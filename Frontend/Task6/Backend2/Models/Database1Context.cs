using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace Backend2.Models;

public partial class Database1Context : DbContext
{
    public Database1Context()
    {
    }

    public Database1Context(DbContextOptions<Database1Context> options)
        : base(options)
    {
    }

    public virtual DbSet<EmployeeInfo> EmployeeInfos { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySql("server=localhost;database=database1;uid=root;pwd=bAKU@#0919", Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.37-mysql"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<EmployeeInfo>(entity =>
        {
            entity.HasKey(e => e.EmailId).HasName("PRIMARY");

            entity.ToTable("employee_info");

            entity.Property(e => e.EmailId).HasColumnName("email_id");
            entity.Property(e => e.AddressLine1)
                .HasMaxLength(255)
                .HasColumnName("address_line_1");
            entity.Property(e => e.AddressLine2)
                .HasMaxLength(255)
                .HasColumnName("address_line_2");
            entity.Property(e => e.City)
                .HasMaxLength(255)
                .HasColumnName("city");
            entity.Property(e => e.Country)
                .HasMaxLength(255)
                .HasColumnName("country");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.GrossSalary201920)
                .HasPrecision(10, 2)
                .HasColumnName("gross_salary_2019_20");
            entity.Property(e => e.GrossSalary202021)
                .HasPrecision(10, 2)
                .HasColumnName("gross_salary_2020_21");
            entity.Property(e => e.GrossSalary202122)
                .HasPrecision(10, 2)
                .HasColumnName("gross_salary_2021_22");
            entity.Property(e => e.GrossSalary202223)
                .HasPrecision(10, 2)
                .HasColumnName("gross_salary_2022_23");
            entity.Property(e => e.GrossSalary202324)
                .HasPrecision(10, 2)
                .HasColumnName("gross_salary_2023_24");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.State)
                .HasMaxLength(255)
                .HasColumnName("state");
            entity.Property(e => e.TelephoneNumber)
                .HasMaxLength(20)
                .HasColumnName("telephone_number");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
