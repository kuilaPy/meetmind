module Api
  module V1
    class MeetingsController < ApplicationController
      def index
        render json: Meeting.order(created_at: :desc).limit(30).as_json(only: %i[id title status created_at])
      end

      def show
        render json: Meeting.find(params[:id])
      end

      def analyze
        title = params.require(:title).to_s.strip
        transcript = params.require(:transcript).to_s.strip
        return render json: { error: "Title and transcript are required" }, status: :unprocessable_entity if title.blank? || transcript.blank?
        return render json: { error: "Transcript is too long (maximum 100,000 characters)" }, status: :unprocessable_entity if transcript.length > 100_000

        meeting = Meeting.create!(title: title, transcript: transcript, status: "processing")
        result = MeetingAnalysis.new(transcript).call
        meeting.update!(analysis: result, status: "completed")
        render json: meeting, status: :created
      rescue MeetingAnalysis::ConfigurationError => e
        meeting&.update(status: "failed", error_message: e.message)
        render json: { error: e.message, meeting_id: meeting&.id }, status: :service_unavailable
      rescue MeetingAnalysis::InvalidResponse => e
        meeting&.update(status: "failed", error_message: e.message)
        render json: { error: "AI returned an invalid structured response", details: e.message, meeting_id: meeting&.id }, status: :unprocessable_entity
      rescue OpenAI::Error => e
        meeting&.update(status: "failed", error_message: e.message)
        render json: { error: "AI provider request failed. Check API key, model access and quota." }, status: :bad_gateway
      end
    end
  end
end
