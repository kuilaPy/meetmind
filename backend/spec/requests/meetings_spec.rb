require "rails_helper"

RSpec.describe "Meetings API", type: :request do
  it "rejects missing transcript" do
    post "/api/v1/meetings/analyze", params: { title: "Test" }, as: :json
    expect(response).to have_http_status(:bad_request)
  end

  it "lists meetings" do
    Meeting.create!(title: "Planning", transcript: "We discussed planning.")
    get "/api/v1/meetings"
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body).first["title"]).to eq("Planning")
  end
end
