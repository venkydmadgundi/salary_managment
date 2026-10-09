module Api
  class StatsController < ApplicationController
    def show
      render json: SalaryStats.new(Employee.kept).call
    end
  end
end
