'use strict';

const mysql = require('mysql');

const util = require('util');
const config = require('config');
const MysqlPool = require('mysql/lib/Pool');
const debug = require('debug')('mysqlManager');

MysqlPool.prototype.queryAsync = util.promisify(MysqlPool.prototype.query);
MysqlPool.prototype.endAsync = util.promisify(MysqlPool.prototype.end);

const mysqlPoolInstance = mysql.createPool(config.mysqlPool);

module.exports = {

    getPoolInstance:  mysqlPoolInstance, 

    /**
     * Get all records from DB
     * @param query is Object with passible keys id, title, date, author, 
     * description, image, grouby, groupbyid, orderbyAsc, orderbyDsc, limit, limitfrom  
     * @return {Promise}
     */
    async getFromDb(query) {

        function buildConditionsWhere(query) {
            const conditions = [];
            const values = [];
          
            if (typeof query.id !== 'undefined') {
                conditions.push("id = ?");
                values.push(parseInt(query.id));
            }
            if (typeof query.title !== 'undefined') {
                conditions.push("title LIKE ?");
                values.push("%" + query.title + "%");
            }
            if (typeof query.date !== 'undefined') {
                conditions.push("date = ?");
                values.push(query.date);
            }
            if (typeof query.author !== 'undefined') {
                conditions.push("author LIKE ?");
                values.push("%" + query.author + "%");
            }
            if (typeof query.description !== 'undefined') {
                conditions.push("description LIKE ?");
                values.push("%" + query.description + "%");
            }
            if (typeof query.image !== 'undefined') {
                conditions.push("image LIKE ?");
                values.push("%" + query.image + "%");
            }

            return {
                where: conditions.length ?
                    conditions.join(" AND ") : '1',
                values: values
            };
        }

        const conditions = buildConditionsWhere(query);
        if (typeof query.groupby !== 'undefined') {
            conditions.where = `${conditions.where}` + " GROUP BY ??, ??";
            conditions.values.push(query.groupby);
            conditions.values.push(query.groupbyId);
        }

        if (typeof query.orderbyAsc !== 'undefined') {
            conditions.where = `${conditions.where}` + " ORDER BY ?? ASC";
            conditions.values.push(query.orderbyAsc);
        } else if 
        (typeof query.orderbyDsc !== 'undefined') {
            conditions.where = `${conditions.where}` + " ORDER BY ?? DESC";
            conditions.values.push(query.orderbyDsc);
        }

        if (typeof query.limit !== 'undefined' && typeof query.limitfrom !== 'undefined') {
            conditions.where = `${conditions.where}` + " LIMIT ?, ?";
            conditions.values.push(parseInt(query.limitfrom));
            conditions.values.push(parseInt(query.limit));
        } else if (typeof query.limit !== 'undefined') {
            conditions.where = `${conditions.where}` + " LIMIT ?";
            conditions.values.push(parseInt(query.limit));
        }

        const sql = mysql.format(`SELECT * FROM ${config.tableName} WHERE ` + conditions.where, conditions.values);

        debug('formed query sql', sql);

        return await mysqlPoolInstance
            .queryAsync(sql).catch(err => {
                debug('Errors appeared during db request on Get', err);
                throw{ message: 'Errors appeared during db request'};
            });
    },

    /**
     * Add new record to DB
     * @param book is Object with title, date, author, description, image keys
     * @return {Promise}
     */
    async setNewBookToDb(book) {
        const insertValues = ['title', 'date', 'author', 'description', 'image'].map((value) => book[value]);
        const sql = mysql.format(`INSERT INTO ${config.tableName} (title, date, author, description, image) VALUES (?, ?, ?, ?, ?)`, insertValues);
        debug('setNewBookToDb ', sql);
        const {affectedRows, insertId} = await mysqlPoolInstance.queryAsync(sql).catch(err => {
            debug('Errors appeared during db request on Insert', err);
            throw{ message: 'Errors appeared during db request'};
        });
        return {affectedRows, insertId};
    },

    /**
     * Update record into DB
     * @param id is Object with id
     * @param book is Object with title, date, author, description, image keys
     * @return {Promise}
     */
    async updateBookIntoDb(id, book) {
        const sqlColumn = [];
        const insertValues = ['title', 'date', 'author', 'description', 'image'].map((value) => {
            if (book[value]) sqlColumn.push(` ${value} = ?`);
            return book[value];
        });
        insertValues.push(id.id);
     
        const sql = mysql.format(`UPDATE ${config.tableName} SET ${sqlColumn.join(',')} WHERE id = ?`, insertValues.filter(Boolean));
       debug('update sql string', sql, insertValues, book);
        const{message} = await mysqlPoolInstance.queryAsync(sql).catch(err => {
            debug('Errors appeared during db request on Update', err);
            throw{ message: 'Errors appeared during db request'};
        });
        return message;
    }
 };


