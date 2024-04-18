import { assign, createMachine } from "xstate";
import { initGameScore } from "../config/constants.js";
import debug from "debug";

const logger = debug("ws:i:state");
const verbose = debug("ws:v:state");

export const State = createMachine({
	id: "diceGame",
	initial: "waiting",
	context: {
		players: [],
		currentPlayer: null,
		scores: []
	},
	on: {
		LEAVE: {
			actions: assign({
				players: ({ context, event }) => {
					return context.players.filter((clientId) => clientId !== event.clientId);
				}
			})
		}
	},
	states: {
		waiting: {
			always: {
				target: "rolling",
				guard: ({ context }) => context.players.length >= 2
			},
			on: {
				JOIN: [
					{
						actions: assign({
							players: ({ context, event }) => [...context.players, event.clientId],
							scores: ({ context, event }) => ({ ...context.scores, [event.clientId]: initGameScore }),
							currentPlayer: ({ context }) => context.currentPlayer || context.players[0]
						}),
						target: "waiting"
					}
				]
			}
		},
		rolling: {
			always: {
				target: "waiting",
				guard: ({ context }) => context.players.length < 2
			},
			entry: assign({
				currentPlayer: ({ context }) => {
					return context.players[0];
				}
			}),
			on: {
				ROLL_RESULT: [
					{
						guard: ({ context, event }) => context.currentPlayer === event.clientId,
						actions: assign({
							scores: ({ context, event }) => {
								const opponentPlayer = context.currentPlayer === context.players[0] ? context.players[1] : context.players[0];
								return {
									...context.scores,
									[context.currentPlayer]: context.scores[context.currentPlayer] - event.lost,
									[opponentPlayer]: context.scores[opponentPlayer] - event.won
								};
							},
							currentPlayer: ({ context }) => {
								if (context.players[0] === context.currentPlayer) {
									return context.players[1];
								}
								return context.players[0];
							}
						})
					},
					{
						actions: ({ context, event }) => {
							logger("not your turn", event.clientId);
							verbose("current player", context.currentPlayer);
						}
					}
				]
			}
		},
		nextTurn: {
			on: {
				NEXT: "rolling",
				END: "end"
			}
		},
		end: {
			type: "final"
		}
	},
	actions: {
		updateScore: assign({
			scores: ({ context, event }) => {
				const newScores = { ...context.scores };
				newScores[event.clientId] = event.result;
				return newScores;
			}
		})
	}
});
