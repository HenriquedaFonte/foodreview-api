const { Router } = require('express')

const ReviewController = require('../controllers/ReviewController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const reviewNotesRoutes = Router()

const reviewController = new ReviewController()

reviewNotesRoutes.use(ensureAuthenticated);

reviewNotesRoutes.get('/', reviewController.index)
reviewNotesRoutes.post('/', reviewController.create)
reviewNotesRoutes.get('/:id', reviewController.show)
reviewNotesRoutes.delete('/:id', reviewController.delete)

module.exports = reviewNotesRoutes
