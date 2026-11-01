Rails.application.routes.draw do
  get "/up", to: proc { [200, { "Content-Type" => "application/json" }, ['{"status":"ok"}']] }
  namespace :api do
    namespace :v1 do
      resources :meetings, only: %i[index show] do
        post :analyze, on: :collection
      end
    end
  end
end
