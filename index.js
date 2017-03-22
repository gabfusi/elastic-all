"use strict";

const elastic = require('elasticsearch');

function ElasticAll() {
  this.client = null;
  return this;
}


ElasticAll.prototype.connect = function (connectionConf) {

  if(this.client === null) {
    this.client = new elastic.Client(connectionConf);
  }

  return this;
};


ElasticAll.prototype.getAll = function(searchParameters) {

  let params = searchParameters;
  let results = [];
  let first = true;
  let stop = false;

  if(typeof searchParameters === 'string') {
      params = {
        index: searchParameters
      }
  }

  if(typeof params.sort === 'undefined') {
    params.sort = [];
  }

  params.sort.push({
    "_uid" : "desc"
  });

  function execute() {

      if(!first && results.length) {
        params.search_after = results[results.length-1]._id;
      }

      return this.client.search(params)
        .then((body) => {

            let hits = body.hits.hits;
            first = false;

            if(hits.length) {
              results = results.concat(hits);
              return execute();
            }

            return Promise.resolve(results);

        }, (error) => {

            console.trace(error.message);
            return Promise.reject(error);
            execute();

        });

  }

  return execute();

};
