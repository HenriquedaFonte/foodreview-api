const { Router } = require('express')

const userRouter = require('./users.routes')
const reviewNotesRoutes = require('./reviewNotes.routes')
const tagsRoutes = require('./tags.routes')
const sessionsRoutes = require('./sessions.routes')

const routes = Router()

routes.use('/users', userRouter)
routes.use('/reviewNotes', reviewNotesRoutes)
routes.use('/tags', tagsRoutes)
routes.use('/sessions', sessionsRoutes)

module.exports = routes
