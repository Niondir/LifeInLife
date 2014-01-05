///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
module Game {

    export interface IMobile {
        Sprite:Phaser.Sprite;

        update();
    }

    export class Mobile implements IMobile {
        Sprite:Phaser.Sprite;

        update() {

        }
    }


    export class Player extends Mobile {
        private state:PhaserGameState;

        private energyPerSec:number = 1;

        public inRange:number = 0;

        public energy:number = 10;


        constructor(x:number, y:number, state:PhaserGameState) {
            super();
            this.Sprite = state.add.sprite(x, y, 'player');
            this.Sprite.body.collideWorldBounds = true;
            this.state = state;
        }

        public update() {
            this.inRange = this.countInRange();

            var elapsedSec = this.state.time.elapsed / 1000;

            this.energy += elapsedSec * this.energyGain;
            this.energy = Math.max(0, this.energy);
            /*
            if (diff == 0) {

                this.energyGain = this.energyPerSec;

            }
            else if (diff > 1) {
                this.energyGain = -this.energyPerSec;
                this.energy -= elapsedSec * this.energyPerSec;

                this.energy = Math.max(0, this.energy);
            }*/
        }

        public get energyGain():number {
            var optimal = 3;
            var diff = Math.abs(optimal - this.inRange);

            if (diff == 0 )
                return this.energyPerSec;
            else if (diff > 1 ) {
                return -this.energyPerSec;;
            }
            return 0;

        }

        private countInRange():number {
            var player = this.state.player.Sprite.center;
            var count = 0;
            for (var i in this.state.mobiles) {
                var mob = this.state.mobiles[i].Sprite.center;

                var dist = Phaser.Math.distance(player.x, player.y, mob.x, mob.y);
                if (mob != player && dist < 100) {
                    count++;
                }

            }
            return count;
        }
    }

    export class Npc extends Mobile {
        private state:PhaserGameState;

        // Energy Emitter
        private emitterRed:Phaser.Particles.Arcade.Emitter;
        private emitterYellow:Phaser.Particles.Arcade.Emitter;
        private emitterGreen:Phaser.Particles.Arcade.Emitter;

        constructor(x:number, y:number, state:PhaserGameState) {
            super();
            this.state = state;

            this.Sprite = state.add.sprite(x, y, 'target');
            this.Sprite.body.collideWorldBounds = true;
            //this.Sprite.body.acceleration.x = this.state.game.rnd.frac() * 10;
            //this.Sprite.body.acceleration.y = this.state.game.rnd.frac() * 10;
            this.Sprite.body.velocity.x = this.state.game.rnd.frac() * 100;
            this.Sprite.body.velocity.y = this.state.game.rnd.frac() * 100;
            this.Sprite.body.bounce.setTo(1, 1);

            this.emitterGreen = this.buildEmitter('energy_green');
            this.emitterYellow = this.buildEmitter('energy_yellow');
            this.emitterRed = this.buildEmitter('energy_red');


        }

        buildEmitter(sprite:string) {
            var emitter = this.state.add.emitter(this.Sprite.x, this.Sprite.y, 100);
            emitter.gravity = 0;
            //keys: string[], frames: string[], quantity: number, collide: boolean, collideWorldBounds: boolean

            emitter.makeParticles([sprite], [], 2, false, false);
            emitter.x = this.Sprite.x;
            emitter.y = this.Sprite.y;
            emitter.minParticleScale = 2;
            emitter.maxParticleScale = 2;
            emitter.start(false, 2000, 100, 0);
            emitter.on = false;
            return emitter;
        }

        public update() {
            this.emitterRed.x = this.Sprite.x;
            this.emitterRed.y = this.Sprite.y;
            this.emitterYellow.x = this.Sprite.x;
            this.emitterYellow.y = this.Sprite.y;
            this.emitterGreen.x = this.Sprite.x;
            this.emitterGreen.y = this.Sprite.y;

            var inRange = this.state.physics.distanceBetween(this.Sprite, this.state.player.Sprite) < 100;

            this.emitterRed.on = false;
            this.emitterYellow.on = false;
            this.emitterGreen.on = false;

            if (this.state.player.energyGain > 0) {
                this.emitterGreen.on = inRange;
            }
            if (this.state.player.energyGain == 0) {
                this.emitterYellow.on = inRange;
            }
            if (this.state.player.energyGain < 0) {
                this.emitterRed.on = inRange;
            }


            this.emitterRed.forEach(this.moveTo, this, false);
            this.emitterYellow.forEach(this.moveTo, this, false);
            this.emitterGreen.forEach(this.moveTo, this, false);
        }

        moveTo(sprite:Phaser.Sprite) {


            if (this.state.physics.distanceBetween(sprite, this.state.player.Sprite) < 10) {
                sprite.kill();
                return;
            }

            this.state.physics.moveToObject(sprite, this.state.player.Sprite, 500);


        }
    }
}