type EventCallback<T = unknown> = (data: T) => void;

export class EventEmitter {
    private events: Map<string, Set<EventCallback>> = new Map();

    on<T>(event: string, callback: EventCallback<T>): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(callback as EventCallback);
    }

    off<T>(event: string, callback: EventCallback<T>): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.delete(callback as EventCallback);
        }
    }

    emit<T>(event: string, data: T): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for "${event}":`, error);
                }
            });
        }
    }

    once<T>(event: string, callback: EventCallback<T>): void {
        const onceCallback: EventCallback<T> = (data) => {
            this.off(event, onceCallback);
            callback(data);
        };
        this.on(event, onceCallback);
    }

    removeAllListeners(event?: string): void {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
}
