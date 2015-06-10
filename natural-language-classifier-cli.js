/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
'use strict';

var app_args = require('optimist').argv;
var fs = require('fs');
var async = require('async');
var natural_language_classifier = require('./creds.js');

var main_help = '\nIBM Watson Natural Language Classifier Service\n\nUsage: \n';
var train_help = '\t Create: \t node natural-language-classifier-cli.js create [-d JSON_DATA | -f JSON_FILE] \n';
var status_help = '\t Status: \t node natural-language-classifier-cli.js status [-c CLASSIFIER_ID]\n';
var classify_help = '\t Classify: \t node natural-language-classifier-cli.js classify [-c CLASSIFIER_ID] [-t QUESTION_TEXT] \n';
var list_help = '\t List: \t\t node natural-language-classifier-cli.js list\n';
var delete_help = '\t Delete: \t node natural-language-classifier-cli.js delete [-c CLASSIFIER_ID]\n';
var blind_help = '\t Blind: \t node natural-langauge-classifier-cli.js blind [-c CLASSIFIER_ID] [-d JSON_DATA | -f JSON_FILE] [-x CSV_OUTPUT_FILE:optional] [-j JSON_OUTPUT_FILE:optional]\n';

var help = main_help + train_help + status_help + classify_help + list_help + delete_help + blind_help;
if ((app_args.h) || (app_args.help)) {
  callHelp();
}

switch (app_args._[0]) {
  case 'create':
    if (!app_args.d && !app_args.f) {
      callHelp();
    }
    if (app_args.f && !app_args.d) {
      fs.readFile(app_args.f, 'utf8', function(err, data) {
        if (err) {
          return console.log('Unable to read the file :', app_args.f);
        }
        create(JSON.parse(data));
      });
    } else if (app_args.d && !app_args.f) {
      create(JSON.parse(app_args.d));
    }

    break;
  case 'classify':
    if (!app_args.c || (!app_args.t)) {
      callHelp();
    }
      classify(app_args.c, app_args.t);
    break;
  case 'status':
    if (!app_args.c) {
      callHelp();
    }
    getStatus(app_args.c);
    break;
  case 'list':
    getList();
    break;
  case 'delete':
    if (!app_args.c) {
      callHelp();
    }
    deleteClassifier(app_args.c);
    break;
  case 'blind':
    if (!app_args.c) {
      callHelp();
    }
    if (!app_args.d && !app_args.f) {
      callHelp();
    }
    if (app_args.f && !app_args.d) {
      fs.readFile(app_args.f, 'utf8', function(err, data) {
        if (err) {
          return console.log('Unable to read the file :', app_args.f);
        }
        blind(app_args.c, JSON.parse(data), app_args.x, app_args.j);
      });
    } else {
      blind(app_args.c, app_args.d, app_args.x, app_args.j);
    }
    break;
  default:
    console.log(help);
}

function callHelp() {
  console.log(help);
  process.exit(0);
}

function classify(classifierId, text) {
  var params = {
    classifier: classifierId,
    text: text
  };
  natural_language_classifier.classify(params, function(err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(response);
  });
}

function create(classifierData) {
  natural_language_classifier.create(classifierData, function(err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(response);
  });
}

function getStatus(classifierId) {
  natural_language_classifier.status({ classifier: classifierId }, function(err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(response);
  });
}

function deleteClassifier(classifierId) {
  natural_language_classifier.remove({ classifier: classifierId }, function(err, response) {
    if (err)
      console.log('error:', err);
    else if(Object.keys(response).length===0)
    console.log('Classifier \''+classifierId+'\' deleted');
    else
      console.log(response);
  });
}

function getList() {
  natural_language_classifier.list(null, function(err, response) {
    if (err)
      console.log('error:', err);
    else
      console.log(response);
  });
}

function resultsToCSV(csvfile, results, callback) {
  var output = 'text, top_class, exact_match, top_3, top_5, match_fail\n';
  results.forEach(function (elem) {
    output = output + [
        '"' + elem.text + '"',
        elem.top_class,
        elem.exact_match?1:0,
        elem.top3?1:0,
        elem.top5?1:0,
        elem.match_fail?1:0].join(', ') + '\n';
  });
  fs.writeFile(csvfile, output, function (err) {
    if (err) {
      console.error('error writing CSV file: ', err);
    }
    callback();
  })
}

function blind(classifierId, classifierData, outputCSV, outputJSON) {
  if (!classifierData.training_data) {
    console.err('Please ensure that the data to test is formatted as training data');
  }

  async.map(
    classifierData.training_data,
    function(elem, callback) {
      natural_language_classifier.classify(
        {classifier: classifierId, text: elem.text},
        function (err, response) {
          if (err) {
            console.log('error:', err);
            callback(err, null);
          } else {
            var matches = response.classes.map(function (d) { return d.class_name; });
            response.exact_match = elem.classes.indexOf(response.top_class) !== -1;
            response.class_matches = elem.classes.map(function (elem) { return {class_name: elem, match_index: matches.indexOf(elem)}});
            response.top3 = response.class_matches.filter(function (d) { return d.match_index > -1 && d.match_index < 3}).length > 0;
            response.top5 = response.class_matches.filter(function (d) { return d.match_index > -1 && d.match_index < 3}).length > 0;
            response.match_fail = response.class_matches.filter(function (d) { return d.match_index > -1 }).length === 0;
            callback(null, response);
          }
        }
      )
    },
    function (err, results) {
      if (err) {
        console.log('there was an error: ', err);
      } else {
        if (outputCSV || outputJSON) {
          async.parallel([
            function writeCSV (callback) {
              if (!outputCSV) {
                callback();
              } else {
                resultsToCSV(outputCSV, results, callback);
              }
            },
            function writeJSON (callback) {
              if (!outputJSON) {
                callback();
              } else {
                fs.writeFile(outputJSON, JSON.stringify(results), function (err) {
                  if (err) {
                    console.error('error writing json file: ', err);
                  }
                  callback();
                });
              }
            }
          ])
        }
        var accuracy = results.reduce(function (c, p) { return c + p.exact_match; }, 0) / results.length;
        console.log('accuracy: ', accuracy);
      }
    }
  );
}
