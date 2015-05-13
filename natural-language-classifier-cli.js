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
var natural_language_classifier = require('./creds.js');

var main_help = '\nIBM Watson Natural Language Classifier Service\n\nUsage: \n';
var train_help = '\t Create: \t node natural-language-classifier-cli.js create [-d JSON_DATA | -f JSON_FILE] \n';
var status_help = '\t Status: \t node natural-language-classifier-cli.js status [-c CLASSIFIER_ID]\n';
var classify_help = '\t Classify: \t node natural-language-classifier-cli.js classify [-c CLASSIFIER_ID] [-t QUESTION_TEXT] \n';
var list_help = '\t List: \t\t node natural-language-classifier-cli.js list\n';
var delete_help = '\t Delete: \t node natural-language-classifier-cli.js delete [-c CLASSIFIER_ID]\n';

var help = main_help + train_help + status_help + classify_help + list_help + delete_help;
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
