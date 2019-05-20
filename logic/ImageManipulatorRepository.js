var CheckAllJobModel = require('./job/CheckAllJob');
var DeleteJob = require('./job/DeleteJob');
var MakeToNewReferenceImageJob = require('./job/MakeNewToReferenceImageJob');
var ModifyIgnoreAreasJob = require('./job/ModifyIgnoreAreasJob');
var ModifyCheckAreasJob = require('./job/ModifyCheckAreasJob');
var CompareImageByNameJob = require('./job/CompareImageByNameJob');
var AddProjectJob = require('./job/AddProjectJob');
var EditProjectJob = require('./job/EditProjectJob');
var RemoveProjectJob = require('./job/RemoveProjectJob');
var CleanUpProjectJob = require('./job/CleanUpProjectJob');
var AssignImageSetToProjectJob = require('./job/AssignImageSetToProjectJob');
var ImageManipulator = require('./ImageManipulator');
var logger = require('winston');
var config = require('./ConfigurationLoader');
var jobHandler = require('./JobHandler');

/**
 * Constructor.
 *
 * @constructor
 * **/
var ImageManipulatorRepository = function() {
	this.imageManipulator = new ImageManipulator();
};

/* ----- Methods ----- */

/**
 * Creates diff images for all images with the same name in the reference/new folders.
 *
 * @param {Boolean} autoCrop Enables if auto cropping should be used before comparing images.
 * @param {Number} pixDiffThreshold The allowed pixel percentage threshold. Should be between 0 and 1.
 * @param {Function} callback Called when the complete image comparison process is done. Has the updated image imageMetaInformationModel information model object as job.
 * **/
ImageManipulatorRepository.prototype.calculateDifferencesForAllImages = function(autoCrop, pixDiffThreshold, callback) {
	logger.info('---------- Start ----------', new Date().toISOString());
	var autoCropValue = autoCrop ? autoCrop : config.getAutoCropOption();
	var pixDiffThresholdValue = pixDiffThreshold ? pixDiffThreshold : config.getMaxPixelDifferenceThreshold();

	logger.info("----- Options Start -----");
	logger.info("Auto cropping is enabled: ", autoCropValue);
	logger.info("Threshold for pixel difference:", pixDiffThresholdValue);
	logger.info("----- Options End -----");

	// Add create diff images job to the job handler
	jobHandler.addJob(
			new CheckAllJobModel(autoCropValue, pixDiffThresholdValue, function(job) {
				logger.info('---------- End ----------', new Date().toISOString());
				var isBiggestPixelDiffThresholdBreached = job.getImageMetaInformationModel().getBiggestPercentualPixelDifference() > pixDiffThresholdValue;

				logger.info("Percentual pixel difference:"
							+ "\nThreshold breached " + isBiggestPixelDiffThresholdBreached
							+ "\nAllowed threshold: " + pixDiffThresholdValue
							+ "\nDifference:" + job.getImageMetaInformationModel().getBiggestPercentualPixelDifference());

				if(callback) {
					callback(job, isBiggestPixelDiffThresholdBreached);
				}
			})
	);
};

/**
 * Makes a new image to a reference image. Updates and save the imageMetaInformationModel information model.
 *
 * @param {String} id Id of the image set for which the new image should be made a reference image.
 * @param {Function} callback Called when the complete process is done. Has the job and updated image set as parameter.
 * **/
ImageManipulatorRepository.prototype.makeToNewReferenceImage = function(id, callback) {
	// Add create diff images job to the job handler
	jobHandler.addJob(
			new MakeToNewReferenceImageJob(id, function(job, updatedImageSet) {
											   if(callback) {
												   callback(job, updatedImageSet);
											   }
										   }
			));
};

/**
 * Deletes an image set. It will be removed from the image imageMetaInformationModel information structure, the structure will be saved to file
 * and the images will be deleted.
 *
 * @param id The id of the image set.
 * @param callback Called when the complete deletion process is done. Has the updated image imageMetaInformationModel information model object as job.
 * **/
ImageManipulatorRepository.prototype.deleteImageSetFromModel = function(id, callback) {
	// Add delete job to the job handler
	jobHandler.addJob(
			new DeleteJob(id, function(job) {
							  logger.info("Deleted image set with id: ", id);
							  if(callback) {
								  callback(job);
							  }
						  }
			));
};

/**
 * Returns the currently active job or if no job was active, the last executed job.
 *
 * @param {Function} callback The callback which the the currently active job or if no job was active, the last executed job as a parameter.
 * **/
ImageManipulatorRepository.prototype.getLastActiveJob = function(callback) {
	callback(jobHandler.getLastActiveJob());
};

/**
 * Sets the ignore areas for an image set.
 *
 * @param {String} id The id of the image set for which the ignore areas should be set.
 * @param {Object} ignoreAreas The ignore areas which should be set for the image set.
 * @param {Function} callback Called when the ignore areas were set. Has the updated image set as parameter.
 * **/
ImageManipulatorRepository.prototype.modifyIgnoreAreas = function(id, ignoreAreas, callback) {
	// Add modify ignore areas job to the job handler
	try {
		jobHandler.addJob(
				new ModifyIgnoreAreasJob(id, ignoreAreas, function(job) {
											 logger.info("Modified ignore areas for image set with id: " + id);
											 if(callback) {
												 var resultImageSet = jobHandler.getLastActiveJob().getImageMetaInformationModel().getImageSetById(id);
												 callback(resultImageSet);
											 }
										 }
				));
	} catch(exc) {
		logger.error('Error:', exc);
	}
};

/**
 * Sets the check areas for an image set.
 *
 * @param {String} id The id of the image set for which the ignore areas should be set.
 * @param {Object} checkAreas The check areas which should be set for the image set.
 * @param {Function} callback Called when the check areas were set. Has the updated image set as parameter.
 * **/
ImageManipulatorRepository.prototype.modifyCheckAreas = function(id, checkAreas, callback) {
	// Add modify check areas job to the job handler
	try {
		jobHandler.addJob(
				new ModifyCheckAreasJob(id, checkAreas, function(job) {
											logger.info("Modified check areas for image set with id: " + id);
											if(callback) {
												var resultImageSet = jobHandler.getLastActiveJob().getImageMetaInformationModel().getImageSetById(id);
												callback(resultImageSet);
											}
										}
				));
	} catch(exc) {
		logger.error('Error:', exc);
	}
};

/**
 * Returns the image set identified by a given id.
 *
 * @param {String} id The id of the image set.
 * @param {Function} callback Called with the image set as parameter.
 * **/
ImageManipulatorRepository.prototype.getImageSet = function(id, callback) {
	var resultImageSet = jobHandler.getLastActiveJob().getImageMetaInformationModel().getImageSetById(id);

	callback(resultImageSet);
};

/**
 * Add a new project to the image meta model.
 *
 * @param {String} projectName The name of the project to be added.
 * @param {Function} callback Called when finished. Has the job and the newly created project object as parameter.
 */
ImageManipulatorRepository.prototype.addProject = function(projectName, callback) {
	jobHandler.addJob(
			new AddProjectJob(projectName, function(job, newProject) {

								  logger.info("Added project " + projectName);

								  if(callback) {
									  callback(job, newProject);
								  }
							  }
			));
};

/**
 * Renames the given project.
 *
 * @param {String} projectId Project to be renamed.
 * @param {String} projectName New name of the project.
 * @param {Function} callback Called when finished. Has the job and a boolean (renaming was successful?) as parameter.
 */
ImageManipulatorRepository.prototype.editProject = function(projectId, projectName, callback) {
	jobHandler.addJob(
			new EditProjectJob(projectId, projectName, function(job, wasSuccessful) {

								   logger.info("Edited project " + projectId);

								   if(callback) {
									   callback(job, wasSuccessful);
								   }
							   }
			));
};

/**
 * Removes a project from the image manipulation repository.
 *
 * @param {String} projectId The project to be removed.
 * @param {Function} callback Called when finished. Has the job and a boolean (removing was successful?) as parameter.
 */
ImageManipulatorRepository.prototype.removeProject = function(projectId, callback) {
	jobHandler.addJob(
			new RemoveProjectJob(projectId, function(job, wasSuccessful) {

									 logger.info("Removed project " + projectId);

									 if(callback) {
										 callback(job, wasSuccessful);
									 }
								 }
			));
};

/**
 * Re-assigns an image set to another project.
 *
 * @param {String} imageSetId The image set that should be re-assigned.
 * @param {String} projectIdFrom The project to which the image set currently belongs.
 * @param {String} projectIdTo Project to which the image set should be moved to.
 * @param {Function} callback Called when finished. Has the job and a boolean (removing was successful?) as parameter.
 */
ImageManipulatorRepository.prototype.assignImageSetToProject = function(imageSetId, projectIdFrom, projectIdTo, callback) {
	jobHandler.addJob(
			new AssignImageSetToProjectJob(imageSetId, projectIdFrom, projectIdTo, function(job, wasSuccessful) {

											   logger.info("Moved imageSet " + imageSetId + " from project " + projectIdFrom + " to project " + projectIdTo);

											   if(callback) {
												   callback(job, wasSuccessful);
											   }
										   }
			));
};

/**
 * Removes all image sets from a certain project which reference image contains the image name.
 * It does not delete the images itself!
 *
 * @param imageName The image name contained in the reference images' name.
 * @param projectId The project id from which the image sets should be deleted from.
 * @param {Function} callback Called when the complete image comparison process is done. Has the updated image imageMetaInformationModel information model object as job.
 */
ImageManipulatorRepository.prototype.cleanUpProject = function(imageName, projectId, callback) {
	// Add cleanUp job to the job handler
	jobHandler.addJob(
			new CleanUpProjectJob(imageName, projectId, function(job) {
									  logger.info("Removes all imageSets containing the name: " + imageName + "from the project " + projectId + " without deleting the images itself.");
									  if(callback) {
										  callback(job, true);
									  }
								  }
			));
};

/**
 * Compares a new given image in Base64 encoding with a reference image with the same name.
 * If the reference image does not exist, the difference value will automatically be set to 100.
 *
 * @param {String} imageName The name of the image.
 * @param {String} imageType The type of the image (png, ...)
 * @param {String} imageBase64 The base 64 encoded image.
 * @param {String} projectId Project to be compared.
 * @param {Function} callback Called when the complete image comparison process is done. Has the updated image imageMetaInformationModel information model object as job.
 */
ImageManipulatorRepository.prototype.compareImageByName = function(imageName, imageType, imageBase64, projectId, callback) {

	jobHandler.addJob(
			new CompareImageByNameJob(imageName, imageType, imageBase64, projectId, function(job, resultImageSet) {

										  logger.info("Compared image " + imageName + "." + imageType + " with the threshold breached result: " + resultImageSet.isThresholdBreached);

										  if(callback) {
											  callback(job, resultImageSet.isThresholdBreached);
										  }
									  }
			));
};

module.exports = new ImageManipulatorRepository();