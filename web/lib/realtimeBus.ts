type RealtimeEvent = {
  topic: string;
  type: string;
  data: unknown;
};

type Subscriber = {
  topics: Set<string>;
  send: (evt: RealtimeEvent) => void;
  close: () => void;
};

const g = globalThis as unknown as {
  __realtimeBus?: {
    subscribers: Set<Subscriber>;
  };
};

const bus =
  g.__realtimeBus ??
  (g.__realtimeBus = {
    subscribers: new Set<Subscriber>(),
  });

export function subscribe(sub: Subscriber) {
  bus.subscribers.add(sub);
  return () => {
    bus.subscribers.delete(sub);
    try {
      sub.close();
    } catch {
      // ignore
    }
  };
}

export function publish(evt: RealtimeEvent) {
  for (const sub of bus.subscribers) {
    if (sub.topics.size > 0 && !sub.topics.has(evt.topic)) continue;
    try {
      sub.send(evt);
    } catch {
      // ignore
    }
  }
}
