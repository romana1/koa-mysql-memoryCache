These tests should be done table books is created. 

curl -XPOST  "127.0.0.1:8081/book" -d '{"title": "Example", "date": "2018", "author": "Famous Author", "description": "The best of all", "image": "ff.jpg"}' -H 'Content-Type: application/json'
curl -XGET   "127.0.0.1:8081/book?limit=1000" -H 'Cache-Control: no-cache'
curl -XGET   "127.0.0.1:8081/book?limit=1000" -H 'Cache-Control: no-cache'
curl -XPUT   "127.0.0.1:8081:8081/book/100003" -d '{"title": "UpdateExample", "date": "2018", "author": "Zhelodd", "description": "Once upon the time", "image": "ff.jpg"}' -H 'Content-Type: application/json'

