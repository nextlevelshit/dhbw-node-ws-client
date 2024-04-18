import { ChatServer } from "./io/ChatServer.js";
import { serverPort } from "./config/constants.js";

new ChatServer(serverPort);
