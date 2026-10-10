require "rails_helper"

RSpec.describe "Api::Stats", type: :request do
  it "returns salary and headcount summaries for kept employees" do
    Employee.create!(
      name: "Ada Lovelace",
      email: "ada@example.com",
      country: "US",
      department: "Engineering",
      job_title: "Engineer",
      join_date: "2024-01-15",
      employment_status: "active",
      salary: 100_000
    )
    Employee.create!(
      name: "Grace Hopper",
      email: "grace@example.com",
      country: "US",
      department: "Engineering",
      job_title: "Engineer",
      join_date: "2023-01-15",
      employment_status: "on_leave",
      salary: 200_000
    )
    Employee.create!(
      name: "Discarded Employee",
      email: "discarded@example.com",
      country: "DE",
      department: "Sales",
      job_title: "Sales Representative",
      join_date: "2022-01-15",
      employment_status: "active",
      salary: 300_000,
      discarded_at: Time.current
    )

    get "/api/stats"

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to include(
      "headcount" => 2,
      "active_headcount" => 1,
      "total_salary" => 300_000.0,
      "avg_salary" => 150_000.0,
      "median_salary" => 150_000.0
    )
    expect(response.parsed_body.fetch("by_country")).to eq(
      [
        {
          "country" => "US",
          "headcount" => 2,
          "avg_salary" => 150_000.0,
          "median_salary" => 150_000.0
        }
      ]
    )
    expect(response.parsed_body.fetch("salary_histogram").sum { |bucket| bucket.fetch("count") }).to eq(2)
  end

  it "returns zero salary summaries for groups with no salary values" do
    now = Time.current
    Employee.insert!({
      name: "No Salary",
      email: "no-salary@example.com",
      country: "US",
      department: "Engineering",
      job_title: "Engineer",
      join_date: "2024-01-15",
      employment_status: "active",
      salary: nil,
      created_at: now,
      updated_at: now
    })

    get "/api/stats"

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to include(
      "headcount" => 1,
      "active_headcount" => 1,
      "total_salary" => 0.0,
      "avg_salary" => 0.0,
      "median_salary" => 0.0,
      "by_country" => [
        {
          "country" => "US",
          "headcount" => 1,
          "avg_salary" => 0.0,
          "median_salary" => 0.0
        }
      ],
      "salary_histogram" => []
    )
  end
end
