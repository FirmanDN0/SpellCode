import { CommandType, Direction, GridPosition, Objective, ShardEntity, TorchEntity } from "../engine/types";

export interface TestLevelFixture {
  id: string;
  title: string;
  description: string;
  conceptTag: "Sequencing" | "Loops" | "Conditions";
  grid: {
    width: number;
    height: number;
    playerStart: {
      x: number;
      y: number;
      direction: Direction;
    };
    obstacles: GridPosition[];
    shards: ShardEntity[];
    torches: TorchEntity[];
    portal: GridPosition;
  };
  objectives: Objective[];
  allowedRunes: CommandType[];
  parSteps: number;
  hint: string;
}

/**
 * Fixture 1: Gerakan Lurus Dasar (Move Straight)
 * Arena 3x3. Pemain di (0, 1) menghadap RIGHT, portal di (2, 1).
 * Solusi optimal: STEP_FORWARD x 2.
 */
export const fixtureMoveStraight: TestLevelFixture = {
  id: "fix-move-straight",
  title: "Langkah Pertama Magang",
  description: "Langkahkan penyihir lurus menuju portal kemenangan.",
  conceptTag: "Sequencing",
  grid: {
    width: 3,
    height: 3,
    playerStart: { x: 0, y: 1, direction: "RIGHT" },
    obstacles: [],
    shards: [],
    torches: [],
    portal: { x: 2, y: 1 },
  },
  objectives: [
    {
      id: "obj-1",
      type: "REACH_PORTAL",
      description: "Capai portal gerbang di petak (2, 1)",
      isCompleted: false,
    },
  ],
  allowedRunes: ["STEP_FORWARD"],
  parSteps: 2,
  hint: "Gunakan 2 blok Maju untuk tiba di gerbang.",
};

/**
 * Fixture 2: Belokan Sudut L (Turn Corner)
 * Arena 3x3. Pemain di (0, 0) menghadap RIGHT, batu di (2, 0), portal di (1, 2).
 * Solusi optimal: STEP_FORWARD -> TURN_RIGHT -> STEP_FORWARD x 2.
 */
export const fixtureTurnCorner: TestLevelFixture = {
  id: "fix-turn-corner",
  title: "Menikung di Sudut Lorong",
  description: "Hindari jurang dan belokkan arah hadap penyihir.",
  conceptTag: "Sequencing",
  grid: {
    width: 3,
    height: 3,
    playerStart: { x: 0, y: 0, direction: "RIGHT" },
    obstacles: [{ x: 2, y: 0 }],
    shards: [],
    torches: [],
    portal: { x: 1, y: 2 },
  },
  objectives: [
    {
      id: "obj-1",
      type: "REACH_PORTAL",
      description: "Capai portal gerbang di petak (1, 2)",
      isCompleted: false,
    },
  ],
  allowedRunes: ["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"],
  parSteps: 4,
  hint: "Maju 1 langkah, belok kanan, lalu maju 2 langkah.",
};

/**
 * Fixture 3: Nyalakan Lentera (Light Torch)
 * Arena 4x3. Pemain di (0, 1) menghadap RIGHT, lentera di (1, 1), portal di (3, 1).
 * Solusi: STEP_FORWARD -> LIGHT_TORCH -> STEP_FORWARD x 2.
 */
export const fixtureLightTorch: TestLevelFixture = {
  id: "fix-light-torch",
  title: "Api Penerang Pertama",
  description: "Nyalakan lentera sebelum melangkah ke gerbang.",
  conceptTag: "Sequencing",
  grid: {
    width: 4,
    height: 3,
    playerStart: { x: 0, y: 1, direction: "RIGHT" },
    obstacles: [],
    shards: [],
    torches: [{ id: "torch-1", x: 1, y: 1 }],
    portal: { x: 3, y: 1 },
  },
  objectives: [
    {
      id: "obj-torch",
      type: "LIGHT_ALL_TORCHES",
      description: "Nyalakan lentera di petak (1, 1)",
      requiredCount: 1,
      currentCount: 0,
      isCompleted: false,
    },
    {
      id: "obj-portal",
      type: "REACH_PORTAL",
      description: "Tiba di gerbang portal (3, 1)",
      isCompleted: false,
    },
  ],
  allowedRunes: ["STEP_FORWARD", "LIGHT_TORCH"],
  parSteps: 4,
  hint: "Maju ke lentera, nyalakan, lalu lanjutkan perjalanan ke portal.",
};

/**
 * Fixture 4: Petik Kristal Mana (Collect Shard)
 * Arena 4x3. Pemain di (0, 1) menghadap RIGHT, kristal di (1, 1), portal di (3, 1).
 * Solusi: STEP_FORWARD -> COLLECT_SHARD -> STEP_FORWARD x 2.
 */
export const fixtureCollectShard: TestLevelFixture = {
  id: "fix-collect-shard",
  title: "Kristal Cahaya Bintang",
  description: "Ambil kristal mana yang berkilau sebelum menuju portal.",
  conceptTag: "Sequencing",
  grid: {
    width: 4,
    height: 3,
    playerStart: { x: 0, y: 1, direction: "RIGHT" },
    obstacles: [],
    shards: [{ id: "shard-1", x: 1, y: 1 }],
    torches: [],
    portal: { x: 3, y: 1 },
  },
  objectives: [
    {
      id: "obj-shard",
      type: "COLLECT_ALL_SHARDS",
      description: "Petik kristal mana di petak (1, 1)",
      requiredCount: 1,
      currentCount: 0,
      isCompleted: false,
    },
    {
      id: "obj-portal",
      type: "REACH_PORTAL",
      description: "Tiba di gerbang portal (3, 1)",
      isCompleted: false,
    },
  ],
  allowedRunes: ["STEP_FORWARD", "COLLECT_SHARD"],
  parSteps: 4,
  hint: "Maju ke kristal, ambil kristal, lalu maju ke portal.",
};

/**
 * Fixture 5: Interaksi Serbaguna (Context-Sensitive Activate)
 * Arena 4x3. Menggunakan rune ACTIVATE untuk lentera dan kristal.
 */
export const fixtureActivateAction: TestLevelFixture = {
  id: "fix-activate-action",
  title: "Sentuhan Ajaib",
  description: "Gunakan mantra Aktivasi untuk berinteraksi dengan benda sihir di sekitarmu.",
  conceptTag: "Sequencing",
  grid: {
    width: 4,
    height: 3,
    playerStart: { x: 0, y: 1, direction: "RIGHT" },
    obstacles: [],
    shards: [{ id: "shard-1", x: 2, y: 1 }],
    torches: [{ id: "torch-1", x: 1, y: 1 }],
    portal: { x: 3, y: 1 },
  },
  objectives: [
    {
      id: "obj-torch",
      type: "LIGHT_ALL_TORCHES",
      description: "Nyalakan lentera",
      isCompleted: false,
    },
    {
      id: "obj-shard",
      type: "COLLECT_ALL_SHARDS",
      description: "Petik kristal mana",
      isCompleted: false,
    },
    {
      id: "obj-portal",
      type: "REACH_PORTAL",
      description: "Tiba di gerbang portal",
      isCompleted: false,
    },
  ],
  allowedRunes: ["STEP_FORWARD", "ACTIVATE"],
  parSteps: 5,
  hint: "Maju dan gunakan Aktivasi pada setiap benda.",
};

/**
 * Fixture 6: Memutari Rintangan Batuan (Obstacle Detour)
 * Arena 4x4 dengan rintangan batu di tengah (1, 1) dan (2, 1).
 */
export const fixtureObstacleDetour: TestLevelFixture = {
  id: "fix-obstacle-detour",
  title: "Tebing Batu Penghalang",
  description: "Cari rute memutar untuk menghindari batu sihir yang menghalangi jalan lurus.",
  conceptTag: "Sequencing",
  grid: {
    width: 4,
    height: 4,
    playerStart: { x: 0, y: 1, direction: "RIGHT" },
    obstacles: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    shards: [],
    torches: [],
    portal: { x: 3, y: 1 },
  },
  objectives: [
    {
      id: "obj-portal",
      type: "REACH_PORTAL",
      description: "Capai portal di seberang tebing batu (3, 1)",
      isCompleted: false,
    },
  ],
  allowedRunes: ["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"],
  parSteps: 7,
  hint: "Belok ke utara (y=0) untuk memutari barisan batu.",
};
