import z from "zod";
import { addArtistService } from "../../services/addArtistService.js";
import type { RouteHandler } from "../../types/http.js";
import { sendJSON } from "../router.js";

// Zod Schemas for parsing body/input
export const AddMusicArtistSchema = z
  .object({
    genre: z.string().min(1, "Genre is required"),
    artist: z.string().min(1, "Artist is required"),
  })
  .strict();

export type AddMusicArtistInput = z.infer<typeof AddMusicArtistSchema>;

// Route Handler, parses the JSON body and passes it to the addArtistService
export const post: RouteHandler = async (req, res, _url) => {
  // Process body
  let bodyParams = {};
  try {
    const bodyText = await new Promise<string>((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        resolve(data);
      });
      req.on("error", (err) => {
        reject(err);
      });
    });
    bodyParams = JSON.parse(bodyText);
  } catch (_error) {
    sendJSON(res, 400, { error: "Invalid JSON body" });
    return;
  }
  const parsedBody = AddMusicArtistSchema.safeParse(bodyParams);
  if (!parsedBody.success) {
    sendJSON(res, 400, {
      error: "Invalid body parameters",
      details: parsedBody.error.errors,
    });
    return;
  }
  // Here you would typically add the artist to your data store
  try {
    addArtistService(parsedBody.data.genre, parsedBody.data.artist);
    // biome-ignore lint/suspicious/noExplicitAny: Need to access error.message property
  } catch (error: any) {
    if (error.message.includes("already exists in")) {
      sendJSON(res, 409, { error: error.message });
      return;
    }
    sendJSON(res, 400, { error: error.message });
    return;
  }
  sendJSON(res, 201, { message: "Artist added successfully" });
};
