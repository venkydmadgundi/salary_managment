module Api
  class EmployeesController < ApplicationController
    def index
      scope = EmployeeFilter.new(Employee.kept, params.to_unsafe_h).call
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
          total_pages: total_pages,
        },
      }
    end

    # GET /employees/1
    def show
        render json: @employee
    end

    # POST /employees
    def create
        @employee = Employee.new(employee_params)

        if @employee.save
        render json: @employee, status: :created, location: @employee
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
        @employee.destroy!
    end

    private
        # Use callbacks to share common setup or constraints between actions.
        def set_employee
        @employee = Employee.find(params.expect(:id))
        end

        # Only allow a list of trusted parameters through.
        def employee_params
        params.expect(employee: [ :name, :email, :country, :department, :job_title, :join_date, :employment_status, :salary, :discarded_at ])
        end
  end
end
