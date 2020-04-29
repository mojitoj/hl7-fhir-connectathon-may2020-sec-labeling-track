const _ = require("lodash");
const superagent = require("superagent");

const DS4P_IG =
  "http://hl7.org/fhir/uv/security-label-ds4p/ImplementationGuide/hl7.fhir.uv.security-label-ds4p";
const FHIR_BASE = process.env.FHIR_BASE;

describe("CapabilityStatement", () => {
  it("provides a compliant CapabilityStatement at the metadata endpoint", async () => {
    expect.assertions(2);

    const response = await superagent.get(`${FHIR_BASE}/metadata?_format=json`);

    expect(response.body.implementationGuide).toBeDefined();
    expect(response.body.implementationGuide).toEqual(
      expect.arrayContaining([DS4P_IG])
    );
  });
});
