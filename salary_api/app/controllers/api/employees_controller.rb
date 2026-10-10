require "csv"

module Api
  class EmployeesController < ApplicationController
    before_action :set_employee, only: %i[show update destroy]
    before_action :set_discarded_employee, only: :restore

    def index
      scope = EmployeeFilter.new(Employee.kept, params.to_unsafe_h).call
      render_employee_page(scope)
    end

    def deleted
      scope = EmployeeFilter.new(Employee.discarded, params.to_unsafe_h).call
      render_employee_page(scope)
    end

    def restore
      @employee.with_lock do
        @employee.update!(employment_status: :active)
        @employee.undiscard!
      end

      render json: @employee.as_api_json
    end

    def export
      scope = EmployeeFilter.new(Employee.kept, params.to_unsafe_h).call
      csv = CSV.generate(headers: true) do |rows|
        rows << %w[id name email country department job_title join_date employment_status salary]
        scope.each do |employee|
          rows << [
            employee.id,
            employee.name,
            employee.email,
            employee.country,
            employee.department,
            employee.job_title,
            employee.join_date.iso8601,
            employee.employment_status,
            employee.salary
          ].map { |value| csv_safe_value(value) }
        end
      end

      send_data csv,
        filename: "employees-#{Date.current.iso8601}.csv",
        type: "text/csv; charset=utf-8"
    end

    # GET /employees/1
    def show
      render json: @employee
    end

    # POST /employees
    def create
      @employee = Employee.new(employee_params)

      if @employee.save
        render json: @employee, status: :created, location: api_employee_url(@employee)
      else
        render json: @employee.errors, status: :unprocessable_content
      end
    end

    # PATCH/PUT /employees/1
    def update
      if @employee.update(employee_params)
        render json: @employee
      else
        render json: @employee.errors, status: :unprocessable_content
      end
    end

    # DELETE /employees/1
    def destroy
      @employee.discard!
      head :no_content
    end

    private

    def render_employee_page(scope)
      page = params[:page].to_i.positive? ? params[:page].to_i : 1
      per_page = EmployeeFilter::PER_PAGE
      total_count = scope.count
      total_pages = (total_count.to_f / per_page).ceil
      offset = (page - 1) * per_page
      records = scope.limit(per_page).offset(offset)

      render json: {
        data: records.map(&:as_api_json),
        meta: {
          page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: total_pages
        }
      }
    end

    def set_employee
      @employee = Employee.kept.find(params.expect(:id))
    end

    def set_discarded_employee
      @employee = Employee.discarded.find(params.expect(:id))
    end

    def employee_params
      params.expect(employee: %i[name email country department job_title join_date employment_status salary])
    end

    def csv_safe_value(value)
      return value unless value.is_a?(String) && value.match?(/\A[=+\-@\t\r]/)

      "'#{value}"
    end
  end
end
