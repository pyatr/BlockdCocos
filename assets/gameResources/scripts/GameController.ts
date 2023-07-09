import { _decorator, Component, Vec2, instantiate, Prefab, Canvas, BoxCollider2D, Color, randomRange, RigidBody2D } from 'cc';
import { Block } from './Block';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(Canvas)
    gameCanvas: Canvas;
    @property(Prefab)
    blockPrefab: Prefab;

    @property
    fieldWidth: number = 10;
    @property
    fieldHeight: number = 10;

    private discarded: Array<Block> = [];

    private activeBlocks: Array<Block> = [];

    onEnable() {
        this.schedule(() => this.discarded.pop(), 0.5);
    }

    start() {
        this.spawnCubes();
    }

    spawnCubes() {
        let startCoordinates: Vec2 = Vec2.ZERO;
        const randomColors = [Color.YELLOW, Color.MAGENTA, Color.GREEN];
        for (let i = 0; i < this.fieldWidth; i++) {
            for (let j = 0; j < this.fieldHeight; j++) {
                this.spawnCube(startCoordinates, randomColors, i, j);
            }
        }
    }

    spawnCube(startCoordinates: Vec2, randomColors: Array<Color>, offsetX: number, offsetY: number) {
        const newBlock = instantiate(this.blockPrefab);
        const blockComponent = newBlock.getComponent(Block);
        this.activeBlocks.push(blockComponent);
        const blockCollider = newBlock.getComponent(BoxCollider2D);
        const blockWidth = blockCollider.size.x;
        const blockHeight = blockCollider.size.y;
        if (startCoordinates === Vec2.ZERO) {
            startCoordinates = new Vec2(this.fieldWidth * blockWidth / 2, this.fieldHeight * blockHeight / 2);
        }
        newBlock.setParent(this.gameCanvas.node);
        newBlock.setPosition(startCoordinates.x - offsetX * blockWidth - offsetX * 2, startCoordinates.y + offsetY * blockHeight + offsetY * 2);
        blockComponent.setColor(randomColors[Math.floor(randomRange(0, randomColors.length))]);
        blockComponent.node.on("destroyed", (destroyedBlock: Block) => {
            //To avoid destroyed blocks sometimes calling spawn again
            if (!this.discarded.includes(destroyedBlock)) {
                this.spawnCube(new Vec2(startCoordinates.x, startCoordinates.y + screen.height / 4), randomColors, offsetX, offsetY);
                this.discarded.push(destroyedBlock);
                this.activeBlocks = this.activeBlocks.filter(block => block !== destroyedBlock);
            }
        });
    }

    update() {
        Block.canClick = true;
        for (let i = 0; i < this.activeBlocks.length; i++) {
            let currentBlock: Block = this.activeBlocks[i];
            if (currentBlock !== null) {
                if (Math.abs(currentBlock.rigidBody.linearVelocity.y) > 0.1) {
                    Block.canClick = false;
                }
            }
        }
    }
}


