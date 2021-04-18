<script lang="ts">
  import { Game, CANVAS } from "phaser";
  import { Example } from "../Scenes/Example";
  let innerWidth:number;
  export function success()
  {
    game.events.emit('success');
  }

  export function fail()
  {
    game.events.emit('fail');
  }
  let game: Game;
  function phaser(canvas: HTMLCanvasElement, width:number) {
    function setup(width: number)
    {
      game && game.destroy(false);
      game = new Game({
        type: CANVAS,
        canvas,
        width: width,
        height: 600,
        pixelArt: true,
        scene: [Example],
        physics: {
          default: "arcade",
          //arcade:{debug:true}
        },
      });
    }

    setup(width);
    return {
      update(width)
      {
        setup(width);
      },
      destroy() {
        game.destroy(false);
      },
    };
  }
</script>

<svelte:window bind:innerWidth />
<canvas width={innerWidth} height="600" use:phaser={innerWidth} />
