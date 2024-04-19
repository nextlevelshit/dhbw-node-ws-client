import { Room } from "./Room.js";
import { jest, expect, describe, test, beforeEach } from "@jest/globals";

describe("Room", () => {
	let room;
	let ws;

	beforeEach(() => {
		const stateService = {
			start: jest.fn(),
			send: jest.fn(),
			subscribe: jest.fn()
		};
		room = new Room(stateService);
		ws = {
			id: "1",
			sendEvent: jest.fn()
		};
	});

	test("should generate a passcode and id on creation", () => {
		expect(room.passcode).toBeDefined();
		expect(room.id).toBeDefined();
	});

	test("should start with no clients", () => {
		expect(room.clients.size).toBe(0);
	});

	test("should add a client when join is called", () => {
		expect(room.clients.size).toBe(0);
		room.join(ws);
		expect(room.clients.size).toBe(1);
	});

	test("should remove a client when leave is called", () => {
		room.join(ws);
		expect(room.clients.size).toBe(1);
		room.leave(ws.id);
		expect(room.clients.size).toBe(0);
	});

	test("should not remove a client when leave is called with an unknown id", () => {
		room.join(ws);
		room.leave("eema");
		expect(room.clients.size).toBe(1);
	});

	test("should broadcast a message to all clients", () => {
		room.join(ws);
		room.broadcast("message", { message: "Hallöchen"});
		expect(ws.sendEvent).toBeCalledWith("message", { message: "Hallöchen"});
	});

	test("should handle multiple clients joining the room", () => {
		const ws2 = {
			id: "2",
			sendEvent: jest.fn()
		};
		room.join(ws);
		room.join(ws2);
		expect(room.clients.size).toBe(2);
	});

	test("should handle multiple clients leaving the room", () => {
		const ws2 = {
			id: "2",
			sendEvent: jest.fn()
		};
		room.join(ws);
		room.join(ws2);
		expect(room.clients.size).toBe(2);
		room.leave(ws.id);
		expect(room.clients.size).toBe(1);
		room.leave(ws2.id);
		expect(room.clients.size).toBe(0);
	});

	test("should not add a client when join is called with an existing id", () => {
		room.join(ws);
		expect(room.clients.size).toBe(1);
		room.join(ws);
		expect(room.clients.size).toBe(1);
	});

	test("should not broadcast a message if there are no clients", () => {
		room.broadcast("message", { message: "Hallöchen"});
		expect(ws.sendEvent).not.toBeCalled();
	});

	test("should not crash when leave is called and there are no clients", () => {
	});

	test("should not crash when leave is called with a null id", () => {
	});

	test("should not crash when join is called with a null WebSocket", () => {
	});

	test("should send pulse event to client", () => {
		room.join(ws);
		expect(room.clients.keys()).toContain(ws.id);
		room.pulse(ws);
		expect(ws.sendEvent).toBeCalledWith("pulse", { clients: [ws.id]});
	});

	// test("should subscribe to stateService updates and broadcast context", () => {
	// 	const mockSnapshot = {
	// 		value: "testValue",
	// 		context: {
	// 			players: ["player1", "player2"],
	// 			currentPlayer: "player1",
	// 			scores: { player1: 1, player2: 2 }
	// 		}
	// 	};
	//
	// 	// Mock the subscribe method to call the provided callback with the mockSnapshot
	// 	room.stateService.subscribe = jest.fn((callback) => callback(mockSnapshot));
	//
	// 	// Re-run the bootstrap method to set up the new subscription
	// 	room.bootstrap();
	//
	// 	// Check that subscribe was called on stateService
	//
	//
	// 	// Trigger a state update
	// 	room.stateService.send({ type: "UPDATE" });
	//
	// 	// Check that the context was broadcasted
	//
	// });

	test("should call stateService with JOIN when a client joins the room", () => {
		room.join(ws);
		expect(room.clients.keys()).toContain(ws.id);
		expect(room.stateService.send).toBeCalledWith({ type: "JOIN", clientId: ws.id});
	});
});
