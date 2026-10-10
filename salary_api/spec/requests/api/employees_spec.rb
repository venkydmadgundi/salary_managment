require "rails_helper"

RSpec.describe "Api::Employees", type: :request do
  let(:employee_attributes) do
    {
      name: "Ada Lovelace",
      email: "ada@example.com",
      country: "US",
      department: "Engineering",
      job_title: "Engineer",
      join_date: "2024-01-15",
      employment_status: "active",
      salary: 120_000
    }
  end

  describe "GET /api/employees" do
    it "returns employee data and pagination metadata" do
      12.times do |index|
        Employee.create!(employee_attributes.merge(
          name: "Employee #{index.to_s.rjust(2, "0")}",
          email: "employee#{index}@example.com"
        ))
      end

      get "/api/employees"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.fetch("data").length).to eq(EmployeeFilter::PER_PAGE)
      expect(response.parsed_body).to eq(
        "data" => Employee.kept.sorted("name", "asc").limit(EmployeeFilter::PER_PAGE).map(&:as_api_json).map(&:stringify_keys),
        "meta" => {
          "page" => 1,
          "per_page" => EmployeeFilter::PER_PAGE,
          "total_count" => 12,
          "total_pages" => 2
        }
      )
    end

    it "filters by search text, country, department, status, and salary range" do
      matching_employee = Employee.create!(employee_attributes.merge(salary: 125_000))
      Employee.create!(employee_attributes.merge(
        name: "Grace Hopper",
        email: "grace@example.com",
        salary: 175_000
      ))
      Employee.create!(employee_attributes.merge(
        country: "DE",
        email: "ada.de@example.com"
      ))
      Employee.create!(employee_attributes.merge(
        department: "Marketing",
        email: "ada.marketing@example.com"
      ))
      Employee.create!(employee_attributes.merge(
        employment_status: "on_leave",
        email: "ada.leave@example.com"
      ))
      Employee.create!(employee_attributes.merge(
        discarded_at: Time.current,
        email: "ada.discarded@example.com"
      ))

      get "/api/employees", params: {
        q: "Ada",
        country: "US",
        department: "Engineering",
        status: "active",
        min_salary: "120000",
        max_salary: "130000"
      }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.fetch("data").pluck("id")).to eq([ matching_employee.id ])
    end

    it "sorts employees using the requested column and direction" do
      Employee.create!(employee_attributes.merge(
        name: "Grace Hopper",
        email: "grace@example.com",
        salary: 175_000
      ))
      Employee.create!(employee_attributes.merge(
        name: "Katherine Johnson",
        email: "katherine@example.com",
        salary: 150_000
      ))

      get "/api/employees", params: { sort: "salary:desc" }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.fetch("data").pluck("name")).to eq(
        [ "Grace Hopper", "Katherine Johnson" ]
      )
    end

    it "applies the requested page offset" do
      12.times do |index|
        Employee.create!(employee_attributes.merge(
          name: "Employee #{index.to_s.rjust(2, "0")}",
          email: "employee#{index}@example.com"
        ))
      end

      get "/api/employees", params: { page: 2 }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("meta", "page")).to eq(2)
      expect(response.parsed_body.fetch("data").pluck("name")).to eq([ "Employee 10", "Employee 11" ])
    end

    it "uses page one when the requested page is not positive" do
      2.times do |index|
        Employee.create!(employee_attributes.merge(
          name: "Employee #{index}",
          email: "employee#{index}@example.com"
        ))
      end

      get "/api/employees", params: { page: 0 }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("meta", "page")).to eq(1)
      expect(response.parsed_body.fetch("data").pluck("name")).to eq([ "Employee 0", "Employee 1" ])
    end
  end

  describe "GET /api/employees/:id" do
    let!(:employee) { Employee.create!(employee_attributes) }

    it "returns the requested employee" do
      get "/api/employees/#{employee.id}"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include(
        "id" => employee.id,
        "name" => "Ada Lovelace",
        "email" => "ada@example.com",
      )
    end

    it "returns not found for a missing employee" do
      get "/api/employees/0"

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "not_found")
    end
  end

  describe "POST /api/employees" do
    it "creates an employee and returns its location" do
      expect do
        post "/api/employees", params: { employee: employee_attributes }
      end.to change(Employee, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.headers["Location"]).to end_with("/api/employees/#{Employee.last.id}")
      expect(response.parsed_body).to include(
        "name" => "Ada Lovelace",
        "employment_status" => "active",
      )
    end

    it "returns validation errors for invalid employee data" do
      post "/api/employees", params: {
        employee: employee_attributes.merge(name: "")
      }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body).to include("name")
    end

    it "does not allow clients to set the soft-delete timestamp" do
      post "/api/employees", params: {
        employee: employee_attributes.merge(discarded_at: Time.current)
      }

      expect(response).to have_http_status(:created)
      expect(Employee.last).to be_kept
    end
  end

  describe "PATCH /api/employees/:id" do
    let!(:employee) { Employee.create!(employee_attributes) }

    it "updates the employee" do
      patch "/api/employees/#{employee.id}", params: {
        employee: { department: "Research" }
      }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include("department" => "Research")
      expect(employee.reload.department).to eq("Research")
    end

    it "returns validation errors when the update is invalid" do
      patch "/api/employees/#{employee.id}", params: {
        employee: { email: "not-an-email" }
      }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body).to include("email")
      expect(employee.reload.email).to eq("ada@example.com")
    end

    it "returns not found for a missing employee" do
      patch "/api/employees/0", params: { employee: { department: "Research" } }

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/employees/:id" do
    let!(:employee) { Employee.create!(employee_attributes) }

    it "soft-deletes the employee" do
      expect do
        delete "/api/employees/#{employee.id}"
      end.to change { employee.reload.discarded? }.from(false).to(true)

      expect(response).to have_http_status(:no_content)
      expect(Employee.kept).not_to include(employee)
    end

    it "returns not found for an already discarded employee" do
      employee.discard!

      delete "/api/employees/#{employee.id}"

      expect(response).to have_http_status(:not_found)
    end
  end
end
