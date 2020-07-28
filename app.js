const fs = require("fs");
const { Storage } = require("@google-cloud/storage");
const CloudStorageInterface = require("./cloudStorageInterface.js");
const contentfulExport = require("contentful-export");

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */



exports.contentfulSpaceBackUp = (req, res) => {
  const options = {
    spaceId: "vr47kl32v074",
    managementToken: "CFPAT--94N3UmNuLlgFS-EFqsNI9c9gaFgY0Q-SAWGFLJ6GcI"
  } 


 let test = req.get(contentfulExport(options)
    .then((result) => {
      console.log("Your space data:", result);
    })
    .catch((err) => {
      console.log("Some errors occurred", err);
    }))
  console.log("*****", test);
}

console.log(contentfulExport());

