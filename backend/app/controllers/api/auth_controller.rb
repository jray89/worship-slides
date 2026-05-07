module Api
  class AuthController < BaseController
    skip_before_action :authenticate_user!, only: [ :login ]

    def login
      user = User.find_by(email: User.normalize_value_for(:email, params[:email].to_s))

      if user&.authenticate(params[:password])
        token = JwtService.encode({ user_id: user.id })
        render json: { token: token, user: user_json(user) }
      else
        render json: { error: "Invalid email or password" }, status: :unauthorized
      end
    end

    def me
      render json: { user: user_json(current_user) }
    end

    private

    def user_json(user)
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        name: user.name
      }
    end
  end
end
