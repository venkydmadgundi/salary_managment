Rails.application.routes.draw do
  namespace :api do
    get "employees/export", to: "employees#export", defaults: { format: :csv }
    get "employees/deleted", to: "employees#deleted"
    patch "employees/:id/restore", to: "employees#restore"
    resources :employees, only: %i[index show create update destroy]
    get :stats, to: "stats#show"
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
