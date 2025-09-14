import * as PIXI from "pixi.js";
import { Person } from "./Person";
import { Group } from "@tweenjs/tween.js";

export class Floor {
  public container: PIXI.Container;
  public y: number;
  public persons: Person[] = [];

  constructor(
    y: number,
    width: number,
    height: number,
    x: number,
    level: number,
  ) {
    this.y = y;
    this.container = new PIXI.Container();
    this.container.name = `floor-${level}`;

    const g = new PIXI.Graphics()
      .moveTo(0, 0)
      .lineTo(width, 0)
      .moveTo(width, 0)
      .lineTo(width, height)
      .moveTo(0, height)
      .lineTo(width, height);

    g.stroke({ width: 2, color: 0x000000 });

    this.container.addChild(g);

    const levelText = new PIXI.Text({
      text: `level ${level}`,
      style: {
        fontFamily: "Arial",
        fontSize: 18,
        fill: 0x333333,
      },
    });
    levelText.x = width + 20;
    levelText.y = height / 2 - levelText.height / 2;
    this.container.addChild(levelText);

    this.container.x = x;
    this.container.y = y;
  }

  public addPerson(person: Person) {
    this.persons.push(person);
    this.container.addChild(person.container);
  }

  public removePerson(person: Person, tweenGroup: Group) {
    const index = this.persons.indexOf(person);
    if (index !== -1) {
      this.persons.splice(index, 1);

      this.persons.forEach((person, i) => {
        const queueX = 10 + i * 35;
        const queueY = 45;

        person.moveTo(queueX, queueY, tweenGroup);
      });
    }
  }
}
