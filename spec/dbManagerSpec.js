const myDb = require('../app/managers/mysqlManager');
const config = require('config');
const debug = require('debug')('test');

describe('myDB Tests', function () {

    const tableName = config.tableName;
    const mysqlPool = myDb.getPoolInstance;

    beforeAll(async function () {

        await mysqlPool
            .queryAsync(
                `CREATE TABLE IF NOT EXISTS ${tableName} (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    title VARCHAR(50) DEFAULT NULL,
                    date VARCHAR(50) DEFAULT NULL,
                    author VARCHAR(50) DEFAULT NULL,
                    description VARCHAR(301) DEFAULT NULL,
                    image VARCHAR(50) DEFAULT NULL
                )
                COLLATE='utf8_unicode_ci'
                ENGINE=InnoDB;`).catch(err => {
                    debug('after create error', err); 
                    return err;
                });
      
        const insertValues = [];

        //TODO 
        //EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no process to read the data. 
        // Commonly encountered at the net and http layers, indicative that the remote side of the 
        //stream being written to has been closed.
        //Increasing again the max_allowed_packet, 
        //it may works in docker! 
        // with default settings can deliver to Docker Mysql only about 30k records.
        // locally it works on 1e5 records.

            for (let i = 0; i < 100000; i++) {
                insertValues.push(`('${i}-book', '${new Date(Date.now()).toISOString()}', 
                '${getRandomNumber().toString(6)}', '${getRandomNumber().toString(6)}', '${getRandomNumber().toString(6)}.png')`);
            }
               
            await mysqlPool.queryAsync(
                `INSERT INTO ${tableName} (title, date, author, description, image) VALUES ${insertValues.join(',')};`).catch(err => {
                    debug('after insert error', err); 
                    return err;
                });
    
       
        const description = '\'One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into' +
        'a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly' +
        'domed and divided by arches into stiff sections. The bedding was hardly.\'';
        
        const testedValues = ['\'My favoгite book\'', '\'1999-02-31\'', '\'Tullio Avoledo\'', description, '\'image1.jpg\''];

        await mysqlPool.queryAsync(
            `INSERT INTO ${tableName} (title, date, author, description, image) VALUES (${testedValues.join(',')});`).catch(err => {
                debug('after insert error', err); 
                return err;
            });
            
        const description1 = '\'One morning, when Gregor Sams woke from troubled dreams, he found himself transformed in his bed into' +
        'a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly' +
        'domed and divided by arches into stiff sections. The bedding was hardly.\'';
        
        const testedValues1 = ['\'My favoгite book\'', '\'2000-02-31\'', '\'Tullio Avoledo\'', description1, '\'image2.jpg\''];

        await mysqlPool.queryAsync(
            `INSERT INTO ${tableName} (title, date, author, description, image) VALUES (${testedValues1.join(',')});`).catch(err => {
                debug('after insert error', err); 
                return err;
            });

        const description2 = '\'One morning, when woke from troubled dreams, he found himself transformed in his bed into' +
        'a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly' +
        'domed and divided by arches into stiff sections. The bedding was hardly.\'';
        
        const testedValues2 = ['\'My book\'', '\'0001-02-31\'', '\'Tullio Avoledoooo\'', description2, '\'image3.jpg\''];

        await mysqlPool.queryAsync(
            `INSERT INTO ${tableName} (title, date, author, description, image) VALUES (${testedValues2.join(',')});`).catch(err => {
                debug('after insert error', err); 
                return err;
            });

        const records = await mysqlPool.queryAsync(`SELECT COUNT(*) from ${tableName};`);
        debug('Total records', records);
    });

    afterAll(async function () {
        
        if (mysqlPool) {
            await mysqlPool.queryAsync(`DROP TABLE ${tableName}`);
            await mysqlPool.end();
        }
    });

    it("Get book by title", async function myDBTests(done) {

        myDb.getFromDb({title: '19999-book'})
            .then(function (allData) {
                expect(allData.length).toEqual(1);
                done();
            })
            .catch(failTest);

    }, 2000);

    it("Get book by date", async function myDBTests(done) {

        myDb.getFromDb({date: '1999-02-31'})
            .then(function (allData) {
                expect(allData.length).toEqual(1);
                done();
            })
            .catch(failTest);

    }, 2000);

    it("Get book by description", async function myDBTests(done) {

        myDb.getFromDb({description: 'Gregor Samsa'})
            .then(function (allData) {
                expect(allData.length).toEqual(1);
                done();
            })
            .catch(failTest);

    }, 2000);

    it("Get book by image", async function myDBTests(done) {

        myDb.getFromDb({image: 'image1.jpg'})
            .then(function (allData) {
                expect(allData.length).toEqual(1);
                done();
            })
            .catch(failTest);

    }, 2000);

    it("Get book by date and title", async function myDBTests(done) {

         await myDb.getFromDb({title: '99999-book'})
            .then(async function (allData) {
                
                const date = allData[0].date;
                const result = await myDb.getFromDb({date, title: '999-book'});
                expect(result.length).toEqual(1);
                done();
            })
            .catch(failTest);

    }, 2000);

    it("Get books by groupby", async function myDBTests(done) {

        myDb.getFromDb({groupby: 'description', description: 'Gregor Samsa', groupbyId: 'id'})
            .then(function (allData) {
                expect(allData.length).toEqual(1);
                done();
            })
            .catch(failTest);

    }, 2000);

    it("Get books by groupby and order by asc", async function myDBTests(done) {

        myDb.getFromDb({groupby: 'date', description: 'Gregor', groupbyId: 'id', orderbyAsc: 'date' })
            .then(function (allData) {
                expect(allData[0].date).toEqual('1999-02-31');
                expect(allData[1].date).toEqual('2000-02-31');
                done();
            })
            .catch(failTest);

    }, 2000);

    it("Get books by groupby and order by dsc", async function myDBTests(done) {

        myDb.getFromDb({groupby: 'date', description: 'Gregor', groupbyId: 'id', orderbyDsc: 'date' })
            .then(function (allData) {
                expect(allData[0].date).toEqual('2000-02-31');
                expect(allData[1].date).toEqual('1999-02-31');
                done();
            })
            .catch(failTest);

    }, 2000);

    it("Get books by description with Gregor the first offset of 20", async function myDBTests(done) {

        myDb.getFromDb({description: 'Gregor', orderbyAsc: 'date', limit: '20' })
            .then(function (allData) {
                expect(allData.length).toEqual(2);
                done();
            })
            .catch(failTest);

    }, 2000);

    it("inserts book", async function myDBTests(done) {

        const description = 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which' +
        ' I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot, which was.';
        
        const title = 'A wonderful serenity';
        const date = '1981-11-11';
        const author = 'Serenity';
        const image = 'sirenity.png';

        myDb.setNewBookToDb({description, date, title, author, image})
            .then(function (allData) {
                expect(allData.affectedRows).toEqual(1);
                done();
            })
            .catch(failTest);
    }, 2000);

    it("updates book", async function myDBTests(done) {

        const date = '2081-11-11';

        myDb.updateBookIntoDb({id: 100003}, {date})
            .then(function (allData) {
                expect(allData).toEqual('(Rows matched: 1  Changed: 1  Warnings: 0');
                done();
            })
            .catch(failTest);

    }, 2000);
    /* eslint-disable */

    var failTest = function (err) {
        expect(err).toBeUndefined();
        done(); 
    };
}, 10000);

function getRandomNumber() {
    return Math.trunc(Math.random() * 200000);
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
