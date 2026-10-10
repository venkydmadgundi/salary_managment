class Employee < ApplicationRecord
  include Discard::Model

  EMPLOYMENT_STATUSES = {
    active: "active",
    on_leave: "on_leave",
    terminated: "terminated"
  }.freeze

  enum :employment_status, EMPLOYMENT_STATUSES, validate: true

  validates :name, :country, :department, :job_title, :join_date, :employment_status, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :country, length: { is: 2 }
  validates :salary, presence: true, numericality: { greater_than_or_equal_to: 0 }

  scope :sorted, ->(key, dir) {
    col = %w[name email country department employment_status salary join_date].include?(key.to_s) ? key.to_s : "name"
    d = dir.to_s.downcase == "desc" ? "desc" : "asc"
    order(col => d)
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
      salary: salary.to_s
    }
  end
end
