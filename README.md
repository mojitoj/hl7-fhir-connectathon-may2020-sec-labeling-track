# HL7® FHIR® Connectathon May 2020 Security Labeling Track
This repository hosts the technical requirements and test artifacts for the Security Labeling Track of the HL7® FHIR® Connectathon in May 2020.

## Goal
The goal of the track is to test the capabilities of a FHIR® server in processing [Security Labels](https://www.hl7.org/fhir/security-labels.html) in accordance with the [FHIR® Data Segmentation for Privacy Implementation Guide](http://build.fhir.org/ig/HL7/fhir-security-label-ds4p/branches/master/index.html)(DS4P IG).

## Requirements
The following are the minimum requirements for this track:
- The FHIR Server must provide a `CapabilityStatement` resource at the `/metadata` endpoint with an `implementationGuide` attribute that includes the following: 
```
http://hl7.org/fhir/uv/security-label-ds4p/ImplementationGuide/hl7.fhir.uv.security-label-ds4p
```
- The FHIR Server is capable of accepting labeled resources including labels bearing the extensions defined by the DS4P IG by ensuring the labels (including the extensions) are persisted.

- The FHIR Server enforces the `1..1` cardinality constraint for confidentiality labels by either:
  - Rejecting a labeled resource that does not bear a confidentiality label, or
  - Labeling the resource after accepting it and assigning a confidentiality label to it.

- The FHIR Server is capable of adding high-watermark confidentiality label to a response bundle based on the contents of the bundle. 

- (bonus) Supporting high-watermark on the response bundle for other types security labels.
