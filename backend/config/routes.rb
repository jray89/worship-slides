Rails.application.routes.draw do
  root "fallback#index"

  namespace :api do
    resources :services do
      resources :slides, only: [ :index, :create, :update, :destroy ] do
        member do
          patch :move
        end
      end
      member do
        get :preview_data
        get :export_pdf
        get :export_title_card
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check

  # SPA fallback for client-side routing
  get "*path", to: "fallback#index", constraints: ->(req) { !req.path.start_with?("/api/") }
end
