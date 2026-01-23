import { RouteHandler } from "../../types/http";
import { sendJSON } from "../router"

export const get: RouteHandler = async (req, res, url) => {
    console.log("get invoked!")
    sendJSON(res, 200, {message: 'GET Worked'});
}