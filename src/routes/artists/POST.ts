import { RouteHandler } from "../../types/http";
import { sendJSON } from "../router";

export const post: RouteHandler = async (req, res, url) => {
    console.log("post invoked!")
    sendJSON(res, 200, {message: 'POST Worked'});
}