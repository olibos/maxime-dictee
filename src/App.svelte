<script lang="ts">
  import SpeechAnimation from "./Components/SpeechAnimation.svelte";
  import { shuffle } from "./helpers/shuffle";
  import { speak } from "./helpers/speak";
  import { scale } from "svelte/transition";

  const words = ["les vacances", "du chocolat", "les cloches", "avril", "la nature", "le poussin", "l'arbre", "joyeuses Pâques", "l'herbe", "une chasse", "déposer", "ramasser", "elles poussent", "ils cherchent", "ils ont trouvé"];

  let index = -2;
  let answer = "";
  let answerField: HTMLInputElement;
  let score = 0;

  async function start() {
    index = -1;
    shuffle(words);
    await speak`Bonjour Maxime!${500}Que le jeu commence!${200}`;
    await speak(`Il y a ${words.length} mots a trouver. Voici le premier mot:`);
    index = 0;
    await repeat();
  }

  async function repeat() {
    answerField && answerField.focus();
    words[index] && (await speak(words[index]));
  }

  async function validate(e: Event) {
    try {
      const element = (document.activeElement as unknown) as HTMLOrSVGElement;
      element.blur && element.blur();
      e.preventDefault();
      answer = answer.replace(/\s+/g, " ").trim();
      if (words[index] === answer) {
        score++;
        await speak`Félicitation c'est la bonne réponse!${200}`;
      } else {
        await speak`Dommage, ça sera pour une prochaine fois!${200}`;
      }
    } finally {
      index++;
      answer = "";
      if (words[index]) {
        await speak("Voici le nouveau mot:");
      }
    }

    repeat();
  }

  async function gameOver() {
    await speak`C'est fini!${200}Tu as obtenu:`;
    await speak(`${score} sur ${words.length}.`);
    index++;
    score = 0;
  }

  $: if (index == words.length) {
    gameOver();
  }
</script>

<!-- svelte-ignore a11y-autofocus -->
<main>
  <img src="/title.png" alt="Dictée" />
  {#if index == -2}
    <h2>Bienvenue dans le jeu de la dictée.</h2>
    <button on:click={start}>Démarrer</button>
  {:else if index >= 0 && index < words.length}
    <form on:submit={validate}>
      <input
        type="text"
        bind:value={answer}
        bind:this={answerField}
        autofocus
      />
      <hr />
      <button type="button" on:click={repeat} class="neutral">📢</button>
      <button type="submit" disabled={!answer}>Valider</button>
    </form>
  {:else if index > 0}
    <h2>Bienvenue dans le jeu de la dictée.</h2>
    <button on:click={start}>Nouvelle partie</button>
	<br />
  {/if}
  {#if index > 0}
    <ul>
      {#each words.slice(0, index) as word}
        <li transition:scale>{word}</li>
      {/each}
    </ul>
  {/if}
  <SpeechAnimation waveColor="red" />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 400px;
    margin: 0 auto;
  }

  ul {
    display: inline-block;
    text-align: left;
    background: #fff;
    border: solid 1px #8502d9;
    border-radius: 10px;
    padding: 5px 30px;
    font-weight: bold;
  }

  input[type=text]
  {
	border-radius: 20px;
    border-color: #ccc;
    padding: 10px;
    outline: none;
    text-align: center;
    width: 400px;
	max-width: 80vw;
    font-size: 1.1em;
    font-weight: bold;
  }

  @media (min-width: 640px) {
    main, input[type=text] {
      max-width: none;
    }
  }
</style>
