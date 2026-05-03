class Slide < ApplicationRecord
  belongs_to :service
  acts_as_list scope: :service

  validates :slide_type, presence: true, inclusion: {
    in: %w[welcome psalm scripture key_verse closing]
  }

  validates :psalm_number, presence: true, if: -> { slide_type == "psalm" }
  validates :scripture_reference, presence: true, if: -> { slide_type.in?(%w[scripture key_verse]) }
end
