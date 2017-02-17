# Image Comparison Server

A small NodeJS image comparison program with a simple ui and an api. Works currently only with png files. It offers the following features:

1. The server lets you compare images against reference images. Every time a reference image and another image have the same name, a new images which contains the differences will be created together with some additional information (e.g. the percentual pixel difference of those images). This may be useful, if you have a "good" set of screenshots of an application which can be used as reference and want to compare them against a new set to detect ui regressions.
2. An ui which lets you view those images and trigger different actions, like "compare all images", "make image to reference image" or "delete" such a result set. The ui will only display images where the percentual pixel difference between reference and new image was higher than the configured value.
3. An api which lets you access the image comparison functionality directly, e.g. to connect it with jenkins to run the tests regularly.

## Installation

1. Use the `npm install` command in the project root folder to install all needed dependencies.
2. Configure the application by renaming the "default-example.json" to "default.json". See the chapter "Configuration" for more information.
3. Start the application by using the command `node ./bin/www` in the root folder.
4. The ui should be accessible via "http://127.0.0.1:xxxx/gui", where xxxx is the configured port in the configuration file.
5. The api should be accessible via "http://127.0.0.1:xxxx/api", where xxxx is the configured port in the configuration file.

## UI

The ui is accessible via "http://127.0.0.1:xxxx/gui", where xxxx is the configured port in the configuration file. E.g. "http://127.0.0.1:3000/gui".
The ui consists of the following:

1. Some meta information concerning all image diff sets, e.g. the creation timestamp or the biggest percentual pixel difference of all image sets.
2. A button to trigger the image comparison of all images which are in the reference/new image folder. The path to those image folders can be configured in the configuration file. Images in the reference/new folder with the same file name will be compared. Depending on the size and number of images, the time to finish that comparison can take up a couple of minutes. Because of that, the button triggers a fire and forget action. You have to refresh the page in order to see if the results are available.
3. A table with 3 columns. The images can be enlarged by a click on them.
    1. The reference image. Displays the reference image and some meta information about it. That is what the new image should look like. If the delete button is clicked, the reference, new and diff images will be deleted (if the exist).
    2. The new image. Displays the new image and some meta information about it. That is what the new image looks like. The image can be made the new reference image by clicking on the add button.
    3. The diff image. Displays the diff image which visualizes the differences between the reference and the new image and some meta information (percentual pixel difference, ...) about it.

## Configuration

In order to configure this project, rename the file "default-example.json" in the "config" folder to "default.json". Open it and you can configure the following stuff:

1. "server" 
    1. "port": The port under which the application is reachable. Default value  is 3000.
    2. "timeoutInMs": The timeout in milliseconds for the requests for that the response needs a lot of computation time (e.g. the "calculateDifferencesForAllImages" request). Used to avoid connection timeouts. The default value is 600000. 
    3. "workingMode": Determines the working mode. If the value is set to 0 and the server is already processing a request, then incoming requests will be discarded. If the value is 1 and the server is already processing a request, then incoming requests will be stored in a queue and will be processed via the fifo principle. Default value is 0.
    4. "maxNumberOfStoredJob": The maximum number of jobs which will be stored in the job history. The history will be saved to disc, if a requests was processed successfully and loaded when the server starts. Default value is 10.
2. "images"
    1. "referenceImageFolder": The folder in which the application will search for the reference images. Default value is "./public/images/reference". It is encouraged to not change this value, because the images must be in the public folder for the ui.
    2. "newImageFolder": The folder in which the application will search for the new images. Default value is "./public/images/new". It is encouraged to not change this value, because the images must be in the public folder for the ui.
    3. "resultImageFolder": The folder in which the diff images will be saved. Default value is "./public/images/diff". It is encouraged to not change this value, because the images must be in the public folder for the ui.
    4. "jobHistoryFilePath": The path to where the information about the job history will be saved in the JSON format. If the file does not exist, it will be created. It contains all informations about the stored jobs, like the number of processed images, their percentual differences etc. Default value is "./data/metaInformation.json".
3. "thresholds"
    1. "maxPercentualImagePixelDifference": The maximum percentual pixel difference which is allowed before the image will be stored as "too different" and be accessible via api or ui. Default value is "0.15". Can be between 0 and 100.
    2. "maxImageImageDistanceDifference": The maximum hamming distance which is allowed before the image will be stored as "too different" and be accessible via api or ui. Default value is "0.15". Can be beween 0 and 100.
4. "options"
    1. "autoCrop": The reference/new images will be cropped to avoid problems with images which only differ a litte bit in size and thus will be automatically atted to the "too different" images (e.g. one image which has a little more whitespace on the upper side). Default value is "false". Can be "true" or "false".
    
## API

The program offers a small api which lets you access the server functionality directly without using the ui. The api is accessible via "http://127.0.0.1:xxxx/api", where xxxx is the configured port in the configuration file. E.g. "http://127.0.0.1:3000/api".
Every response contains a job object which contains all information about the job which is currently being executed or the last executed job. An example of the job object can be found in the example section.

### Requests/Responses

1. Starts a job to compare all images in the reference image folder against the images in the new image folder.
    1. Type: POST
    2. URL: http://127.0.0.1:xxxx/api/checkAll
    3: Additional return values: 
        2. "isThresholdBreached": Boolean which indicates if the distance of pixel difference threshold was breached by any image.
2. Makes a new image to a reference image.
    1. Type: PUT
    2. URL: http://127.0.0.1:xxxx/api/:id/makeToNewReferenceImage
        1. :id: The id of the image set.
2. Deletes an image set including all images of that set and the meta data about that set.
    1. Type: DELETE
    2. URL: http://127.0.0.1:xxxx/api/:id
        1. :id: The id of the image set.
2. Returns the currently executed job or if none is running, the last executed job.
    1. Type: GET
    2. URL: http://127.0.0.1:xxxx/api/

### Example

The request
```
http://127.0.0.1:3000/api/72a21520-ec81-11e6-9631-b913296dd823/makeToNewReferenceImage
```

might result in this response 

```
{message: 'OK', data: jobObject}
```

where the job object might look like that:

```
{
    "jobName": "MakeToNewBaselineImage",
        "processedImageCount": 1,
        "imagesToBeProcessedCount": 1,
        "imageMetaInformationModel": {
          "biggestPercentualPixelDifference": 100,
          "biggestDistanceDifference": 100,
          "timeStamp": "2017-02-07T08:27:49.673Z",
          "imageSets": [
            {
              "difference": 0,
              "distance": 0,
              "error": "",
              "id": "72a21520-ec81-11e6-9631-b913296dd823",
              "referenceImage": {
                "height": 1218,
                "width": 1280,
                "name": "imageName.png",
                "path": "pathToImage"
              },
              "newImage": {
                "height": 1218,
                "width": 1280,
                "name": "imageName.png",
                "path": "pathToImage"
              },
              "diffImage": {
                "height": 1218,
                "width": 1280,
                "name": "imageName.png",
                "path": "pathToImage"
              }
            },
            ...
        ]
}
```

Note: "imageSets" contains all image sets, even if the job did nothing with them. 