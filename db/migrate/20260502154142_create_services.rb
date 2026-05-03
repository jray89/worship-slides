class CreateServices < ActiveRecord::Migration[8.1]
  def change
    create_table :services do |t|
      t.date :service_date
      t.string :label
      t.string :sermon_title
      t.string :sermon_reference

      t.timestamps
    end
  end
end
