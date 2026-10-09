class EmployeesController < ApplicationController
  before_action :set_employee, only: %i[ show update destroy ]

  # GET /employees
  def index
    @employees = Employee.all

    render json: @employees
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
