const _ = require("lodash");
const superagent = require("superagent");
const OAUTH_MODULE = process.env.OAUTH_MODULE;
const getToken = OAUTH_MODULE ? require(`./${OAUTH_MODULE}`) : () => "";

const DS4P_IG =
  "http://hl7.org/fhir/uv/security-label-ds4p/ImplementationGuide/hl7.fhir.uv.security-label-ds4p";
const FHIR_BASE = process.env.FHIR_BASE;

describe("CapabilityStatement", () => {
  it("provides a compliant CapabilityStatement at the metadata endpoint", async () => {
    expect.assertions(2);
    const token = await getToken();

    const response = await superagent
      .get(`${FHIR_BASE}/metadata`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(response.body.implementationGuide).toBeDefined();
    expect(response.body.implementationGuide).toEqual(
      expect.arrayContaining([DS4P_IG])
    );
  });
});

describe("Accepting and persisting labeled resources including extensions", () => {
  beforeAll(async () => {
    const bundle = require("./resources/r-labeled-bundle.json");
    const token = await getToken();
    return superagent
      .post(FHIR_BASE)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(bundle)
      .retry(2);
  });

  it("extension-must-display", async () => {
    expect.assertions(2);
    const token = await getToken();
    const response = await superagent
      .get(`${FHIR_BASE}/Patient`)
      .query({
        identifier: "http:/example.org/fhir/ids|fhir-ds4p-example-patient"
      })
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    const patient = response.body.entry[0].resource;

    expect(patient).toBeDefined();
    expect(patient.meta.extension).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url:
            "http://hl7.org/fhir/uv/security-label-ds4p/StructureDefinition/extension-must-display"
        })
      ])
    );
  });

  it("extension-sec-label-basis", async () => {
    expect.assertions(2);
    const token = await getToken();
    const response = await superagent
      .get(`${FHIR_BASE}/Observation`)
      .query({
        identifier:
          "http:/example.org/fhir/ids|fhir-ds4p-example-extension-sec-label-basis"
      })
      .set("Authorization", `Bearer ${token}`);

    const observation = response.body.entry[0].resource;
    expect(observation).toBeDefined();
    expect(observation.meta.security).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extension: [
            {
              url:
                "http://hl7.org/fhir/uv/security-label-ds4p/StructureDefinition/extension-sec-label-basis",
              valueCoding: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "42CFRPart2"
              }
            }
          ]
        })
      ])
    );
  });

  it("extension-sec-label-related-artifact", async () => {
    expect.assertions(2);
    const token = await getToken();
    response = await superagent
      .get(`${FHIR_BASE}/Observation`)
      .query({
        identifier:
          "http:/example.org/fhir/ids|fhir-ds4p-example-extension-sec-label-related-artifact-consent"
      })
      .set("Authorization", `Bearer ${token}`);

    const observation = response.body.entry[0].resource;
    expect(observation).toBeDefined();
    expect(observation.meta.security).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extension: [
            {
              url:
                "http://hl7.org/fhir/uv/security-label-ds4p/StructureDefinition/extension-sec-label-related-artifact",
              valueRelatedArtifact: {
                type: "justification",
                url: "http://example.fhir.org/base/Consent/218304"
              }
            }
          ]
        })
      ])
    );
  });

  it("extension-sec-label-classifier", async () => {
    expect.assertions(2);

    const token = await getToken();
    response = await superagent
      .get(`${FHIR_BASE}/Observation`)
      .query({
        identifier:
          "http:/example.org/fhir/ids|fhir-ds4p-example-extension-sec-label-classifier"
      })
      .set("Authorization", `Bearer ${token}`);

    const observation = response.body.entry[0].resource;
    expect(observation).toBeDefined();
    expect(observation.meta.security).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extension: [
            {
              url:
                "http://hl7.org/fhir/uv/security-label-ds4p/StructureDefinition/extension-sec-label-classifier",
              valueContributor: {
                type: "reviewer",
                name: "John Doe",
                contact: [
                  {
                    name: "John Doe",
                    telecom: [
                      {
                        system: "email",
                        value: "john@doe.com",
                        use: "work"
                      }
                    ]
                  }
                ]
              }
            }
          ]
        })
      ])
    );
  });
});

describe("Enforce confidentiality label cardinality rules", () => {
  it("any labeled resource must have confidentiality label", async () => {
    const bundle = require("./resources/i-labeled-bundle.json");
    expect.assertions(2);
    const token = await getToken();

    await superagent
      .post(FHIR_BASE)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send(bundle);

    const response = await superagent
      .get(`${FHIR_BASE}/Observation`)
      .query({
        identifier:
          "http:/example.org/fhir/ids|fhir-ds4p-example-extension-sec-label-related-artifact-provenance"
      })
      .set("Authorization", `Bearer ${token}`);

    const observation = response.body.entry[0].resource;
    expect(observation).toBeDefined();
    expect(observation.meta.security).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          system: "http://terminology.hl7.org/CodeSystem/v3-Confidentiality"
        })
      ])
    );
  });
});

describe("Confidentiality high watermark on bundles", () => {
  it("Bundles are labeled with high watermark confidentiality label based on contents", async () => {
    const bundle = require("./resources/i-labeled-bundle.json");
    expect.assertions(2);
    const token = await getToken();

    await superagent
      .post(FHIR_BASE)
      .set("Content-Type", "application/json")
      .send(bundle)
      .set("Authorization", `Bearer ${token}`);

    const response = await superagent
      .get(`${FHIR_BASE}/Observation`)
      .query({
        identifier:
          "http:/example.org/fhir/ids|fhir-ds4p-example-extension-sec-label-related-artifact-provenance"
      })
      .set("Authorization", `Bearer ${token}`);

    const responseBundle = response.body;
    expect(responseBundle).toBeDefined();
    expect(responseBundle.meta.security).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          system: "http://terminology.hl7.org/CodeSystem/v3-Confidentiality"
        })
      ])
    );
  });
});
