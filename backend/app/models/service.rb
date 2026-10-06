class Service < ApplicationRecord
  belongs_to :user
  has_many :slides, -> { order(position: :asc) }, dependent: :destroy

  validates :service_date, presence: true
end
