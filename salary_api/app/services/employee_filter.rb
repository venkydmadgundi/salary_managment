class EmployeeFilter
  PER_PAGE = 10
  SORTABLE = %w[name email country department employment_status salary join_date].freeze

  def initialize(scope = Employee.kept, params = {})
    @scope = scope
    @params = params.to_h.symbolize_keys
  end

  def call
    relation = @scope
    relation = search(relation)
    relation = filter_country(relation)
    relation = filter_department(relation)
    relation = filter_status(relation)
    relation = filter_salary_range(relation)
    relation = sort(relation)
    relation
  end

  private

  def search(rel)
    q = @params[:q].to_s.strip
    return rel if q.empty?
    like = "%#{sanitize_like(q)}%"
    rel.where("name LIKE :q OR email LIKE :q", q: like)
  end

  def filter_country(rel)
    @params[:country].presence ? rel.where(country: @params[:country]) : rel
  end

  def filter_department(rel)
    @params[:department].presence ? rel.where(department: @params[:department]) : rel
  end

  def filter_status(rel)
    s = @params[:status].presence
    return rel unless s
    return rel.none unless Employee.employment_statuses.key?(s.to_s)
    rel.where(employment_status: s)
  end

  def filter_salary_range(rel)
    rel = rel.where("salary >= ?", @params[:min_salary].to_d) if @params[:min_salary].present?
    rel = rel.where("salary <= ?", @params[:max_salary].to_d) if @params[:max_salary].present?
    rel
  end

  def sort(rel)
    key, dir = @params[:sort].to_s.split(":", 2)
    key = "name" unless SORTABLE.include?(key)
    rel.sorted(key, dir || "asc")
  end

  def sanitize_like(str)
    str.gsub(/[\\%_]/) { |c| "\\#{c}" }
  end
end
