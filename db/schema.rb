# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_02_154148) do
  create_table "services", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "label"
    t.string "sermon_reference"
    t.string "sermon_title"
    t.date "service_date"
    t.datetime "updated_at", null: false
  end

  create_table "slides", force: :cascade do |t|
    t.json "content_data"
    t.datetime "created_at", null: false
    t.integer "position"
    t.integer "psalm_number"
    t.string "psalm_version"
    t.string "scripture_reference"
    t.integer "service_id", null: false
    t.string "slide_type"
    t.datetime "updated_at", null: false
    t.integer "verse_end"
    t.integer "verse_start"
    t.index ["service_id"], name: "index_slides_on_service_id"
  end

  add_foreign_key "slides", "services"
end
