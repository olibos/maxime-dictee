<script lang="ts">
  import { text } from "svelte/internal";
import SpeechAnimation from "./Components/SpeechAnimation.svelte";
  import { delay } from "./helpers/delay";
  import { shuffle } from "./helpers/shuffle";
  import { speak } from "./helpers/speak";

  const words = ["les vacances", "joyeuses Pâques", "les cloches"];

  let index = -2;
  let answer = "";
  let score = 0;

  async function start() {
    index = -1;
    shuffle(words);
    await speak`Bonjour Maxime!${500}Que le jeu commence!${200}`;
    await speak(`Il y a ${words.length} mots a trouver`);
    index = 0;
    await repeat();
  }

  async function repeat() {
    words[index] && (await speak(words[index]));
  }

  async function validate(e: Event) {
    try {
		e.preventDefault();
      answer = answer.replace(/\s+/g, " ").trim();
      if (words[index] === answer) {
        score++;
        await speak`Félicitation c'est la bonne réponse!`;
      } else {
        await speak`Dommage, ça sera pour une prochaine fois!`;
      }
    } finally {
      index++;
      answer = "";
    }

    repeat();
  }

  async function gameOver() {
    await speak`C'est fini!${200}Tu as obtenu:`;
    await speak(`${score} sur ${words.length}.`);
    index = -2;
	score = 0;
  }

  $: if (index == words.length) {
    gameOver();
  }
</script>

<main>
  <h1>Maxime: Dictée</h1>
  {#if index == -2}
    <h2>Bienvenue dans le jeu de la dictée.</h2>
    <button on:click={start}>Démarrer</button>
  {:else if index >= 0 && index < words.length}
    <form on:submit={validate}>
      <input type="text" bind:value={answer} />
      <button type="button" on:click={repeat}>Écouter à nouveau</button>
      <button type="submit">Valider</button>
    </form>
  {/if}
  {#if index >= 0}
    <div id="score">
      {score} / {words.length}
    </div>
  {/if}
  <SpeechAnimation waveColor="red" />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
