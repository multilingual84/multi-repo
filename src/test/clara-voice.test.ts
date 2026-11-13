import { describe, it, expect } from "vitest";
import { summarizeToThreeLines } from "@/lib/clara-voice";
import { ICE_SERVERS } from "@/lib/webrtc";

describe("Clara summary", () => {
  it("returns at most 3 lines", () => {
    expect(summarizeToThreeLines("One. Two. Three. Four. Five.")).toEqual(["One.", "Two.", "Three."]);
  });
});

describe("WebRTC", () => {
  it("uses Google public STUN", () => {
    expect(ICE_SERVERS[0]?.urls).toContain("stun:stun.l.google.com:19302");
  });
});
