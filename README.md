# Image Comparison Server

A small NodeJS image comparison program with a straightforward UI and an API. It currently only supports the PNG file format and offers the following features:

1. The server compares images against reference images. Every time a reference image and another image have the same file name, a new image is created. The newly created image contains the visual differences of both. Also, some additional information is generated, e.g. the percentual pixel difference of those images. One potential use case is the detection of UI regressions in an application.
2. The UI enables you to view these images and trigger actions like "Compare all images", "Make image to reference image" or "Delete a result set". The UI will only display those images that have a percentual pixel difference between reference above the configured value.
3. The API lets you access the image comparison functionality directly, e.g. to connect it with a CI server like Jenkins.

## ToDo for FE Rework:

1. Refactor folder structure
2. Check tsconfig
3. Remove old PUG stuff
4. Check/Adapt routing
5. Refactor package.json
6. Update Favicon
7. Check fetch dependency in package.json if needed
8. Rename interfaces to IInterfaceName
9. Use proper typing for callbacks
10. Clean up server API 

## Installation

1. Use the `npm install` command in the project root folder to install all needed dependencies.
2. Configure the application by renaming the "default-example.json" to "default.json". See the chapter "Configuration" for more information.
3. Start the application by using the command `node ./bin/www` in the root folder.
4. The UI is accessible via "http://127.0.0.1:xxxx/gui", where xxxx is the configured port in the configuration file.
5. The API is accessible via "http://127.0.0.1:xxxx/api", where xxxx is the configured port in the configuration file.

## UI

The UI is accessible via "http://127.0.0.1:xxxx/gui", where xxxx is the configured port in the configuration file, e.g. "http://127.0.0.1:3000/gui".
It consists of the following:

1. Meta information concerning all image diff sets, e.g. the creation timestamp or the biggest percentage pixel difference of all image sets.
2. A button to trigger the image comparison of all images which are in the reference and new image folder. The path to those folders can be configured in the configuration file. Images in the reference and the new folder with the same file name will be compared. Depending on the size and number of images, the time to finish that comparison can take a couple of minutes.
3. A pane with tabs which lets you 
    1. chose between failed, passed and all images.
    2. manage projects. There will always be a default project which can be renamed but not deleted. The feature makes it possible assign images to different projects for better management. Image names should be unique to avoid collision.
4. An overview table with these 3 columns: reference, new and diff. All images can be enlarged by clicking on them. It is possible to change the assigned project via the dropdown menu.
    1. The reference image column displays the reference image and some meta information about it. That is what the new image should look like. If the "Delete" button is clicked, the reference, new and diff images will be deleted. If the "Modify Ignore Areas" button is clicked, it is possible to define areas in which the images will not compared by clicking on the image and keeping the mouse button pressed until you are satisfied with the area. Similiar with the "Modify Check Areas" button. Can be used to defined areas for comparison. If at least one is defined everything outside will be ignored.
    2. The new image column displays the new image and some meta information about it. That is what the new image looks like. This image can be made to the new reference image by clicking on the "Add" button.
    3. The diff image column displays the diff image, which visualizes the differences between the reference and the new image and some meta information (percentual pixel difference, ...) about it.

## Configuration

In order to configure this project, rename the file "default-example.json" in the "config" folder to "default.json". Open it and you can configure:

1. "server" 
    1. "port": The port under which the application is reachable. The default value  is 3000.
    2. "timeoutInMs": The timeout in milliseconds for the requests/responses, which need a lot of computation time (e.g. the "calculateDifferencesForAllImages" request). This is used to avoid connection timeouts. The default value is 600000. 
    3. "workingMode": Determines the working mode. If the value is set to 0 and the server is already processing a request, incoming requests will be discarded. If the value is 1 and the server is already processing a request, incoming requests will be stored in a queue and will be processed via the FIFO principle. The default value is 1.
    4. "maxNumberOfStoredJob": The maximum number of jobs which will be stored in the job history. The history will be saved to disc, when a requests was processed successfully and loaded when the server starts. The default value is 10.
    5. "maxImageSize": The maximum allowed size in MB which is allowed for an imaged send via API.
2. "images"
    1. "referenceImageFolder": The folder in which the application will search for the reference images. Default value is "./public/images/reference". It is encouraged to not change this value, because the images must be in the public folder for the UI.
    2. "newImageFolder": The folder in which the application will search for the new images. Default value is "./public/images/new". It is encouraged to not change this value, because the images must be in the public folder for the UI.
    3. "resultImageFolder": The folder in which the diff images will be saved. Default value is "./public/images/diff". It is encouraged to not change this value, because the images must be in the public folder for the UI.
    4. "jobHistoryFilePath": The path to where the information about the job history will be saved in the JSON format. If the file does not exist, it will be created. It contains all information about the stored jobs, like the number of processed images, their percentual differences etc. Default value is "./data/metaInformation.json".
3. "thresholds"
    1. "maxPercentualImagePixelDifference": The maximum percentual pixel difference, which is allowed before the image will be stored as "too different" and be accessible via API or UI. The default value is "0.15". It can be between 0 and 100.
    2. "maxImageImageDistanceDifference": The maximum Hamming distance, which is allowed before the image will be stored as "too different" and be accessible via API or UI. The default value is "0.15". It can be beween 0 and 100. Note: Currently not used anymore because of unpredictable results.
4. "options"
    1. "autoCrop": The reference and the new images will be cropped to avoid problems with different image sizes. Cuts images to the smallest possible size. If checkAreas are defined, the image will be cut further to focus on those areas. The default value is "true". It can be "true" or "false".
    2. "displayMarkedAreas": Draws rectangles to indicate ignore or check areas. check areas are green and ignore areas are red.
    
## API

The program offers a small API, which lets you access the server functionality directly without using the UI. The API is accessible via "http://127.0.0.1:xxxx/api", where xxxx is the configured port in the configuration file, e.g. "http://127.0.0.1:3000/api".
Every response contains a job object, which contains all information about the currently/last executed job . An example of the job object can be found in the example section.

### Requests/Responses

1. Start a job to compare all images in the reference image folder against the images in the new image folder.
    1. Type: POST
    2. URL: http://127.0.0.1:xxxx/api/checkAll
    3. Additional return values: 
        2. "isThresholdBreached": Boolean which indicates if the Hamming distance or pixel difference threshold was breached by any of the compared images.
2. Make a new image to a reference image.
    1. Type: PUT
    2. URL: http://127.0.0.1:xxxx/api/:id/makeToNewReferenceImage
        1. :id : The id of the image set.
3. Compare a new image against a reference image by name and image type. If the reference image does not exist,
    the diff values will automatically set to 100.
    1. Type: PUT
    2. URL: http://127.0.0.1:xxxx/api/compareImageByName
    3. The request body must be in JSON format with the following properties:
        1. imageBase64: The new image, which should be compared to a reference image.
        2. imageName: The name of the image.
        3. imageType: The type of the image (png, ...)
        4. projectId: Project for which the comparison will be made. If not set, the default project will be used. The projectId can be viewed in the edit project panel.
4. Delete an image set including all images of that set and the meta data about that set.
    1. Type: DELETE
    2. URL: http://127.0.0.1:xxxx/api/:id
        1. :id : The id of the image set.
5. Return the currently executed job or if none is running, the last executed job.
    1. Type: GET
    2. URL: http://127.0.0.1:xxxx/api/
6. Add a new project.
    1. Type: POST
    2. URL: http://127.0.0.1:xxxx/api/addProject
    3. The request body must be in JSON format with the following properties:
        1. name: The name the newly created project should have.
7. Modify an existing project.
    1. Type: PUT
    2. URL: http://127.0.0.1:xxxx/api/:id/editProject
        1. :id : The id of the project which should be modified.
    3. The request body must be in JSON format with the following properties:
        1. name: The new name the project should have.
8. Delete an existing project.
    1. Type: DELETE
    2. URL: http://127.0.0.1:xxxx/api//:id/removeProject
        1. :id : The id of the project which should be deleted.
6. Assign an image set to another project.
    1. Type: PUT
    2. URL: http://127.0.0.1:xxxx/api/:id/assignImageSetToProject
        1. :id : The id of the image set which should be assigned to another project.
    3. The request body must be in JSON format with the following properties:
        1. projectIdFrom: The project id to which the image set currently belongs.
        2. projectIdTo: The project to which the image set should be assigned.
7. Add ignore areas
	1. Type: PUT
	2: URL: http://127.0.0.1:xxxx/api/:id/modifyIgnoreAreas
		1. :id : The id of the image set for which the areas should be set.
	3. The request body must be in JSON format with the following property:
		1. ignoreAreas: Example value: [{height: 100, id: -1, width: 100, x: 0, y: 0, z: 100}]
8. Add check areas
	1. Type: PUT
	2: URL: http://127.0.0.1:xxxx/api/:id/modifyCheckAreas
		1. :id : The id of the image set for which the areas should be set.
	3. The request body must be in JSON format with the following property:
		1. checkAreas: Example value: [{height: 100, id: -1, width: 100, x: 0, y: 0, z: 100}]	

### Example

The request
```
http://127.0.0.1:3000/api/72a21520-ec81-11e6-9631-b913296dd823/makeToNewReferenceImage
```

might result in this response 

```
{message: 'OK', data: jobs}
```

where the jobs might look like that:

```
[
    {
        "jobName": "MakeToNewBaselineImage",
        "processedImageCount": 1,
        "imagesToBeProcessedCount": 1,
        "imageManipulator": {},
        "imageMetaInformationModel": {
          "biggestPercentualPixelDifference": 0,
          "biggestDistanceDifference": 0,
          "percentualPixelDifferenceThreshold": 0.15,
          "distanceDifferenceThreshold": 0.15,
          "timeStamp": "17:38:58 09.11.2018",
          "projects": [
            {
              "name": "Default",
              "id": "0",
              "imageSets": [
                {
                  "difference": 0,
                  "distance": 0,
                  "error": "",
                  "isThresholdBreached": false,
                  "id": "c6528c1d-51ed-4c55-b0ca-9d909a138e0d",
                  "referenceImage": {
                    "height": 1000,
                    "width": 1000,
                    "name": "imageName.PNG",
                    "path": "pathToImage"
                  },
                  "newImage": {
                    "height": 1000,
                    "width": 1000,
                    "name": "imageName.PNG",
                    "path": "pathToImage"
                  },
                  "diffImage": {
                    "height": 1000,
                    "width": 1000,
                    "name": "imageName.PNG",
                    "path": "pathToImage"
                  },
                  "ignoreAreas": []
                },
                ...
              ]
            },
        ...
]

Note: "imageSets" contains all image sets, even if the job did nothing with them. 

Another small note: The client part has grown really really ugly. Will be refactored sometime in the far away future.

## Licence information
1. The ajax loading icon was created via http://loading.io/. 
2. All other icons are part of Font Awesome (https://fontawesome.com/)