<script>
	import { onMount } from "svelte";
	import DiceBox from "@3d-dice/dice-box";
	import debug from "debug";

	const info = debug("app:i:page");
	const verbose = debug("app:v:page");

	let message = "";
	let passcode = "";
	let messages = [];
	let rooms = [];
	let clientId;
	let socket;
	let currentRoom;

	function connect() {
		socket = new WebSocket(`ws://${location.host}/ws`);


		socket.onopen = () => {
			console.log("WebSocket connection established.");
		};

		socket.onmessage = (message) => {
			const event = JSON.parse(message.data);
			console.log("Received message:", event.type);
			messages = [message.data, ...messages];

			if ("connected" === event.type || "rooms" === event.type) {
				rooms = event.rooms;
				clientId = event.clientId;
			}

			if ("joined-room" === event.type) {
				currentRoom = event.id;
				console.log("Joined room", event.id);
			}
		};

		socket.onclose = () => {
			console.log("WebSocket connection closed.");
		};
	}

	const sendMessage = () => {
		if (message.trim() !== "") {
			socket.send(`{"type":"message","message":"${message}"}`);
			message = "";
		}
	};

	const createRoom = () => {
		console.log("Create room");
		socket.send(`{"type":"create-room"}`);
	};

	const leaveRoom = () => {
		console.log("Leave room");
		socket.send(`{"type":"leave-room"}`);
	};

	const listRooms = () => {
		console.log("Create room");
		socket.send(`{"type":"rooms"}`);
	};

	const ping = () => {
		console.log("ping");
		socket.send(`{"type":"ping"}`);
	};

	const joinRoom = () => {
		console.log("Join room");
		if (passcode.trim() !== "") {
			socket.send(`{"type":"join-room","passcode":"${passcode}"}`);
			passcode = "";
		}
	};

	const joinRoomById = (roomId) => {
		console.log("Join room by id", roomId);
		socket.send(`{"type":"join-room-by-id", "id": "${roomId}"}`);
	};

	const compareDiceRolls = (from, to) => {
		return to.map((value, index) => from[index] > value);
	}

	const dice = new DiceBox("#dice", {
		assetPath: "/public/assets/",
		themeColor: "#ff006e",
		scale: 8,
		startingHeight: 3,
		mass: 3,
		gravity: 2,
		shadowTransparency: .8,
		linearDamping: .1,
		offscreen: false,
		onRollComplete: (event) => {
			const [from, to] = event;
			const fromRolls = from.rolls.map((roll) => roll.value).toSorted().reverse();
			const toRolls = to.rolls.map((roll) => roll.value).toSorted().reverse();
			const winMap = compareDiceRolls(fromRolls, toRolls);
			const won = winMap.filter(Boolean).length;
			const lost = winMap.length - won;
			info(`${won} win(s)`);
			info(`${lost} loss(es)`);
			messages = [`{"type": "roll-dice", "player": "from", rolls: [${fromRolls}] }`, ...messages];
			info("FROM Territory roll complete", fromRolls);
			verbose(from);
			messages = [`{"type": "roll-dice", "player": "to", rolls: [${toRolls}] }`, ...messages];
			info("TO Territory roll complete", toRolls);
			verbose(to);
			messages = [`{"type":"roll-result","player":"from","won":${won},"lost":${lost}}`, ...messages];
		}
	});

	const rollDice = async () => {
		await Promise.all([dice.roll("3d6"), dice.add("2d6", {
			themeColor: "#9651fd"
		})]);
	};

	const clearDice = () => {
		dice.clear();
	}

	onMount(async () => {
		connect();
		await dice.init();
		await rollDice();
	});
</script>

<main class="container mx-auto">
<!--	<h1 class="text-xl font-semibold my-8">DHBW WebSocket Client</h1>-->
	<!-- region Messages -->
	<div id="messages" class="fixed bottom-20 top-20 left-10 right-10 rounded-md p-6">
		{#each messages as message}
			<pre class="text-pretty break-all font-mono">{message}</pre>
		{/each}
		{#if rooms.length > 0}
			<div class="rooms my-8 grid gap-3 grid-cols-5">
				{#each rooms as room (room)}
					<button class="text-center bg-amber-200 rounded-md p-8 cursor-pointer"
									on:click={() => joinRoomById(room)}>{room}</button>
				{/each}
			</div>
		{/if}
	</div>
	<!-- endregion -->
	<!-- region Dice Canvases -->
	<div class="w-full">
		<div id="dice" class="absolute inset-0 w-full"></div>
	</div>
	<!-- endregion -->
	<!-- region Button Bar -->
	<section class="fixed rounded-lg shadow-lg bottom-0 right-0 p-6 bg-white my-8 grid grid-cols-2 gap-2 opacity-80 hover:opacity-100">
		<form class="flex gap-2" on:submit|preventDefault={sendMessage}>
			<input bind:value={message} type="text" class="px-4 py-2 rounded-md flex-1 border-2 outline-violet-300"
						 placeholder="Type your message">
			<button class="px-4 py-2 rounded-md bg-violet-300" id="sendButton">Send</button>
		</form>
		<form class="flex gap-2" on:submit|preventDefault={joinRoom}>
			<input bind:value={passcode} type="text" minlength="4" maxlength="4"
						 class="uppercase px-4 py-2 rounded-md flex-1 border-2 outline-teal-300"
						 placeholder="XXXX">
			<button class="px-4 py-2 rounded-md bg-teal-300 text-teal-800">Join</button>
		</form>
		<button on:click={createRoom} class="px-4 py-2 rounded-md bg-amber-300 outline-2">Create room
		</button>
		<button on:click={listRooms} class="px-4 py-2 rounded-md bg-amber-300 outline-2">List rooms</button>
		<button on:click={ping} class="px-4 py-2 rounded-md bg-gray-300 outline-2">ping</button>
		<button on:click={leaveRoom} class="px-4 py-2 rounded-md bg-red-300 text-red-800 outline-2">Leave
		</button>
		<button on:click={rollDice} class="px-4 py-2 rounded-md bg-emerald-300 text-emerald-800 outline-2">
			Roll dice
		</button>
		<button on:click={clearDice} class="px-4 py-2 rounded-md bg-emerald-300 text-emerald-800 outline-2">
			Clear dice
		</button>
	</section>
	<!-- endregion -->
</main>