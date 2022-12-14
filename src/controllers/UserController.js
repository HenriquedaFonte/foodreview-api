const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')

const sqliteConnection = require('../database/sqlite')

class UsersController {
  async create(request, response) {
    const { name, password } = request.body
    const email = request.body.email.toLowerCase()

    const database = await sqliteConnection()
    const checkUserExists = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    if (checkUserExists) {
      throw new AppError(`Email ${email} already exists`)
    }

    const hashedPassword = await hash(password, 8)

    await database.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    return response.status(201).json()
  }

  async update(request, response) {
    const { name, password, old_password } = request.body
    const email = request.body.email.toLowerCase()
    const user_id = request.user.id;
    
    const database = await sqliteConnection()
    const user = await database.get('SELECT * FROM users WHERE id = (?)', [user_id])

    if(!user) {
      throw new AppError(`User with id ${user_id} does not exist`)
    }

    const userWithUpdatedEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){
      throw new AppError(`Email ${email} already exists`)
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if (password && !old_password) {
      throw new AppError(
        'You need to enter the old password to set a new password.'
      )
    }

    if(password && old_password){
      const checkOldPassword = await compare(old_password, user.password)

      if(!checkOldPassword) {
        throw new AppError('Old password do not match')
      }

      user.password = await hash(password, 8)
    }

    await database.run(
      `
      UPDATE users SET
      name = ?,
      email = ?,
      password =?,
      updated_at = DATETIME('now')
      WHERE id = ?`,
      [user.name, user.email, user.password, user_id]    
    )

    return response.json()
  }
}

module.exports = UsersController
