import { createBot, Bot, ControlState } from "mineflayer";
import { readFileSync } from "fs";
import { config } from "dotenv";

config();

interface IServerConfig {
  server: {
    host: string;
    port: number;
    version: string;
  };

  bot: {
    username: string;
    reconnectDelay: number;
    activityInterval: number;
    randomLeaveChance: number;
    randomLeaveInterval: number;
  };
}

class CrypticAutomationEngine {
  private _activeInstance: Bot | null = null;

  private readonly _configurationMatrix: IServerConfig;

  private readonly _authenticationSequence: string;

  private _behaviorIntervalIds: NodeJS.Timeout[] = [];

  private _reconnectionAttempts = 0;

  private _isAuthenticated = false;

  private _lastChatTimestamp = 0;

  private readonly _activityPatterns = [
    () => this._moveRandomly(),
    () => this._rotateNaturally(),
    () => this._simulateJumpBehavior(),
    () => this._walkForward(),
    () => this._lookAtNearestPlayer(),
  ];

  constructor() {
    this._configurationMatrix = JSON.parse(
      readFileSync("config.json", "utf8")
    ) as IServerConfig;

    this._authenticationSequence =
      process.env.SERVER_PASSWORD || "";

    this._initializePrimaryConnection();
  }

  private _initializePrimaryConnection(): void {
    this._activeInstance = createBot({
      host: this._configurationMatrix.server.host,
      port: this._configurationMatrix.server.port,
      username: this._configurationMatrix.bot.username,
      version: this._configurationMatrix.server.version,
      auth: "offline",
    });

    this._attachEventHandlers();
  }

  private _attachEventHandlers(): void {
    if (!this._activeInstance) return;

    this._activeInstance.on("login", () => {
      console.log("Connected");

      this._resetAuthenticationState();

      this._scheduleRandomLeaveEvent();
    });

    this._activeInstance.on("spawn", () => {
      console.log("Spawned");

      setTimeout(() => {
        this._executeAuthenticationProtocol();
      }, this._humanizedDelay(2000, 4000));

      this._initializeBehaviorSimulation();
    });

    this._activeInstance.on("chat", (username, message) => {
      this._handlePlayerChat(username, message);
    });

    this._activeInstance.on("message", (message) => {
      this._processServerMessage(message.toString());
    });

    this._activeInstance.on("kicked", (reason) => {
      console.log("Kicked:", reason);

      this._handleDisconnectionEvent();
    });

    this._activeInstance.on("end", () => {
      console.log("Disconnected");

      this._handleDisconnectionEvent();
    });

    this._activeInstance.on("error", (error) => {
      console.log("Error:", error.message);

      this._handleDisconnectionEvent();
    });
  }

  private _humanizedDelay(
    min = 1000,
    max = 3500
  ): number {
    return Math.random() * (max - min) + min;
  }

  private _safeChat(message: string): void {
    if (!this._activeInstance) return;

    if (
      Date.now() - this._lastChatTimestamp <
      15000
    )
      return;

    this._lastChatTimestamp = Date.now();

    setTimeout(() => {
      this._activeInstance?.chat(message);
    }, this._humanizedDelay());
  }

  private _executeAuthenticationProtocol(): void {
    if (!this._activeInstance || this._isAuthenticated)
      return;

    const commands = [
      `/register ${this._authenticationSequence} ${this._authenticationSequence}`,
      `/login ${this._authenticationSequence}`,
    ];

    commands.forEach((command, index) => {
      setTimeout(() => {
        this._activeInstance?.chat(command);
      }, index * 2000);
    });

    setTimeout(() => {
      this._isAuthenticated = true;
    }, 5000);
  }

  private _initializeBehaviorSimulation(): void {
    this._clearAllIntervals();

    const mainLoop = setInterval(() => {
      this._executeRandomActivity();
    }, this._configurationMatrix.bot.activityInterval);

    const movementLoop = setInterval(() => {
      if (Math.random() < 0.7) {
        this._performComplexMovement();
      }
    }, 15000);

    const interactionLoop = setInterval(() => {
      this._simulatePlayerInteraction();
    }, 45000);

    const antiAfkLoop = setInterval(() => {
      this._activeInstance?.swingArm("right");
    }, 10000);

    this._behaviorIntervalIds.push(
      mainLoop,
      movementLoop,
      interactionLoop,
      antiAfkLoop
    );
  }

  private _executeRandomActivity(): void {
    if (!this._activeInstance || !this._isAuthenticated)
      return;

    if (Math.random() < 0.1) return;

    const activity =
      this._activityPatterns[
        Math.floor(
          Math.random() * this._activityPatterns.length
        )
      ];

    activity();
  }

  private _moveRandomly(): void {
    if (!this._activeInstance) return;

    const directions: ControlState[] = [
      "forward",
      "back",
      "left",
      "right",
    ];

    const direction =
      directions[
        Math.floor(Math.random() * directions.length)
      ];

    this._activeInstance.setControlState(
      direction,
      true
    );

    if (Math.random() < 0.2) {
      this._activeInstance.setControlState(
        "sprint",
        true
      );
    }

    setTimeout(() => {
      this._activeInstance?.setControlState(
        direction,
        false
      );

      this._activeInstance?.setControlState(
        "sprint",
        false
      );
    }, Math.random() * 2000 + 1000);
  }

  private _rotateNaturally(): void {
    if (!this._activeInstance?.entity) return;

    const yaw =
      this._activeInstance.entity.yaw +
      (Math.random() - 0.5) * Math.PI;

    const pitch =
      this._activeInstance.entity.pitch +
      (Math.random() - 0.5) * 0.5;

    this._activeInstance.look(yaw, pitch, true);
  }

  private _simulateJumpBehavior(): void {
    if (!this._activeInstance) return;

    const jumps =
      Math.random() < 0.5
        ? 1
        : Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < jumps; i++) {
      setTimeout(() => {
        this._activeInstance?.setControlState(
          "jump",
          true
        );

        setTimeout(() => {
          this._activeInstance?.setControlState(
            "jump",
            false
          );
        }, 100);
      }, i * 400);
    }
  }

  private _walkForward(): void {
    if (!this._activeInstance) return;

    this._activeInstance.setControlState(
      "forward",
      true
    );

    setTimeout(() => {
      this._activeInstance?.setControlState(
        "forward",
        false
      );
    }, Math.random() * 3000 + 1000);
  }

  private _lookAtNearestPlayer(): void {
    if (!this._activeInstance) return;

    const players = Object.values(
      this._activeInstance.players
    ).filter((player) => player.entity);

    if (players.length === 0) return;

    const target =
      players[
        Math.floor(Math.random() * players.length)
      ];

    this._activeInstance.lookAt(
      target.entity.position.offset(0, 1.6, 0)
    );
  }

  private _performComplexMovement(): void {
    if (!this._activeInstance) return;

    const actions: Array<{
      action: ControlState;
      duration: number;
    }> = [
      { action: "sprint", duration: 1000 },
      { action: "sneak", duration: 800 },
      { action: "jump", duration: 200 },
    ];

    actions.forEach((item, index) => {
      setTimeout(() => {
        this._activeInstance?.setControlState(
          item.action,
          true
        );

        setTimeout(() => {
          this._activeInstance?.setControlState(
            item.action,
            false
          );
        }, item.duration);
      }, index * item.duration);
    });
  }

  private _simulatePlayerInteraction(): void {
    if (!this._activeInstance) return;

    if (Math.random() > 0.4) return;

    const actions = [
      () => this._activeInstance?.swingArm("right"),
      () => this._performInventoryAction(),
    ];

    const action =
      actions[
        Math.floor(Math.random() * actions.length)
      ];

    action();
  }

  private _performInventoryAction(): void {
    if (!this._activeInstance) return;

    try {
      const slot = Math.floor(Math.random() * 9) + 36;

      this._activeInstance.clickWindow(
        slot,
        0,
        0
      );
    } catch {}
  }

  private _handlePlayerChat(
    username: string,
    message: string
  ): void {
    if (
      !this._activeInstance ||
      username === this._activeInstance.username
    )
      return;

    if (Math.random() < 0.3) return;

    const msg = message.toLowerCase();

    const responses: Record<string, string[]> = {
      hi: ["hey", "yo", "اهلا"],
      hello: ["عامل ايه", "hey"],
      bot: ["مين بوت 😂", "لا يعم"],
      تعال: ["جاي", "ثانية"],
      فينك: ["بلف هنا", "عند السبون"],
      ez: ["😂", "calm down"],
    };

    for (const key in responses) {
      if (msg.includes(key)) {
        const reply =
          responses[key][
            Math.floor(
              Math.random() * responses[key].length
            )
          ];

        this._safeChat(reply);

        break;
      }
    }
  }

  private _processServerMessage(
    message: string
  ): void {
    const triggers = [
      "register",
      "login",
      "password",
      "verify",
    ];

    if (
      triggers.some((trigger) =>
        message.toLowerCase().includes(trigger)
      )
    ) {
      setTimeout(() => {
        this._executeAuthenticationProtocol();
      }, this._humanizedDelay());
    }
  }

  private _scheduleRandomLeaveEvent(): void {
    const timeout = setTimeout(() => {
      if (
        Math.random() <
        this._configurationMatrix.bot
          .randomLeaveChance
      ) {
        this._activeInstance?.quit();
      }

      this._scheduleRandomLeaveEvent();
    }, this._configurationMatrix.bot.randomLeaveInterval);

    this._behaviorIntervalIds.push(timeout);
  }

  private _handleDisconnectionEvent(): void {
    this._clearAllIntervals();

    this._resetAuthenticationState();

    const delay = Math.min(
      this._configurationMatrix.bot.reconnectDelay *
        Math.pow(1.5, this._reconnectionAttempts),
      60000
    );

    setTimeout(() => {
      this._reconnectionAttempts++;

      this._initializePrimaryConnection();
    }, delay);
  }

  private _clearAllIntervals(): void {
    this._behaviorIntervalIds.forEach((id) => {
      clearInterval(id);
      clearTimeout(id);
    });

    this._behaviorIntervalIds = [];
  }

  private _resetAuthenticationState(): void {
    this._isAuthenticated = false;

    this._reconnectionAttempts = 0;
  }
}

new CrypticAutomationEngine();

process.on("SIGINT", () => {
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  console.error(error);

  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
