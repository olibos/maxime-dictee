import { Scene, Animations } from "phaser";
import { delay } from "../helpers/delay";

const PLAYER_Y = 456;
const ROBOT_Y = 456;

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
    animate = false;
    fail()
    {
        const robot = this.physics.add.sprite(-100, ROBOT_Y, 'robot').play('attack').setGravityY(100).setFlipX(true);
        var toDestroy = [
            robot,
            this.physics.add.collider(robot, this.floor),
            this.physics.add.collider(robot, this.player, () => 
            {
                if (this.player.anims.currentAnim.key !== 'float')
                {
                    this.player.play('float');
                    this.sound.play('ouch');
                    this.flyLoop.stop();
                }
            }),
            this.tweens.add({
                targets: robot.setX(this.sys.game.config.width as number).setY(ROBOT_Y),
                x: -robot.width,
                ease: 'Linear',
                duration: (this.sys.game.config.width as number) / 0.4,
                onComplete: () =>
                {
                    this.animate = false;
                    toDestroy.forEach(i => i.destroy && i.destroy());
                }
            })];
    }
    success()
    {
        const robot = this.physics.add.sprite(-100, ROBOT_Y, 'robot').play('attack').setGravityY(100).setFlipX(true);
        let done = false;
        const toDestroy = [
            robot,
            this.physics.add.collider(robot, this.floor),
            this.tweens.add({
                targets: robot.setX(this.sys.game.config.width as number).setY(ROBOT_Y),
                x: -robot.width,
                ease: 'Linear',
                duration: (this.sys.game.config.width as number) / 0.4,
                onUpdate: () =>
                {
                    if (done || robot.x > this.player.x + 500) return;
                    done = true;
                    this.player.play('fly');
                    this.player.setVelocityY(-160);
                    this.player.y -= 5;
                    if (!this.flyLoop.isPlaying)
                    {
                        this.fly.play();
                        this.flyLoop.play();
                    }
                },
                onComplete()
                {
                    toDestroy.forEach(i => i.destroy && i.destroy());
                }
            })
        ];
    }
    fly:Phaser.Sound.BaseSound;
    flyLoop:Phaser.Sound.BaseSound;
    create()
    {
        const fly = this.sound.add('jet_pack_launch');
        const flyLoop = this.sound.add('jet_pack_loop', {loop: true});
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
            frames: this.anims.generateFrameNames('mouse', { prefix: 'DM_walk_', zeroPad: 5, start: 0, end: 13, suffix: '.png' }),
            repeat: -1,
            frameRate: 15
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: 'mouse', frame: 'dm_jump_frame.png' }]
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

        const player = this.physics.add.sprite(groundX, PLAYER_Y, 'mouse').setGravityY(100);
        this.player = player;

        player.play('walk');
        this.physics.add.collider(player, ground, (a, b) =>
        {
            if (player.anims.currentAnim.key !== 'walk')
            {
                this.animate = false;
                this.flyLoop.stop();
                player.play('walk');
            }
        });

        this.sys.game.events.on('success', () =>
        {
            if (this.animate)
            {
                return;
            }
            this.success();
        }).on('fail', () =>
        {
            if (this.animate)
            {
                if (this.player.anims.currentAnim.key === 'fly')
                {
                    this.player.play('float');
                    this.flyLoop.stop();
                    this.sound.play('ouch');
                }
            }
            else
            {
                this.fail();
            }
        });
    }

    update(time, delta)
    {
        this.floor.tilePositionX += delta / 5;
        this.background.tilePositionX += delta / 15;
        if (this.player.y - this.player.displayHeight > this.sys.game.config.height)
        {
            this.animate = false;
            this.player.setY(PLAYER_Y - 100).play('walk');
        }

        super.update(time, delta);
    }
}