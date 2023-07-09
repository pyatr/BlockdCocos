import { _decorator, Component, Node, Vec2, PhysicsSystem2D, ERaycast2DType, BoxCollider2D, Sprite, Color, RigidBody2D } from 'cc';
const { ccclass } = _decorator;

@ccclass('Block')
export class Block extends Component {
    static canClick: boolean = true;

    private collider: BoxCollider2D;
    private sprite: Sprite;
    rigidBody: RigidBody2D;

    private width: number;
    private height: number;

    onLoad() {
        this.collider = this.getComponent(BoxCollider2D);
        this.sprite = this.getComponent(Sprite);
        this.rigidBody = this.getComponent(RigidBody2D);
        this.width = this.collider.size.x;
        this.height = this.collider.size.y;
    }

    start() {
        this.node.on(Node.EventType.MOUSE_UP, () => this.onClick(), this);
    }

    isSimilar(otherBlock: Block): boolean {
        const otherBlockSprite = otherBlock.getComponent(Sprite);
        if (otherBlockSprite !== null) {
            return otherBlockSprite.color.equals(this.sprite.color);
        }
        return false;
    }

    onClick(ignoreRequiredBlockLimit: boolean = false) {
        if (!Block.canClick && !ignoreRequiredBlockLimit) {
            return;
        }

        const directionModifiers = [Vec2.UNIT_Y, Vec2.UNIT_X, new Vec2(0, -1), new Vec2(-1, 0)];
        const neighbourBlocksWithSameColor = [];
        const currentPosition: Vec2 = this.node.worldPosition as unknown as Vec2;

        directionModifiers.forEach((directionModifier: Vec2) => {
            //Direction of raycast
            const currentDirection: Vec2 = new Vec2(currentPosition.x + directionModifier.x * this.width * 1.5, currentPosition.y + directionModifier.y * this.height * 1.5);
            const allRaycastResults = PhysicsSystem2D.instance.raycast(currentPosition, currentDirection, ERaycast2DType.All);
            //Cache all blocks with same color
            allRaycastResults.forEach((result: any) => {
                let hitNode: Node = result.collider.node;
                let nodeBlock: Block = hitNode.getComponent(Block);
                if (nodeBlock !== null && this.isSimilar(nodeBlock)) {
                    neighbourBlocksWithSameColor.push(nodeBlock);
                }
            });
        });
        if (neighbourBlocksWithSameColor.length >= 1 || ignoreRequiredBlockLimit) {
            //All cached blocks get their neighbours     
            this.collider.enabled = false;
            this.scheduleOnce(() => neighbourBlocksWithSameColor.forEach((block: Block) => {
                block.onClick(true);
            }), 0.01);
            this.scheduleOnce(() => this.destroySelf(), 0.02);
        }
    }

    destroySelf() {
        this.node.emit("destroyed", this);
        this.node.destroy();
    }

    setColor(newColor: Color) {
        this.sprite.color = newColor;
    }
}

