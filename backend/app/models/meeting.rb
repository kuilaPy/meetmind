class Meeting < ApplicationRecord
  validates :title, :transcript, presence: true
  validates :transcript, length: { maximum: 100_000 }
end
