class Employee < ApplicationRecord
  include Discard::Model

  EMPLOYMENT_STATUSES = {
    active: 0,
    on_leave: 1,
    terminated: 2,
  }.freeze

  enum :employment_status, EMPLOYMENT_STATUSES, validate: true

  validates :full_name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :country, presence: true, length: { is: 2 }
  validates :department, :job_title, :join_date, presence: true
  validates :salary_cents, presence: true,
                           numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :currency, presence: true

  scope :sorted, ->(key, dir) {
    col = { "name" => "name",
            "country" => "country", "department" => "department",
            "employment_status" => "employment_status", "join_date" => "join_date" }
          .fetch(key.to_s, "name")
    d = dir.to_s.downcase == "desc" ? "desc" : "asc"
    order(Arel.sql("#{col} #{d}"))
  }

  def as_api_json
    {
      id: id,
      name: name,
      email: email,
      country: country,
      department: department,
      job_title: job_title,
      join_date: join_date.iso8601,
      employment_status: employment_status,
    }
  end





end
