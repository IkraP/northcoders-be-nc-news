const {
  patchCommentbyId,
  deleteCommentById
} = require("../models/commentsModel");

const updateCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  const { inc_votes } = request.body;
  patchCommentbyId(comment_id, inc_votes)
    .then(comment => response.status(201).send({ comment }))
    .catch(err => next(err));
};

const removeCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  deleteCommentById(comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch(err => next(err));
};

module.exports = { updateCommentById, removeCommentById };
