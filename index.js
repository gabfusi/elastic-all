"use strict";

const elastic = require('elasticsearch');


function ElasticAll() {
  this.client = null;
  this.onEachFn = null;
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
 * To use an existing elasticsearch client connection
 * @param connectionObject
 */
ElasticAll.prototype.use = function (connectionObject) {
  this.client = connectionObject;
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

              if(this.onEachFn !== null) {

                  return new Promise((resolve, reject) => {
                    this.onEachFn(hits, (modifiedHits) => {

                      if(modifiedHits === null) {
                        return reject();
                      }

                      results = results.concat(modifiedHits);
                      return resolve(execute());
                    });
                  });

              } else {
                results = results.concat(hits);
                return execute();
              }

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

/**
 *
 * @param callback
 */
ElasticAll.prototype.each = function(callback) {

    if(typeof callback !== 'function') {
      console.error('elastic-all#each: Please specify a function.')
      return this;
    }

    this.onEachFn = callback;

    return this;
}

module.exports = new ElasticAll();
