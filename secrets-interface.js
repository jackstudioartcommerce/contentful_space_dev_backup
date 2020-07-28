const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const clientAdmin = new SecretManagerServiceClient({
	keyFilename: './credentials/service-account_secrets-admin.json',
	projectId: process.env.GCLOUD_PROJECT
});
const clientAccessor = new SecretManagerServiceClient({
	keyFilename: './credentials/service-account_secrets-accessor.json',
	projectId: process.env.GCLOUD_PROJECT
});

var SecretsInterface = {

	keys:{},

	create: async function(parent, key, value) {

		console.log(parent, key);

		// Create the secret with automation replication.
		const [secret] = await clientAdmin.createSecret({
			parent: parent,
			secret: {
				name: key,
				replication: {
					automatic: {},
				},
			},
			key
		});

		console.info(`Created secret ${secret.name}`);
		
		// Add a version with a payload onto the secret.
		const [version] = await clientAdmin.addSecretVersion({
			parent: secret.name,
			payload: {
				data: Buffer.from(value, 'utf8')
			}
		});

		console.info(`Added secret version ${version.name}`);

		return version;
		
	},

	listVersions: async function(key) {

		
		let parent = 'projects/' + process.env.GCLOUD_PROJECT + '/secrets/' + key;

		// Access the secret.
		const [accessResponse] = await clientAdmin.listSecretVersions({
			parent: parent,
		});

		return accessResponse;

	},

	getVersion: async function(key, parent) {
		// Access the secret.
		const [accessResponse] = await clientAccessor.accessSecretVersion({
			name: parent,
		});

		const responsePayload = accessResponse.payload.data.toString('utf8');

		this.keys[key] = responsePayload;

		return responsePayload;
	},

	get: async function(key, version) {
		let self = this;

		if(this.keys.hasOwnProperty(key)) {
			return this.keys[key];
		} else {
			return self.listVersions(key)
			.then(function(results) {
				// let parent = 'projects/' + process.env.GCLOUD_PROJECT + '/secrets/' + key + '/versions/' + version;
				let parent = null;
				for(let i=0, l=results.length; i<l; ++i) {
					if(results[i]['state'] === 'ENABLED') {
						parent = results[i]['name'];
						break;
					}
				}
				return self.getVersion(key, parent);
					
			});
			
		}

	}
}

module.exports = SecretsInterface;