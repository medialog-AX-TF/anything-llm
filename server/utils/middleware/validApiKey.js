const { ApiKey } = require("../../models/apiKeys");
const { SystemSettings } = require("../../models/systemSettings");

async function validApiKey(request, response, next) {
  const multiUserMode = await SystemSettings.isMultiUserMode();
  response.locals.multiUserMode = multiUserMode;

  const auth = request.header("Authorization");
  const bearerKey = auth ? auth.split(" ")[1] : null;
  if (!bearerKey) {
    response.status(403).json({
      error: "No valid api key found.",
    });
    return;
  }

  const apiKey = await ApiKey.get({ secret: bearerKey });
  if (!apiKey) {
    response.status(403).json({
      error: "No valid api key found.",
    });
    return;
  }

  // Store API key information for later use
  response.locals.apiKey = apiKey;
  response.locals.bearerKey = bearerKey;

  next();
}

module.exports = {
  validApiKey,
};
