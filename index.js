"use strict";

const elastic = require('elasticsearch');


function ElasticAll() {
  this.client = null;
  return this;
}

/**
 *
 * @param connectionConf
 */
ElasticAll.prototype.connect = function (connectionConf) {

  if(this.client === null) {
    this.client = new elastic.Client(connectionConf);
  }

  return this;
};

/**
 *
 * @param searchParameters
 */
ElasticAll.prototype.get = function(searchParameters) {

  let params = searchParameters;
  let results = [];
  let first = true;

  const execute = () => {

      if(!first && results.length) {
        params.body.search_after = results[results.length-1].sort;
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

            return Promise.reject(error);

        });

  }

  if(typeof searchParameters === 'string') {
      params = {
        index: searchParameters
      }
  }

  if(typeof params.body.sort === 'undefined') {
    params.body.sort = [];
  }

  params.body.from = 0;
  params.body.sort.push({
    _uid : { order : "desc" }
  });

  return execute();

};

module.exports = new ElasticAll();
