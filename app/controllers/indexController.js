const myDb = require('../managers/mysqlManager');
const cache = require('memory-cache');
const debug = require('debug')('indexController');

/**
 * @example curl -XGET "http://localhost:8081/book"
 * Request without query params returns first 100 
 */
const memCache = new cache.Cache();

async function get(ctx, next) {
    const key = `__hashkey__${ctx.request.url}`;
    const cacheContent = memCache.get(key);
    const duration = 30;

    if(cacheContent){
        ctx.body = cacheContent;
        debug('cash'), cacheContent;
        return next();
    } else {
        let query = Object.assign({}, ctx.request.query);
        if (Object.keys(query).length === 0) query = Object.assign({}, {limit: 100});
        ctx.body = await myDb.getFromDb(query);
        memCache.put(key, ctx.body, duration*1000);
    }

    return next();
}

/**
 * @example curl -XPOST "http://localhost:8081/book" -d '{"title": "Example", "date": "2018", "author": "ff", "description": "dd", 
 * "image": "ff.jpg"}' -H 'Content-Type: application/json'
 */
async function createItem(ctx, next) {
    if (Object.keys(ctx.request.body).length === 0) {
        ctx.status = 406; 
        return next();
    }
    ctx.body = await myDb.setNewBookToDb(ctx.request.body);
    ctx.status = 201;

    return next();
}

/**
 * @example curl -XPUT "http://localhost:8081/book/100003" -d '{"title": "UpdateExample", "date": "2018", "author": "Zhelo",
 *  "description": "Once upon the time", "image": "ff.jpg"}' -H 'Content-Type: application/json'
 */
async function updateItem(ctx, next) {
    if (Object.keys(ctx.request.body).length === 0) {
        ctx.status = 406; 
        return next();
    }
    ctx.body = await myDb.updateBookIntoDb({id: ctx.params.id}, ctx.request.body);
    
    await next();
}

module.exports = {get, createItem, updateItem};
