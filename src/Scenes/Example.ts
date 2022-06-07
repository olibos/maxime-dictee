import { Scene, Animations } from "phaser";
import { delay } from "../helpers/delay";

type PlayerState = "intro" | "walk" | "fly" | "landing" | "died";
const PLAYER_Y = 460;
const ROBOT_Y = 480;
const MAY_FLY = new Set<PlayerState>(['landing', 'walk']);

export class Example extends Scene
{
    preload()
    {
        this.load.atlas('mouse', 'assets/animations/dm_anims.png', 'assets/animations/dm_anims.json');
        this.load.atlas('robot', 'assets/animations/w1_robot.png', 'assets/animations/w1_robot.json');
        this.load.image('floor', 'assets/floor.png');
        this.load.image('background', 'assets/background.jpg');
        this.load.audio('jet_pack_launch', 'assets/jet_pack_launch.mp3');
        this.load.audio('jet_pack_loop', 'assets/jet_pack_loop.mp3');
        this.load.audio('ouch', 'assets/ouch.mp3');
    }
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    background: Phaser.GameObjects.TileSprite;
    floor: Phaser.GameObjects.TileSprite;
    fail()
    {
        const robot = this.physics.add.sprite(this.sys.game.config.width as number, ROBOT_Y, 'robot').play('attack').setFlipX(true);
        this.failedEnemies.add(robot);
        var toDestroy = [
            robot,
            this.tweens.add({
                targets: robot,
                x: -robot.width,
                ease: 'Linear',
                duration: (this.sys.game.config.width as number) / 0.4,
                onComplete: () =>
                {
                    toDestroy.forEach(i => i.destroy && i.destroy());
                    this.failedEnemies.remove(robot);
                }
            })];
    }
    success()
    {
        const robot = this.physics.add.sprite(this.sys.game.config.width as number, ROBOT_Y, 'robot').play('attack').setFlipX(true);
        const robots = [robot, ...this.failedEnemies.getChildren()];
        this.successEnemies.addMultiple(robots);
        const toDestroy = [
            robot,
            this.tweens.add({
                targets: robot,
                x: -robot.width,
                ease: 'Linear',
                duration: (this.sys.game.config.width as number) / 0.4,
                onComplete: () =>
                {
                    for (const robotToRemove of robots)
                    {
                        this.successEnemies.remove(robotToRemove);
                    }

                    toDestroy.forEach(i => i.destroy && i.destroy());
                }
            })
        ];
    }
    fly: Phaser.Sound.BaseSound;
    flyLoop: Phaser.Sound.BaseSound;
    failedEnemies: Phaser.GameObjects.Group;
    successEnemies: Phaser.GameObjects.Group;
    playerTween: Phaser.Tweens.Tween;
    state: PlayerState;
    setPlayerAnimation(state: PlayerState, config?: object | Phaser.Types.Tweens.TweenBuilderConfig, onStart?: () => void)
    {
        console.info('setPlayerAnimation', this.state, state);
        if (this.state === state)
        {
            return;
        }

        this.state = state;
        this.playerTween?.stop();
        if (config)
        {
            onStart?.();
            this.playerTween = this.tweens.add({ targets: this.player, ...config });
        }
    }

    intro()
    {
        let groundX = this.sys.game.config.width as number / 2;
        this.setPlayerAnimation(
            'intro',
            {
                scale: 1,
                ease: 'Linear',
                duration: 500,
                onComplete: () => this.state = 'walk'
            },
            () => this.player.play('walk').setX(groundX).setY(PLAYER_Y).setAngle(0).setScale(0));
    }
    create()
    {
        const fly = this.sound.add('jet_pack_launch');
        const flyLoop = this.sound.add('jet_pack_loop', { loop: true });
        this.fly = fly;
        this.flyLoop = flyLoop;
        console.info('scene', this);
        const background = this.background = this.add.tileSprite(0, 0, this.sys.game.config.width as number, this.sys.game.config.height as number, 'background');
        background.setOrigin(0, 0).setScrollFactor(0);
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNames('mouse', { prefix: 'DM_flying_scaled_', zeroPad: 2, start: 1, end: 6, suffix: '.png' }),
            repeat: -1,
            frameRate: 15
        });
        this.anims.create({
            key: 'float',
            frames: this.anims.generateFrameNames('mouse', { prefix: 'dm_float_', zeroPad: 2, start: 1, end: 5, suffix: '.png' }),
            repeat: -1,
            frameRate: 15
        });
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('mouse', { prefix: 'DM_walk_', zeroPad: 5, start: 0, end: 11, suffix: '.png' }),
            repeat: -1,
            frameRate: 15
        });

        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNames('robot', { prefix: 'robot anim_', zeroPad: 5, start: 0, end: 23, suffix: '.png' }),
            repeat: -1,
            frameRate: 15
        });

        let groundX = this.sys.game.config.width as number / 2;
        let ground = this.add.tileSprite(0, this.sys.game.config.height as number - 77, this.sys.game.config.width as number, this.sys.game.config.height as number, "floor").setOrigin(0, 0).setScrollFactor(0);
        this.floor = this.physics.add.existing(ground, true);
        this.failedEnemies = this.add.group();
        this.successEnemies = this.add.group();
        const player = this.physics.add.sprite(groundX, PLAYER_Y, 'mouse');
        this.player = player;
        this.intro();
        this.physics.add.collider(player, this.failedEnemies, () =>
        {
            this.setPlayerAnimation(
                'died',
                {
                    angle: 365,
                    scale: 0,
                    x: 0,
                    y: this.sys.game.config.height as number / 2,
                    ease: 'Linear',
                    duration: 1000,
                    onComplete: () => this.intro()
                },
                () =>
                {
                    player.play('float');
                    this.sound.play('ouch');
                });
        });

        this.sys.game.events.on('success', () =>
        {
            this.success();
        }).on('fail', () =>
        {
            this.fail();
        });
    }

    update(time, delta)
    {
        this.floor.tilePositionX += delta / 5;
        this.background.tilePositionX += delta / 15;

        const robots = this.successEnemies.getChildren() as Phaser.GameObjects.Sprite[];
        const minPlayerX = this.player.x - 100;
        const maxPlayerX = this.player.x + 300;
        if (robots.some(robot => robot.x > minPlayerX && robot.x < maxPlayerX) &&
            MAY_FLY.has(this.state))
        {
            this.setPlayerAnimation(
                'fly',
                {
                    y: PLAYER_Y - robots[0].height - 10,
                    ease: 'BounceIn',
                    duration: 500,
                    onStop: ()=>
                    {
                        this.fly.stop();
                        this.flyLoop.stop();
                    }
                },
                () =>
                {
                    this.fly.play();
                    this.flyLoop.play();
                    this.player.play('fly');
                });
        }

        if (this.state === 'fly' &&
            robots.every(robot => robot.x < minPlayerX || robot.x > maxPlayerX))
        {
            this.setPlayerAnimation(
                'landing',
                {
                    y: PLAYER_Y,
                    ease: 'BounceOut',
                    duration: 200,
                    onComplete: () =>
                    {
                        this.player.play('walk');
                        this.setPlayerAnimation("walk");
                    }
                },
                () =>
                {
                    this.fly.stop();
                    this.flyLoop.stop();
                });
        }

        super.update(time, delta);
    }
}