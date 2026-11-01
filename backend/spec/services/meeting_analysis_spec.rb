require "rails_helper"

RSpec.describe MeetingAnalysis do
  let(:client) { double("OpenAI client") }

  it "fails clearly when API key is absent" do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with("OPENAI_API_KEY").and_return(nil)
    expect { described_class.new("Transcript", client: client).call }.to raise_error(MeetingAnalysis::ConfigurationError)
  end

  it "rejects decisions without evidence" do
    service = described_class.allocate
    expect { service.send(:validate!, {
      "meeting_summary" => "Summary", "key_decisions" => [{"decision" => "Launch", "evidence" => nil, "confidence" => 0.8}],
      "discussions" => [], "action_items" => [], "open_questions" => [], "follow_up_items" => []
    }) }.to raise_error(MeetingAnalysis::InvalidResponse)
  end
end
