const Router = require('koa-router'),
      KoaBody = require('koa-body'),
     {get, createItem, updateItem} = require('../controllers/indexController');

const router = new Router();
/* eslint-disable */
    router
        .get('/book',                          get)
        .post('/book',       KoaBody(), createItem)
        .put('/book/:id',    KoaBody(), updateItem);
/* eslint-disable */  
module.exports = {
    routes() { return router.routes();},
    allowedMethods() { return router.allowedMethods();}
};
