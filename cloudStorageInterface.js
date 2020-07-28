const fs = require('fs');
const stream = require('stream');
// Imports the Google Cloud client library
const { Storage } = require('@google-cloud/storage');
// Creates a client from a Google service account key.
const storage = new Storage({keyFilename: "./credentials/service-account_cloud-storage-object-admin.json"});

const CloudStorageInterface = {

	upload: function(bucketName, filename, payloadAsStringOrBuffer, makePublic) {

		let myStream = payloadAsStringOrBuffer;

		if(!Buffer.isBuffer(payloadAsStringOrStream)) {
			// Initiate the source
			myStream = new stream.PassThrough();

			// Write your buffer
			myStream.end(new Buffer.from(payloadAsStringOrBuffer));

		}

		return new Promise((resolve, reject) => {

			const bucket = storage.bucket(bucketName);
			
			const file = bucket.file(filename);

			storage
			.bucket(bucketName)
			.file(filename)
			.makePrivate()
			.then(function() {
				myStream
				.pipe(file.createWriteStream({ gzip: true, metadata: { "cacheControl": "public, max-age=300" } }))
				.on('error', function(error) {
					console.error('CloudStorageInterface.upload() -> error', error);
					reject(error);
				})
				.on('finish', function() {
					console.log('CloudStorageInterface.upload() -> finished');

					if(typeof makePublic != 'undefined' && makePublic === true) {

						storage
						.bucket(bucketName)
						.file(filename)
						.makePublic()
						.then(function(response) {
							console.log('CloudStorageInterface.makePublic() -> finished');
							resolve(true);
						})
						.catch(function(error) {
							console.error('CloudStorageInterface.makePublic() -> error', error);
							reject(error);
						});
					} else {
						resolve(true);
					}
					
				});				
			})
			.catch(function(error) {
				console.error('CloudStorageInterface.upload() -> error', error);
				reject(error);
			});
		});

	}

};

module.exports = CloudStorageInterface;
