class User < ApplicationRecord
  has_secure_password

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }

  normalizes :email, with: ->(email) { email.strip.downcase }

  def name
    "#{first_name} #{last_name}".strip
  end

  # Console utility for adding users:
  #   User.add(first_name: "Jay", last_name: "Ray", email: "jay@example.com", password: "secret123")
  def self.add(first_name:, last_name:, email:, password:)
    create!(first_name: first_name, last_name: last_name, email: email, password: password)
  end
end
