require "json"
require "date"

class MeetingAnalysis
  class ConfigurationError < StandardError; end
  class InvalidResponse < StandardError; end

  SCHEMA_PATH = Rails.root.join("../../schemas/meeting_output.schema.json")

  SYSTEM_PROMPT = <<~PROMPT.freeze
    You are MeetMind, a careful meeting analyst. Extract only information supported by the transcript.
    CRITICAL DISTINCTIONS:
    - Discussion: an idea, suggestion, concern or topic was mentioned. It is NOT a decision.
    - Decision: only include when participants explicitly agree, approve, select, confirm or commit to a course of action.
    - Action item: only include when a task is explicitly assigned to someone or a speaker clearly volunteers to do it.
    - A suggestion phrased as "we should/might/could" is not a decision without explicit agreement.
    - A tentative offer ("I can probably") is not an accepted assignment unless the group confirms it.
    - Never infer an owner. Use null if not explicitly identifiable.
    - Never infer a deadline. Use null if absent, ambiguous, proposed but unaccepted, or not resolvable from meeting_date.
    - Do not turn every follow-up topic into an action item.
    EVIDENCE:
    - Every decision and action item must contain a short verbatim evidence quote from the transcript.
    - Include speaker when identifiable, otherwise null.
    - If evidence is insufficient, omit the item or put the topic in discussions/open_questions.
    OUTPUT:
    - Return JSON only, matching the supplied schema exactly.
    - Dates must be YYYY-MM-DD or null. Relative dates may be normalized only when an explicit meeting_date is supplied; otherwise null.
    - Confidence is a number from 0 to 1 and represents extraction certainty, not truth.
    - Use status "pending" for newly assigned tasks; do not claim completion unless transcript explicitly says completed.
  PROMPT

  def initialize(transcript, client: nil)
    @transcript = transcript
    @client = client
  end

  def call
    raise ConfigurationError, "OPENAI_API_KEY is not configured" if ENV["OPENAI_API_KEY"].blank?
    response = client.chat(
      parameters: {
        model: ENV.fetch("OPENAI_MODEL", "gpt-4.1-mini"),
        response_format: { type: "json_object" },
        temperature: 0.1,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Analyze this transcript. Return JSON with the exact top-level keys in the schema.\n\nTRANSCRIPT:\n#{@transcript}" }
        ]
      }
    )
    raw = response.dig("choices", 0, "message", "content")
    parsed = JSON.parse(raw)
    validate!(parsed)
    parsed
  rescue JSON::ParserError => e
    raise InvalidResponse, "Could not parse model JSON: #{e.message}"
  end

  private

  def client
    @client ||= OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])
  end

  def validate!(data)
    required = %w[meeting_summary key_decisions discussions action_items open_questions follow_up_items]
    raise InvalidResponse, "Missing required keys" unless (required - data.keys).empty?
    raise InvalidResponse, "Expected arrays for extracted collections" unless required.drop(1).all? { |key| data[key].is_a?(Array) }
    data["key_decisions"].each { |item| validate_evidence!(item, "decision") }
    data["action_items"].each do |item|
      validate_evidence!(item, "action item")
      raise InvalidResponse, "Invalid action status" unless %w[pending in_progress completed blocked].include?(item["status"])
      raise InvalidResponse, "Owner must be a string or null" unless item["owner"].nil? || item["owner"].is_a?(String)
      raise InvalidResponse, "Deadline must be YYYY-MM-DD or null" unless item["deadline"].nil? || (item["deadline"].is_a?(String) && Date.iso8601(item["deadline"]))
    rescue Date::Error
      raise InvalidResponse, "Deadline must be YYYY-MM-DD or null"
    end
  end

  def validate_evidence!(item, label)
    raise InvalidResponse, "#{label} must be an object" unless item.is_a?(Hash)
    raise InvalidResponse, "#{label} requires evidence" if item["evidence"].blank?
    raise InvalidResponse, "#{label} confidence must be between 0 and 1" unless item["confidence"].is_a?(Numeric) && item["confidence"].between?(0, 1)
  end
end
