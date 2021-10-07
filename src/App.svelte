<script lang="ts">
  import SpeechAnimation from "./Components/SpeechAnimation.svelte";
  import { shuffle } from "./helpers/shuffle";
  import { speak } from "./helpers/speak";
  import { scale } from "svelte/transition";
  import Game from "./Components/Game.svelte";
  import { initializeApp } from "firebase/app";
  import { getFirestore, collection, setDoc, getDocs, deleteDoc, doc } from "firebase/firestore/lite"
  let words: {value:string, hint:string}[] = [];
  const firebaseConfig = {
  apiKey: "AIzaSyDyuQc6i4RsMpvW5Yg7ObdBoYvJf9SSt08",
  authDomain: "maxime-5f3e2.firebaseapp.com",
  projectId: "maxime-5f3e2",
  storageBucket: "maxime-5f3e2.appspot.com",
  messagingSenderId: "251167109033",
  appId: "1:251167109033:web:10d05ba210282a04d2deb8"
  };

  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const wordCollection = collection(firestore, 'words');
  getDocs(wordCollection).then(r => r.docs.map(d => d.data()).filter(d => d.value).map(({value, hint = value}) => ({value, hint}))).then(w => words = w);
  let game: Game;
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
    words[index] && (await speak(words[index].hint));
  }

  async function validate(e: Event) {
    try {
      const element = (document.activeElement as unknown) as HTMLOrSVGElement;
      element.blur && element.blur();
      e.preventDefault();
      answer = answer.replace(/\s+/g, " ").trim();
      if (words[index].value === answer) {
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

  function handleChange(e:InputEvent & {currentTarget:HTMLInputElement})
  {
    if (!e.currentTarget.value)
    {
      return;
    }

    const word = words[index].value;
    if (!word.startsWith(e.currentTarget.value))
    {
      e.currentTarget.value = answer;
      game.fail();
    }else{
      game.success();
      answer = e.currentTarget.value;
    }
  }

  $: if (index == words.length) {
    gameOver();
  }
  $:answerField && (answerField.type = 'text');
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
	  	  class="answer"
        type="password"
        value={answer}
        bind:this={answerField}
        on:input={handleChange}
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
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
        <li transition:scale>{word.value}</li>
      {/each}
    </ul>
  {/if}
  <SpeechAnimation waveColor="#8502d9" />
</main>
<Game bind:this={game} />

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
    background: rgba(255, 255, 255, 0.5);
    border: solid 1px #8502d9;
    border-radius: 10px;
    padding: 5px 30px;
    font-weight: bold;
  }

  .answer {
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
    main,
    .answer {
      max-width: none;
    }
  }
</style>
