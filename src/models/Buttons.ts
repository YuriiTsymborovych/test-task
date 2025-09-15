import * as PIXI from "pixi.js";

export class UIButton extends PIXI.Container {
  private background: PIXI.Graphics;
  private textLabel: PIXI.Text;
  private valueLabel: PIXI.Text;

  constructor(
    text: string,
    width: number,
    height: number,
    updatedValue: number,
    onClick: () => void,
  ) {
    super();

    this.background = new PIXI.Graphics()
      .roundRect(0, 0, width, height, 10)
      .fill(0x3498db);
    this.addChild(this.background);

    this.textLabel = new PIXI.Text({
      text,
      style: {
        fontFamily: "Arial",
        fontSize: 14,
        fill: 0xffffff,
        align: "center",
      },
    });
    this.textLabel.anchor.set(0.5);
    this.textLabel.position.set(width / 2, height / 2);
    this.addChild(this.textLabel);

    this.valueLabel = new PIXI.Text(updatedValue.toString(), {
      fontFamily: "Arial",
      fontSize: 14,
      fill: 0xffff00,
      align: "center",
    });
    this.valueLabel.anchor.set(0.5, 0.5);
    this.valueLabel.position.set(width - 10, height / 2);
    this.addChild(this.valueLabel);

    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerdown", onClick);
  }

  public setText(text: string) {
    this.textLabel.text = text;
  }
}
