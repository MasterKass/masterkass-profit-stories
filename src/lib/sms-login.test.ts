import { describe, expect, it } from "vitest";
import { checkCode, signCode } from "./sms-login.server";

describe("код входа по SMS", () => {
  it("верный код проходит, чужой — нет, старый — устаревает", async () => {
    const exp = Date.now() + 60_000;
    const t = await signCode("s", "+79001112233", "4821", exp);
    expect(await checkCode("s", "+79001112233", "4821", t)).toBe("ok");
    expect(await checkCode("s", "+79001112233", "0000", t)).toBe("wrong");
    expect(await checkCode("s", "+79990000000", "4821", t)).toBe("wrong");
    expect(await checkCode("s", "+79001112233", "4821", t, exp + 1)).toBe("expired");
  });
});
