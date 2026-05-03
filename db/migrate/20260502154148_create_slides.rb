class CreateSlides < ActiveRecord::Migration[8.1]
  def change
    create_table :slides do |t|
      t.references :service, null: false, foreign_key: true
      t.integer :position
      t.string :slide_type
      t.integer :psalm_number
      t.integer :verse_start
      t.integer :verse_end
      t.string :psalm_version
      t.string :scripture_reference
      t.json :content_data

      t.timestamps
    end
  end
end
