module Api
  class BaseController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :authenticate_user!

    private

    def authenticate_user!
      token = bearer_token || params[:token]
      decoded = JwtService.decode(token) if token.present?
      @current_user = User.find_by(id: decoded&.dig(:user_id))

      render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
    end

    def current_user
      @current_user
    end

    def bearer_token
      request.headers["Authorization"]&.split(" ")&.last
    end
  end
end
