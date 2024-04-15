<script>
	import { onMount } from "svelte";

	let message = '';
	let passcode = '';
	let messages = [];
	let rooms = [];
	let clientId;
	let socket;
	let currentRoom;

	function connect() {
		socket = new WebSocket(`ws://${location.host}/ws`);


		socket.onopen = () => {
			console.log('WebSocket connection established.');
		};

		socket.onmessage = (message) => {
			const event = JSON.parse(message.data);
			console.log('Received message:', event.type);
			messages = [...messages, message.data];

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
			console.log('WebSocket connection closed.');
		};
	}

	const sendMessage = () => {
		if (message.trim() !== '') {
			socket.send(`{"type":"message","message":"${message}"}`);
			message = '';
		}
	};

	const createRoom = () => {
		console.log('Create room');
		socket.send(`{"type":"create-room"}`);
	};

	const leaveRoom = () => {
		console.log('Leave room');
		socket.send(`{"type":"leave-room"}`);
	};

	const listRooms = () => {
		console.log('Create room');
		socket.send(`{"type":"rooms"}`);
	};

	const ping = () => {
		console.log('ping');
		socket.send(`{"type":"ping"}`);
	};

	const joinRoom = () => {
		console.log('Join room');
		if (passcode.trim() !== '') {
			socket.send(`{"type":"join-room","passcode":"${passcode}"}`);
			passcode = '';
		}
	};

	const joinRoomById = (roomId) => {
		console.log('Join room by id', roomId);
		socket.send(`{"type":"join-room-by-id", "id": "${roomId}"}`);
	};

	onMount(() => {
		connect();
	});
</script>

<main class="container mx-auto">
	<h1 class="text-xl font-semibold my-8">DHBW WebSocket Client</h1>
	<div id="messages" class="rounded-md p-6  border-[1px]">
		{#each messages as message}
			<pre class="text-pretty break-all font-mono">{message}</pre>
		{/each}
		{#if rooms.length > 0}
			<div class="rooms my-8 grid gap-3 grid-cols-5">
				{#each rooms as room (room)}
					<button class="text-center bg-amber-200 rounded-md p-8 cursor-pointer" on:click={() => joinRoomById(room)}>{room}</button>
				{/each}
			</div>
		{/if}
	</div>
	<section class="sticky rounded-lg shadow-lg bottom-0 p-6 bg-white my-8 grid grid-cols-2 gap-2">
		<form class="flex gap-2" on:submit|preventDefault={sendMessage}>
			<input bind:value={message} type="text" class="px-4 py-2 rounded-md flex-1 border-2 outline-violet-300" id="messageInput" placeholder="Type your message">
			<button class="px-4 py-2 rounded-md bg-violet-300" id="sendButton">Send</button>
		</form>
		<form class="flex gap-2" on:submit|preventDefault={joinRoom}>
			<input bind:value={passcode} type="text" minlength="4" maxlength="4" class="uppercase px-4 py-2 rounded-md flex-1 border-2 outline-teal-300" id="passcodeInput" placeholder="XXXX">
			<button class="px-4 py-2 rounded-md bg-teal-300 text-teal-800" id="joinButton">Join</button>
		</form>
		<button on:click={createRoom} class="px-4 py-2 rounded-md bg-amber-300 outline-2" id="createRoom">Create room</button>
		<button on:click={listRooms} class="px-4 py-2 rounded-md bg-amber-300 outline-2" id="listRooms">List rooms</button>
		<button on:click={ping} class="px-4 py-2 rounded-md bg-gray-300 outline-2" id="ping">ping</button>
		<button on:click={leaveRoom} class="px-4 py-2 rounded-md bg-red-300 text-red-800 outline-2" id="leaveRoom">Leave room</button>
	</section>
</main>