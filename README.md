# Introduction
This is a command line interface (CLI) for the IBM Watson&trade; Natural Language Classifier service.

# Quick Start
If you are not following the tutorial, ensure that you complete the following steps:

1. Install [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.com/).
2. Checkout this repository.
3. `$ cd natural-language-classifier-cli`. Edit `creds.js` and enter the credentials from VCAP_SERVICES. For details, see [Obtain your Bluemix credentials](#stage-1-obtain-your-bluemix-credentials) in the tutorial.
4. `$ npm install --save`

For a list of available commands, run `$ node natural-language-classifier-cli.js --help`.

# Tutorial

The IBM Watson&trade; Natural Language Classifier tutorial guides you through the process of creating and setting up a classifier by using the Node.js wrapper command line interface. This tutorial teaches you how to create, train, and use a classifier.

In this tutorial, you train a classifier that can interpret a weather-related question and return either "temperature" or "condition." For example, for the question, "Is it windy," the system returns "conditions".  For the question, "Is it hot outside," the service returns "temperature".

***
## Before you begin
Ensure that you have the necessary prerequisites before you start the tutorial:

* You need a Bluemix account for this tutorial. If you don't have one, [sign up][sign_up]. For more details about the process, see [Developing Watson applications with Bluemix][dev_wdc_apps].
* The tutorial is designed to use the [Cloud-foundry CLI][cloud_foundry] tool. Download and install the tool if you haven't already.
* The tutorial uses [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.com/). Download and install those tools if you haven't already.


***

## Stage 1: Obtain your Bluemix credentials
Before you can work with a service in Bluemix, you must obtain your Bluemix credentials. If you already have your credentials for the Natural Language Classifier service, you can skip this step.

1. Log into Bluemix:
	1. Click the **LOG IN** button in the upper right-hand corner of the page at console.ng.bluemix.net.
	2. Enter your Bluemix ID and password on the authentication page.
2. Create an app:
	1. Click **Create an app**.
	2. Select **Web**.
	3. Select the starter **SDK for Node.js**, and click **Continue**.
	4. Type a unique name for your app, for example, `TutorialClassifier-<username>`, and click **Finish**.
	5. Select the button for **CF Command Line Interface**.
	6. Click **View App Overview**.
3. Add the Natural Language Classifier service to your app:
	1. Click **Add a service or API** on the app **Overview** page.
	2. In the Bluemix **Catalog**, select the Natural Language Classifier service. The service is located in the Bluemix Labs section of IBM Bluemix. Click **Bluemix Labs Catalog** at the bottom of the page.
	3. In the **Service name** field, type a unique name for the service instance, for example `Classifier-tutorial-<username>`, and click **Create**.
	4. The **Restage Application** window is displayed. Click **Restage** to restage your app.
3. Copy your credentials:
	1. In the tile for the Natural Language Classifier service, select the **Show Credentials** link to view your Bluemix credentials.
	2. Copy `username` and `password` from the credentials.


***

## Stage 2: Configure the code to connect to your service
Download the tutorial code and configure it. Install the node.js client.

1. Set up your environment:
	1. Download the `.zip` file that contains the source code from this project. If you are familiar with Git, fork the repository into your Git namespace or clone it to your local system.
	2. Extract the package to a new directory.

2. Change to the new directory that contains this tutorial, for example:

	```sh
	$ cd natural-language-classifier-nodejs-cli
	```

3. Modify the tutorial to use your credentials:
	1. Open the `creds.js` file with a text editor.
	2. Paste in your username and password credentials for the service from Stage 1. For example:

		```js
		var natural_language_classifier = watson.natural_language_classifier({
			username: '<username>',
			password: '<password>',
			version: 'v1'
		});
		```

	3. Save the `creds.js` file.

4. Install the Natural Language Classifier CLI:

	```node
	$ npm install --save
	```

***

## Stage 3: Create and train a classifier
The classifier learns from examples before it can return information for texts that it hasn't seen before. The example data is referred to as "ground truth". The ground truth is a set of text strings and one or more class identifiers. You upload the ground truth to use for training when you create a classifier.

To speed up this step, the `train.json` file is included the ground truth data. The file is already formatted to work with the Natural Language Classification service.


1. Connect to Bluemix with the Cloud-foundry CLI:

	```sh
	$ cf api https://api.ng.bluemix.net
	$ cf login -u <username>
	```

2. Run the following command to post the data and create the classifier.

	```node
	$ node natural-language-classifier-cli.js create -f resources/weather_data_train.json
	```

	The response includes the classifier ID and status. You need the ID for the following stages. To retrieve the ID and status of all your classifiers, you can use the `GET /v1/classifiers` method. To use the wrapper to list the classifiers, run the following command:

	```
	$ node natural-language-classifier-cli.js list
	```

***

## Stage 4: Monitor the training status of the classifier

The new classifier must finish training and return the status of `Available` before you can work with it.

1. Run the following command to retrieve the status of classifier that you created in the previous stage. Replace `<classifier_id>` with the ID of your classifier:

	```node
	$ node natural-language-classifier-cli.js status -c <classifier_id>
	```

2. Run this command until the status changes to `Available`. In this case, training takes about 6 minutes. If you see another status, look at the response to help identify the possible cause or issue.

***

## Stage 5: Use the classifier

Now that the classifier is trained, you can query it.

1. Run the following command for some weather-related questions to review how your classifier responds. Use the same classifier ID that you used in the previous stage. You can use a question from the `weather_data_test.txt` file in the `resources` directory, or provide your own weather-related questions:

	```node
	$ node natural-language-classifier-cli.js classify -c <classifier_id> -t "How hot will it be today?"
	```

	The API returns a reponse that includes the name of class for which the classifier has the highest confidence. Other class-confidence pairs are listed in descending order of confidence:

	```JSON
	{
    	"classifier_id": "10D41B-nlc-1",
    	"url": "https://gateway.watsonplatform.net/natural-language-classifier-experimental/api/v1",
    	"text": "How hot will it be today?",
    	"top_class": "temperature",
    	"classes": [
        	{
            	"class_name": "temperature",
            	"confidence": 0.9998201258549781
        	},
        	{
            	"class_name": "conditions",
            	"confidence": 0.00017987414502176904
        	}
    	]
	}
	```

2. Review the top class for the questions to see how the classifier is predicting them.

***

## Stage 6: Delete the tutorial classifier
You successfully completed the process of training and querying a classifier in the Natural Language Classifier service.

So that you can create classifiers for your own use and with your own ground truth, you might want to delete this classifier from the tutorial. To delete the classifier that you created in this tutorial, call the `DELETE v1/classifiers/{classifier_id}` method:

* Run the following command to delete the classifier. Replace `<classifier_id>` with the ID of your classifier:

	```node
	$ node natural-language-classifier-cli.js delete -c <classifier_id>
	```

	If the classifier is deleted, the response is an HTTP 200 code.

## What to do next

* For a deeper exploration into the service, see the [documentation][overview] for the Natural Language Classifier service.

* To explore the API in detail, see the [API reference][reference].

* Review the Natural Language Classifier [Nodes.js sample application](href="https://github.com/watson-developer-cloud/natural-language-classifier-nodejs) in the `watson-developer-cloud` namespace on GitHub.

[sign_up]: https://apps.admin.ibmcloud.com/manage/trial/bluemix.html?cm_mmc=WatsonDeveloperCloud-_-LandingSiteGetStarted-_-x-_-CreateAnAccountOnBluemixCLI
[dev_wdc_apps]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/getting_started/gs-bluemix.shtml
[cloud_foundry]: https://github.com/cloudfoundry/cli/releases
[overview]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/nl-classifier/
[reference]: http://watson.stage1.mybluemix.net/apis/#!/natural-language-classifier


