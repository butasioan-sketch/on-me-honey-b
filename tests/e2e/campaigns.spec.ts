import { test, expect } from "@playwright/test";
import {
  CAMPAIGNS,
  berlinToday,
  easterSunday,
  isCampaignActive,
} from "../../lib/catalog/campaigns";

test.describe("Saisonfenster (Berliner Kalendertage)", () => {
  test("berlinToday uses Europe/Berlin, not UTC @smoke", () => {
    // 23:30 UTC am 14.11. = 00:30 am 15.11. in Berlin (MEZ, UTC+1)
    expect(berlinToday(new Date("2026-11-14T23:30:00Z"))).toBe("2026-11-15");
    // 22:30 UTC am 14.02. = 23:30 am 14.02. in Berlin
    expect(berlinToday(new Date("2027-02-14T22:30:00Z"))).toBe("2027-02-14");
  });

  test("Weihnachten starts at Berlin midnight even on the UTC previous day @smoke", () => {
    const w = CAMPAIGNS.weihnachten;
    expect(isCampaignActive(w, new Date("2026-11-14T22:59:00Z"))).toBe(false); // 23:59 Berlin 14.11.
    expect(isCampaignActive(w, new Date("2026-11-14T23:00:00Z"))).toBe(true); // 00:00 Berlin 15.11.
    expect(isCampaignActive(w, new Date("2026-12-24T22:59:00Z"))).toBe(true); // 23:59 Berlin 24.12.
    expect(isCampaignActive(w, new Date("2026-12-24T23:00:00Z"))).toBe(false); // 00:00 Berlin 25.12.
  });

  test("Valentinstag ends after 14.02. Berlin @smoke", () => {
    const v = CAMPAIGNS.valentinstag;
    expect(isCampaignActive(v, new Date("2027-01-14T23:00:00Z"))).toBe(true); // 00:00 Berlin 15.01.
    expect(isCampaignActive(v, new Date("2027-02-14T22:59:00Z"))).toBe(true);
    expect(isCampaignActive(v, new Date("2027-02-14T23:00:00Z"))).toBe(false);
  });

  test("Ostern window follows Easter Sunday incl. summer time @smoke", () => {
    expect(easterSunday(2027).toISOString().slice(0, 10)).toBe("2027-03-28");
    expect(easterSunday(2028).toISOString().slice(0, 10)).toBe("2028-04-16");
    const o = CAMPAIGNS.ostern;
    // 2028: Fenster 19.03.–17.04., Ostermontag in MESZ (UTC+2)
    expect(isCampaignActive(o, new Date("2028-03-18T22:59:00Z"))).toBe(false); // 23:59 Berlin 18.03.
    expect(isCampaignActive(o, new Date("2028-03-18T23:00:00Z"))).toBe(true); // 00:00 Berlin 19.03.
    expect(isCampaignActive(o, new Date("2028-04-17T21:59:00Z"))).toBe(true); // 23:59 Berlin 17.04.
    expect(isCampaignActive(o, new Date("2028-04-17T22:00:00Z"))).toBe(false); // 00:00 Berlin 18.04.
  });
});
