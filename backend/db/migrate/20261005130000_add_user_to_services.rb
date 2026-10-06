class AddUserToServices < ActiveRecord::Migration[8.1]
  def up
    add_reference :services, :user, foreign_key: true

    # Services predate accounts; hand any existing ones to the first user.
    owner_id = select_value("SELECT id FROM users ORDER BY id LIMIT 1")
    if owner_id
      execute "UPDATE services SET user_id = #{owner_id.to_i} WHERE user_id IS NULL"
    elsif select_value("SELECT COUNT(*) FROM services").to_i.positive?
      raise "Existing services need an owner: create a user (User.add) before running this migration"
    end

    change_column_null :services, :user_id, false
  end

  def down
    remove_reference :services, :user, foreign_key: true
  end
end
