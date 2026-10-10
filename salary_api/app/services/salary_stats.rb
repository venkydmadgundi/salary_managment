class SalaryStats
  BUCKETS = 10

  def initialize(scope = Employee.kept)
    @scope = scope
  end

  def call
    {
      headcount: @scope.count,
      active_headcount: @scope.where(employment_status: :active).count,
      total_salary: total_salary,
      avg_salary: avg_salary,
      median_salary: median_salary,
      by_country: by_dimension(:country),
      by_department: by_dimension(:department),
      salary_histogram: histogram,
    }
  end

  private

  def total_salary
    @scope.sum(:salary).to_f
  end

  def avg_salary
    @scope.average(:salary).to_f
  end

  def median_salary
    median(ordered_salaries).to_f
  end

  def by_dimension(column)
    counts = @scope.group(column).count
    avgs   = @scope.group(column).average(:salary)
    medians = medians_by(column)

    counts.map do |dim, count|
      {
        column => dim,
        headcount: count,
        avg_salary: avgs[dim].to_f,
        median_salary: medians.fetch(dim, 0.0),
      }
    end.sort_by { |r| -r[:headcount] }
  end

  def medians_by(column)
    # Pull (dimension, salary) once, group in Ruby. At 10k rows this is
    # ~200KB and single-digit ms. At 1M rows, switch to a window function.
    grouped = Hash.new { |h, k| h[k] = [] }
    @scope.where.not(salary: nil).pluck(column, :salary).each do |dim, salary|
      grouped[dim] << salary
    end
    grouped.transform_values { |vals| median(vals.sort).to_f }
  end

  def histogram
    rows = ordered_salaries
    return [] if rows.empty?

    min = rows.first.to_f
    max = rows.last.to_f
    width = [(max - min) / BUCKETS, 1.0].max

    buckets = Array.new(BUCKETS) do |i|
      {
        salary_start: min + i * width,
        salary_end: min + (i + 1) * width,
        count: 0,
      }
    end

    rows.each do |s|
      idx = [((s.to_f - min) / width).floor, BUCKETS - 1].min
      buckets[idx][:count] += 1
    end
    buckets
  end

  def ordered_salaries
    @scope.where.not(salary: nil).order(:salary).pluck(:salary)
  end

  def median(sorted)
    return 0 if sorted.empty?
    n = sorted.length
    n.odd? ? sorted[n / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
  end
end