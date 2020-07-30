/**
 * 提供对平台所有事件的触发和监听
 * 解决相互依赖监听事件的问题
 * 严格先声明到RUNTIME_EVENT_ENUM才能使用
 */

export enum EVENT_ENUM {
  EntityUMLEditor_ItemDrag, // 实体编辑器_选项拖拽
}

class EventService {
  private readonly _events: any;

  constructor() {
    this._events = Object.create(null);
    for (const runtimeEventKey of Object.keys(EVENT_ENUM)) {
      const key = EVENT_ENUM[runtimeEventKey];
      this._events[key] = [];
    }
  }

  on<T>(type: EVENT_ENUM, listener: (value: T) => void): () => void {
    this._addEventListener(type, listener, false);
    return () => {
      const existing: Array<Function> = this._events[type];
      if (!existing) {
        throw new Error(`not event : ${type}`);
      }
      existing.splice(existing.indexOf(listener, 1));
    };
  }

  emit<T = any>(type: EVENT_ENUM, value?: T) {
    const existing: Array<Function> = this._events[type];
    if (!existing) {
      throw new Error(`not event : ${type}`);
    }

    existing.forEach((listeners) => {
      listeners(value);
    });
  }

  addEventListener<T>(type: EVENT_ENUM, listener: (value: T) => void) {
    this._addEventListener(type, listener, false);
  }


  prependEventListener<T>(type: EVENT_ENUM, listener: (value: T) => void) {
    this._addEventListener(type, listener, true);
  }

  private _addEventListener(type: EVENT_ENUM, listener: Function, prepend: boolean) {
    if (typeof listener !== 'function') {
      throw new Error('listener not a function');
    }
    const existing = this._events[type];
    if (!existing) {
      throw new Error(`not event : ${type}`);
    }
    if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }
  }
}

export const eventService = new EventService();
