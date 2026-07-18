import { v4 as uuid4 } from "uuid";

export default defineEventHandler((event) => {
    const cookies = parseCookies(event);

    const deviceId = cookies["device-id"];
    if (!deviceId) {
        setCookie(event, "device-id", uuid4(), {
            httpOnly: true,
            sameSite: "lax",
        });
    }
});
