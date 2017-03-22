# Elastic All

A really simple utility to retrieve all documents from an elasticsearch index.

It uses promise chaining and Elasticsearch [Search After API](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-search-after.html) under the hood.

## Requirements

Node >= 6.4

Elasticsearch >= 5.0

## Install

You can install it from npm: (...not yet)

```bash
npm i elastic-all --save
```

## Usage

Here's an example to fetch data from an AWS Elasticsearch Service.

```javascript
const elasticAll = require('elastic-all');

elasticAll.connect({
  host: '',
  log: 'error',
  apiVersion: '5.0',
  connectionClass: require('http-aws-es'),
  amazonES: {
      region: '',
      accessKey: '',
      secretKey: ''
  }
}).get({
    index: "logs",
    size: 10000,
    body: {
        query:{
            "match_all" : {}
        }
    }
})
.then((results) => {

  console.log(`Retrieved ${results.length} documents.`)

})
.catch((error) => {

  console.log('ERROR!')
  console.dir(error)

})
```

## License

[MIT License](https://gabfusi.mit-license.org/) © Gabriele Fusi
