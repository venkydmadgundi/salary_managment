require "rails_helper"

RSpec.describe EmployeeSeeder do
  it "assigns salaries when creating employees" do
    described_class.new(count: 1).call

    employee = Employee.first
    expect(employee.salary).to be_between(
      described_class::PROFILES.fetch(employee.country)[:range].begin,
      described_class::PROFILES.fetch(employee.country)[:range].end
    )
  end

  it "backfills salaries for existing employees before returning" do
    employee = Employee.create!(
      name: "Ada Lovelace",
      email: "ada@example.com",
      country: "US",
      department: "Engineering",
      job_title: "Engineer",
      join_date: "2024-01-15",
      employment_status: "active",
      salary: 100_000
    )
    employee.update_column(:salary, nil)

    described_class.new(count: 1).call

    expect(employee.reload.salary).to be_between(70_000, 220_000)
  end
end
