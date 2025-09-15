import * as PIXI from "pixi.js";
import { App } from "./core/App";
import { Building } from "./models/Building";
import { PersonManager } from "./services/PersonSpawner";
import { Group } from "@tweenjs/tween.js";
import { ElevatorManager } from "./services/ElevatorController";
import { UIButton } from "./models/Buttons";

let NUM_FLOORS = 6;
let MAX_NUM_PERSONS_IN_ELEVATOR = 3;

const WIDTH = 1000;
const BUILDING_WIDTH = 800;
const FLOOR_HEIGHT = 90;

let app: App;
let building: Building;
let elevatorManager: ElevatorManager;
let tweenGroup: Group;

function initApp() {
  const ELEVATOR_WIDTH = MAX_NUM_PERSONS_IN_ELEVATOR * 40;
  const BUILDING_HEIGHT = FLOOR_HEIGHT * NUM_FLOORS;
  const STAGE_HEIGHT = BUILDING_HEIGHT + 150;

  app = new App(WIDTH, STAGE_HEIGHT);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__PIXI_APP__ = app;

  building = new Building(
    NUM_FLOORS,
    ELEVATOR_WIDTH,
    FLOOR_HEIGHT,
    BUILDING_WIDTH,
    BUILDING_HEIGHT,
  );
  building.container.x = (WIDTH - BUILDING_WIDTH) / 2;
  building.container.y = (STAGE_HEIGHT - BUILDING_HEIGHT) / 2;
  app.stage.addChild(building.container);

  tweenGroup = new Group();

  elevatorManager = new ElevatorManager(
    building.elevator,
    building.floors,
    tweenGroup,
    MAX_NUM_PERSONS_IN_ELEVATOR,
    FLOOR_HEIGHT,
  );
  elevatorManager.start();

  new PersonManager(
    building.floors,
    app.app,
    NUM_FLOORS,
    tweenGroup,
    elevatorManager,
  );

  const floorsButton = new UIButton("Floors", 100, 40, NUM_FLOORS, () => {
    NUM_FLOORS = NUM_FLOORS >= 10 ? 4 : NUM_FLOORS + 1;
    rebuildApp();
  });
  floorsButton.position.set(350, BUILDING_HEIGHT + floorsButton.height + 40);
  app.stage.addChild(floorsButton);

  const capacityButton = new UIButton(
    "Capacity",
    100,
    40,
    MAX_NUM_PERSONS_IN_ELEVATOR,
    () => {
      MAX_NUM_PERSONS_IN_ELEVATOR =
        MAX_NUM_PERSONS_IN_ELEVATOR >= 4 ? 2 : MAX_NUM_PERSONS_IN_ELEVATOR + 1;
      rebuildApp();
    },
  );
  capacityButton.position.set(
    500,
    BUILDING_HEIGHT + capacityButton.height + 40,
  );
  app.stage.addChild(capacityButton);

  PIXI.Ticker.shared.add(() => {
    tweenGroup.update();
  });
}

function rebuildApp() {
  document.getElementById("pixi-container")!.innerHTML = "";
  initApp();
}

initApp();
