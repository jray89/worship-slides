class Service < ApplicationRecord
  has_many :slides, -> { order(position: :asc) }, dependent: :destroy

  validates :service_date, presence: true
end
