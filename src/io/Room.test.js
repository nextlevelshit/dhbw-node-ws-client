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
	});

	test("should start with no clients", () => {
	});

	test("should add a client when join is called", () => {
	});

	test("should remove a client when leave is called", () => {
	});

	test("should not remove a client when leave is called with an unknown id", () => {
	});

	test("should broadcast a message to all clients", () => {
	});

	test("should handle multiple clients joining the room", () => {
	});

	test("should handle multiple clients leaving the room", () => {
	});

	test("should not add a client when join is called with an existing id", () => {
	});

	test("should not broadcast a message if there are no clients", () => {
	});

	test("should not crash when leave is called and there are no clients", () => {

	});

	test("should not crash when leave is called with a null id", () => {

	});

	test("should not crash when join is called with a null WebSocket", () => {

	});

	test("should send pulse event to client", () => {
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
	});
});
