# image_diff_server (WIP)

A small NodeJS image comparison program with a simple ui and an api. Works currently only with png files. It offers the following features:

1. An ui which lets you manage the comparison of images with the same name in two definable folders. The differences in those two images will be highlighted in a newly created image.
2. An api which lets you access the image comparison directly, e.g. to connect it with jenkins. Not finished yet.

## Installation

1. Use the `npm install` command in the project root folder to install all needed dependencies.
2. Configure the application by renaming the "default-example.json" to "default.json". See the chapter "Configuration" for more information.
3. Start the application by using the command `node ./bin/www` in the root folder.
4. The ui should be accessable via "http://127.0.0.1:xxxx/gui", where xxxx is the configured port in the configuration file.
5. The api should be accessable via "http://127.0.0.1:xxxx/api", where xxxx is the configured port in the configuration file.

## UI

The ui is accessable via "http://127.0.0.1:xxxx/gui", where xxxx is the configured port in the configuration file. E.g. "http://127.0.0.1:3000/gui".
The ui consists of the following:

1. Some meta information concerning all image diff sets, e.g. the creation timestamp or the biggest percentual pixel difference of all image sets.
2. A button to trigger the image comparison of all images which are in the reference/new image folder. The path to those image folders can be configured in the configuration file. Images in the reference/new folder with the same file name will be compared. Depending on the size and number of images, the time to finish that comparison can take up a couple of minutes. Because of that, the button triggers a fire and forget action. You have to refresh the page in order to see if the results are available.
3. A table with 3 columns. The images can be enlarged by a click on them.
    1. The reference image. Displays the reference image and some meta information about it. That is what the new image should look like. If the delete button is clicked, the reference, new and diff images will be deleted (if the exist).
    2. The new image. Displays the new image and some meta information about it. That is what the new image looks like. The image can be made the new reference image by clicking on the add button.
    3. The diff image. Displays the diff image which visualizes the differences between the reference and the new image and some meta information (percentual pixel difference, ...) about it.

## API
TBD

## Configuration

In order to configure this project, rename the file "default-example.json" in the "config" folder to "default.json". Open it and you can configure the following stuff:

1. "server" 
    1. "port": The port under which the application is reachable. Default value  is 3000.
2. "images"
    1. "referenceImageFolder": The folder in which the application will search for the reference images. Default value is "./public/images/reference". It is encouraged to not change this value, because the images must be in the public folder for the ui.
    2. "newImageFolder": The folder in which the application will search for the new images. Default value is "./public/images/new". It is encouraged to not change this value, because the images must be in the public folder for the ui.
    3. "resultImageFolder": The folder in which the diff images will be saved. Default value is "./public/images/diff". It is encouraged to not change this value, because the images must be in the public folder for the ui.
    4. "metaInformationFile": The path to where the meta information about the image diffs will be save in the JSON format. If the file does not exist, it will be created. It contains stuff like the images sizes, where the images are located etc. The file is used to persist those information and will be loaded if the application is started. The information in that file will be displayed in the ui. Default value is "./data/metaInformation.json".
3. "thresholds"
    1. "maxPercentualImagePixelDifference": The maximum percentual pixel difference which is allowed before the image will be stored as "too different" and be accessable via api or ui. Default value is "0.15". Can be beween 0 and 100.
    2. "maxImageImageDistanceDifference": The maximum hamming distance which is allowed before the image will be stored as "too different" and be accessable via api or ui. Default value is "0.15". Can be beween 0 and 100.
4. "options"
    1. "autoCrop": The reference/new images will be cropped to avoid problems with images which only differ a litte bit in size and thus will be automatically atted to the "too different" images (e.g. one image which has a little more whitespace on the upper side). Default value is "false". Can be "true" or "false".