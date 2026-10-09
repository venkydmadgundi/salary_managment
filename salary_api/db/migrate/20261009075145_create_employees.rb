class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.string :name
      t.string :email
      t.string :country
      t.string :department
      t.string :job_title
      t.date :join_date
      t.string :employment_status
      t.decimal :salary
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :employees, :email, unique: true
    add_index :employees, :country
    add_index :employees, :department
    add_index :employees, :employment_status
    add_index :employees, %i[country department]
    add_index :employees, :discarded_at
  end
end
