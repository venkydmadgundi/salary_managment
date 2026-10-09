module Api
  class EmployeesController < ApplicationController
    include Pagy::Backend

    def index
      scope = EmployeeFilter.new(Employee.kept, params.to_unsafe_h).call
      pagy, records = pagy(scope, items: EmployeeFilter::PER_PAGE)

      render json: {
        data: records.map(&:as_api_json),
        meta: {
          page: pagy.page,
          per_page: pagy.items,
          total_count: pagy.count,
          total_pages: pagy.pages,
        },
      }
    end
  end
end