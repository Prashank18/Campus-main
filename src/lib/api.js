export async function readApiResponse(response, fallbackMessage = "The request could not be completed.") {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    if (response.status === 404) {
      throw new Error("This API is not deployed. The production backend needs to be configured.");
    }
    throw new Error(`The server returned an unexpected response (HTTP ${response.status}).`);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned invalid JSON. Please try again later.");
  }

  if (!response.ok) {
    throw new Error(result.error || fallbackMessage);
  }
  return result;
}
