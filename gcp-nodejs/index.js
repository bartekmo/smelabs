// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application
const Compute = require('@google-cloud/compute');

const compute = new Compute();

function main() {
  const options = {
    maxResults: 3,
  };
  compute.getVMs(options)
    .then((data) => {
      data[0].forEach((item) => console.log(item));
    })
}

main()
