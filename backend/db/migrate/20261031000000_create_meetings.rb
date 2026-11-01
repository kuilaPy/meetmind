class CreateMeetings < ActiveRecord::Migration[7.1]
  def change
    create_table :meetings do |t|
      t.string :title, null: false
      t.text :transcript, null: false
      t.jsonb :analysis, null: false, default: {}
      t.string :status, null: false, default: "completed"
      t.text :error_message
      t.timestamps
    end
    add_index :meetings, :created_at
  end
end
