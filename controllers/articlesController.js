const {
  selectArticleById,
  changeVotes,
  postComments,
  selectCommentByArticleId,
  selectAllArticles,
  getArticlesLength
} = require("../models/articlesModel");

const sendArticleById = (request, response, next) => {
  const { article_id } = request.params;
  selectArticleById(article_id)
    .then(article => response.status(200).send({ article }))
    .catch(err => next(err));
};

const updateVotes = (request, response, next) => {
  const { article_id } = request.params;
  changeVotes(article_id, request.body)
    .then(article => response.status(200).send({ article }))
    .catch(err => next(err));
};

const sendComments = (request, response, next) => {
  const newComment = request.body;
  newComment.author = newComment.username;
  newComment.article_id = request.params.article_id;
  delete newComment.username;

  postComments(newComment)
    .then(comment => {
      response.status(201).send({ comment });
    })
    .catch(err => next(err));
};

const sendCommentByArticleId = (request, response, next) => {
  const { article_id } = request.params;
  const { sort_by, order, limit, page } = request.query;

  selectCommentByArticleId(article_id, sort_by, order, limit, page)
    .then(comments => response.status(200).send({ comments }))
    .catch(err => next(err));
};

const sendAllArticles = (request, response, next) => {
  const { sort_by, order, author, topic, page, limit } = request.query;
  const articles = selectAllArticles(
    sort_by,
    order,
    author,
    topic,
    limit,
    page
  );
  const total_count = getArticlesLength();

  Promise.all([articles, total_count])
    .then(([articles, total_count]) => {
      response.status(200).send({ articles, total_count });
    })
    .catch(err => next(err));
};
module.exports = {
  sendArticleById,
  updateVotes,
  sendComments,
  sendCommentByArticleId,
  sendAllArticles
};
