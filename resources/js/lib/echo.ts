import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "reverb",
  key: "local",
  wsHost: "127.0.0.1",
  wsPort: 8080,
  forceTLS: false,
  disableStats: true,
});
