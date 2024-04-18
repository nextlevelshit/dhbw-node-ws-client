import debug from "debug";
import { Actor, createActor } from "xstate";
import { State } from "./State.js";

const logger = debug("ws:i:room");
const verbose = debug("ws:v:room");

/**
 * Room class represents a chat room.
 * It manages the clients connected to the room and the room's context.
 */
export class Room {
	/**
	 * The context and game state of the room.
	 * @type {Actor}
	 */
	stateService;
	/**
	 * The clients connected to the room.
	 * @type {Map<string, WebSocket & {sendEvent:  (string, object) => void, roomId: string, id: string}>}
	 */
	clients;
	/**
	 * The four alphanumeric character long passcode for the room.
	 * @type string
	 *
	passcode;
	/**
	 * The unique identifier for the room.
	 * It is generated from the passcode.
	 * It is used to identify the room in the rooms map.
	 * It is also used to send messages to the room.
	 * It is sent to the client when they join the room.
	 * It is used to leave the room when the client disconnects.
	 * It is used to broadcast a user-left event to the other clients in the room.
	 * It is used to create a new room when the client creates a room.
	 * It is used to join a room when the client joins a room.
	 * It is used to find the room when the client leaves a room.
	 * It is used to find the room when the client sends a message to the room.
	 * It is used to find the room when the client updates the room's context.
	 * It is used to find the room when the client requests the list of rooms.
	 * It is used to find the room when the client requests the list of clients in the room.
	 * It is used to find the room when the client pings the server.
	 * It is used to find the room when the client sends an invalid event type.
	 * It is used to find the room when the client sends an error message.
	 * It is used to find the room when the client sends a message to the room.
	 * @type {string}
	 */
	id;

	/**
	 * Creates an instance of Room.
	 * @param stateService
	 */
	constructor(stateService) {
		this.passcode = Math.random().toString(36).substring(2, 6).toUpperCase();
		this.id = Buffer.from(this.passcode).toString("base64");
		this.clients = new Map();
		this.stateService = stateService;
		this.stateService.start();
		logger(this.id, "new room");
		verbose({ passcode: this.passcode });
		this.bootstrap();
	}

	bootstrap() {
		this.stateService.subscribe((snapshot) => {
			logger("state", snapshot?.value);
			verbose("players", snapshot?.context.players);
			verbose("currentPlayer", snapshot?.context.currentPlayer);
			verbose("scores", snapshot?.context.scores);
			this.broadcast("context", snapshot?.context);
		});
	}

	/**
	 * join method is called when a client joins the room.
	 * It adds the client to the clients map and sends a joined-room event to the client.
	 * @param {WebSocket & {sendEvent:  (string, object) => void, roomId: string, id: string}} ws - The WebSocket instance for the client.
	 */
	join(ws) {
		const clients = this.clients.set(ws.id, ws);
		ws.sendEvent("joined-room", { clients: clients.size, passcode: this.passcode, id: this.id });
		this.broadcast("user-joined", { clientId: ws.id, clients: clients.size });
		this.pulse(ws);
		this.stateService.send({ type: "JOIN", clientId: ws.id });
		logger("joined room", this.id);
		verbose({ clientId: ws.id, clients: clients.size });
	}

	/**
	 * leave method is called when a client leaves the room.
	 * It removes the client from the clients map and sends a left-room event to the client.
	 * It also broadcasts a user-left event to the other clients in the room.
	 * @param {string} clientId - The unique identifier for the client.
	 */
	leave(clientId) {
		const ws = this.clients.get(clientId);
		if (ws && this.clients.delete(clientId)) {
			this.stateService.send({ type: "LEAVE", clientId: ws.id });
			ws.sendEvent("left-room", { passcode: this.passcode, id: this.id });
			this.broadcast("user-left", { clientId, clients: this.clients.size });
		}
	}

	/**
	 * broadcast method is called to send a message to all clients in the room.
	 * It sends the message to each client in the clients map.
	 * @param {string} type - The event type
	 * @param {object} data - The message to send to the clients.
	 * @param {string} clientId - The unique identifier for the client that sent the message.
	 */
	broadcast(type, data) {
		[...this.clients.entries()].forEach(([, ws]) => ws.sendEvent(type, data));
	}

	/**
	 * @param {WebSocket & {sendEvent:  (string, object) => void, roomId: string, id: string}} ws - The WebSocket instance for the client.
	 */
	pulse(ws) {
		ws.sendEvent("pulse", { context: this.stateService, clients: [...this.clients.keys()] });
	}
}
