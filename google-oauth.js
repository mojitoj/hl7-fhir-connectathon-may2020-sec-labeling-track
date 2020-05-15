const superagent = require("superagent");
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_OAUTH_ENDPOINT = process.env.GOOGLE_OAUTH_ENDPOINT;

async function getToken() {
  const response = await superagent
    .post(GOOGLE_OAUTH_ENDPOINT)
    .query({ grant_type: "client_credentials" })
    .set("Authorization", `Basic ${GOOGLE_CLIENT_SECRET}`)
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send({ grantType: "client_credentials", scopes: "user/*.*" });

  return response.body.access_token;
}

module.exports = getToken;
