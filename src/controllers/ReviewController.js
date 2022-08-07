const knex = require('../database/knex');

class ReviewController {
  async create(request, response) {
    const { title, description, rating, tags } = request.body;
    const user_id = request.user.id;

    const note_id = await knex('reviewNotes').insert({
      title,
      description,
      rating,
      user_id
    });

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    });

    if (tags.length > 0) {
      await knex('tags').insert(tagsInsert);
    }

    return response.status(201).json();
  }

  async show(request, response) {
    const { id } = request.params

    const note = await knex('reviewNotes').where({ id }).first()
    const tags = await knex('tags').where({ note_id: id }).orderBy('name')

    return response.json({
      ...note,
      tags
    })
  }

  async delete(request, response) {
    const { id } = request.params

    await knex('reviewNotes').where({ id }).delete()

    return response.json()
  }

  async index(request, response) {
    const { title, tags } = request.query;
    const user_id = request.user.id;

    let notes

    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim())

      notes = await knex('tags')
        .select(['reviewNotes.id', 'reviewNotes.title', 'reviewNotes.user_id'])
        .where('reviewNotes.user_id', user_id)
        .whereLike('reviewNotes.title', `%${title}%`)
        .whereIn('name', filterTags)
        .innerJoin('reviewNotes', 'reviewNotes.id', 'tags.note_id')
        .orderBy('reviewNotes.title')
    } else {
      notes = await knex('reviewNotes')
        .where({ user_id })
        .whereLike('title', `%${title}%`)
        .orderBy('title')
    }

    const userTags = await knex('tags').where({ user_id })

    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        tags: noteTags
      }
    })
    return response.json(notesWithTags)
  }
}

module.exports = ReviewController;
