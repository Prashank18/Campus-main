import { handleAuth } from "../../server/auth.js";

export default function handler(request, response) {
  return handleAuth(request, response, "register");
}
