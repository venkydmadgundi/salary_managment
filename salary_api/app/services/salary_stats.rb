class SalaryStats
  BUCKETS = 10

  def initialize(scope = Employee.kept)
    @scope = scope
  end

  def call
    {
      headcount: @scope.count,
      active_headcount: @scope.where(employment_status: :active).count,
      total_salary_cents: total_salary_cents,
      avg_salary_cents: avg_salary_cents,
      median_salary_cents: median_salary_cents,
      by_country: by_dimension(:country),
      by_department: by_dimension(:department),
      salary_histogram: histogram,
    }
  end

  private

  def total_salary_cents
    @scope.sum(:salary_cents).to_i
  end

  def avg_salary_cents
    @scope.average(:salary_cents).to_f.round
  end

  def median_salary_cents
    median(ordered_salaries)
  end

  def by_dimension(column)
    counts = @scope.group(column).count
    avgs   = @scope.group(column).average(:salary_cents)
    medians = medians_by(column)

    counts.map do |dim, count|
      {
        column => dim,
        headcount: count,
        avg_salary_cents: avgs[dim].to_f.round,
        median_salary_cents: medians[dim],
      }
    end.sort_by { |r| -r[:headcount] }
  end

  def medians_by(column)
    # Pull (dimension, salary) once, group in Ruby. At 10k rows this is
    # ~200KB and single-digit ms. At 1M rows, switch to a window function.
    grouped = Hash.new { |h, k| h[k] = [] }
    @scope.pluck(column, :salary_cents).each do |dim, salary|
      grouped[dim] << salary
    end
    grouped.transform_values { |vals| median(vals.sort) }
  end

  def histogram
    rows = ordered_salaries
    return [] if rows.empty?

    min = rows.first
    max = rows.last
    width = [(max - min) / BUCKETS, 1].max

    buckets = Array.new(BUCKETS) do |i|
      {
        bucket_start_cents: min + i * width,
        bucket_end_cents: min + (i + 1) * width,
        count: 0,
      }
    end

    rows.each do |s|
      idx = [(s - min) / width, BUCKETS - 1].min
      buckets[idx][:count] += 1
    end
    buckets
  end

  def ordered_salaries
    @scope.where.not(salary_cents: nil).order(:salary_cents).pluck(:salary_cents)
  end

  def median(sorted)
    return 0 if sorted.empty?
    n = sorted.length
    n.odd? ? sorted[n / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
  end
end