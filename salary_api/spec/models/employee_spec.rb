require "rails_helper"

RSpec.describe Employee, type: :model do
  let(:attributes) do
    {
      name: "Ada Lovelace",
      email: "ada@example.com",
      country: "US",
      department: "Engineering",
      job_title: "Engineer",
      join_date: Date.new(2024, 1, 15),
      employment_status: "active",
      salary: 120_000
    }
  end

  describe "validations" do
    it "is valid with all required attributes" do
      expect(described_class.new(attributes)).to be_valid
    end

    %i[name email country department job_title join_date employment_status salary].each do |attribute|
      it "requires #{attribute}" do
        employee = described_class.new(attributes.merge(attribute => nil))

        expect(employee).not_to be_valid
        expect(employee.errors[attribute]).to be_present
      end
    end

    it "requires a valid email address" do
      employee = described_class.new(attributes.merge(email: "invalid-email"))

      expect(employee).not_to be_valid
      expect(employee.errors[:email]).to be_present
    end

    it "requires email addresses to be unique without regard to case" do
      described_class.create!(attributes)
      employee = described_class.new(attributes.merge(email: "ADA@example.com"))

      expect(employee).not_to be_valid
      expect(employee.errors[:email]).to be_present
    end

    it "requires a two-character country code" do
      employee = described_class.new(attributes.merge(country: "USA"))

      expect(employee).not_to be_valid
      expect(employee.errors[:country]).to be_present
    end

    it "rejects a negative salary" do
      employee = described_class.new(attributes.merge(salary: -1))

      expect(employee).not_to be_valid
      expect(employee.errors[:salary]).to be_present
    end

    it "rejects an unknown employment status" do
      employee = described_class.new(attributes.merge(employment_status: "sabbatical"))

      expect(employee).not_to be_valid
      expect(employee.errors[:employment_status]).to be_present
    end
  end

  describe "employment status enum" do
    it "provides the supported statuses" do
      expect(described_class.employment_statuses).to eq(
        "active" => "active",
        "on_leave" => "on_leave",
        "terminated" => "terminated",
      )
    end
  end

  describe "scopes" do
    it "sorts by name in ascending or descending order" do
      bob = described_class.create!(attributes.merge(name: "Bob Smith", email: "bob@example.com"))
      ada = described_class.create!(attributes)

      expect(described_class.sorted("name", "asc")).to eq([ ada, bob ])
      expect(described_class.sorted("name", "desc")).to eq([ bob, ada ])
    end

    it "falls back to sorting by name for an unsupported key" do
      bob = described_class.create!(attributes.merge(name: "Bob Smith", email: "bob@example.com"))
      ada = described_class.create!(attributes)

      expect(described_class.sorted("unknown", "asc")).to eq([ ada, bob ])
    end

    it "includes a discarded employee only in the discarded scope" do
      employee = described_class.create!(attributes)

      employee.discard!

      expect(described_class.kept).not_to include(employee)
      expect(described_class.discarded).to include(employee)
    end
  end

  describe "#as_api_json" do
    it "returns the public employee fields in API format" do
      employee = described_class.create!(attributes)

      expect(employee.as_api_json).to eq(
        id: employee.id,
        name: "Ada Lovelace",
        email: "ada@example.com",
        country: "US",
        department: "Engineering",
        job_title: "Engineer",
        join_date: "2024-01-15",
        employment_status: "active",
      )
    end
  end
end
