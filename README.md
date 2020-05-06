# HL7® FHIR® Connectathon May 2020 Security Labeling Track
This repository hosts the technical requirements and test artifacts for the Security Labeling Track of the HL7® FHIR® Connectathon in May 2020.

## Goal
The goal of the track is to test the capabilities of a FHIR® server in processing [Security Labels](https://www.hl7.org/fhir/security-labels.html) in accordance with the [FHIR® Data Segmentation for Privacy Implementation Guide](http://build.fhir.org/ig/HL7/fhir-security-label-ds4p/branches/master/index.html)(DS4P IG).

## Requirements
The participants are expected to provide a FHIR server that meets the requirements of the track. The following are the minimum requirements:
- The FHIR Server must provide a `CapabilityStatement` resource at the `/metadata` endpoint with an `implementationGuide` attribute that includes the following: 
```
http://hl7.org/fhir/uv/security-label-ds4p/ImplementationGuide/hl7.fhir.uv.security-label-ds4p
```
- The FHIR Server is capable of accepting labeled resources including labels bearing the extensions defined by the DS4P IG by ensuring the labels (including the extensions) are persisted.

- The FHIR Server enforces the `1..1` cardinality constraint for confidentiality labels by either:
  - Rejecting a labeled resource that does not bear a confidentiality label, or
  - Labeling the resource after accepting it and assigning a confidentiality label to it.

- The FHIR Server is capable of adding high-watermark confidentiality label to a response bundle based on the contents of the bundle. 

- (bonus) Supporting high-watermark on the response bundle for other types security labels (other than confidentiality).

## Running the Test Scripts
You can run the test scripts provided in this repository by following the steps below. As prerequisites, you will need `node.js` and `yarn` installed in your environment.
- Clone the repository and change directory to the repository:
```
git clone git@github.com:mojitoj/hl7-fhir-connectathon-may2020-sec-labeling-track.git
cd hl7-fhir-connectathon-may2020-sec-labeling-track
```
- Install the dependencies:
```
yarn install
```
- Create a config file named `.env.test` and set the value of `FHIR_BASE` to the base URL of your FHIR server (no trailing slash). See `.env.test.example` as an example.

```
echo FHIR_BASE=https://my-fhir-server.com/base > .env.test
```
- Run the tests and examine the results:
```
yarn test
```
