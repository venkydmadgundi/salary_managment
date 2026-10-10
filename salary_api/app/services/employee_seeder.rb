class EmployeeSeeder
  PROFILES = {
    "US" => { range: 70_000..220_000 },
    "DE" => { range: 55_000..150_000 },
    "GB" => { range: 45_000..140_000 },
    "CH" => { range: 80_000..200_000 },
    "IN" => { range: 800_000..5_000_000 },
    "NG" => { range: 3_000_000..25_000_000 },
    "BR" => { range: 60_000..300_000 },
    "SG" => { range: 60_000..180_000 },
  }.freeze

  DEPARTMENTS = %w[Engineering Product Design Sales Marketing HR Finance Operations].freeze
  TITLES = {
    "Engineering" => %w[Engineer Senior\ Engineer Staff\ Engineer Engineering\ Manager],
    "Product"     => %w[PM Senior\ PM Group\ PM],
    "Design"      => %w[Designer Senior\ Designer Design\ Lead],
    "Sales"       => %w[AE Senior\ AE Sales\ Manager],
    "Marketing"   => %w[Marketer Marketing\ Manager],
    "HR"          => %w[HR\ Generalist HR\ Manager],
    "Finance"     => %w[Analyst Finance\ Manager],
    "Operations"  => %w[Ops\ Analyst Ops\ Manager],
  }.freeze

  def initialize(count: 10_000)
    @count = count
  end

  def call
    backfill_missing_salaries
    return if Employee.count >= @count

    faker_unique = {}
    now = Time.current
    rows = []

    @count.times do |i|
      country = PROFILES.keys.sample(random: rng)
      profile = PROFILES[country]
      department = DEPARTMENTS.sample(random: rng)
      title = TITLES[department].sample(random: rng)
      first_name = Faker::Name.first_name
      last_name = Faker::Name.last_name
      name = first_name + last_name
      email = "#{first_name.downcase}.#{last_name.downcase}.#{i}@acme.example"

      rows << {
        name: name,
        email: email,
        country: country,
        department: department,
        job_title: title,
        join_date: Faker::Date.between(from: 12.years.ago, to: Date.current),
        employment_status: weighted_status,
        salary: rng.rand(profile[:range]),
        created_at: now,
        updated_at: now,
      }

      if rows.size >= 500
        Employee.insert_all(rows)
        rows.clear
      end
    end

    Employee.insert_all(rows) unless rows.empty?
  end

  private

  def backfill_missing_salaries
    Employee.where(salary: nil, country: PROFILES.keys).find_each do |employee|
      employee.update_columns(
        salary: rng.rand(PROFILES.fetch(employee.country)[:range]),
        updated_at: Time.current
      )
    end
  end

  def rng
    @rng ||= Random.new(42)   # deterministic seed -> reproducible data
  end

  def weighted_status
    case rng.rand(100)
    when 0..89 then Employee.employment_statuses[:active]
    when 90..96 then Employee.employment_statuses[:on_leave]
    else Employee.employment_statuses[:terminated]
    end
  end
end