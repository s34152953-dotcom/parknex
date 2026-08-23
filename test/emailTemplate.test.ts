import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@react-email/components";
import ParkingAssignedEmail from "../emails/parking-assigned";
import {
  maskEmail,
  isValidEmail,
  sendParkingPassEmail,
} from "../src/lib/notifications/emailAdapter";

describe("Transactional Email Template & Helpers", () => {
  it("renders ParkingAssignedEmail to valid HTML with required fields and time", async () => {
    const html = await render(
      React.createElement(ParkingAssignedEmail, {
        mallName: "Central Mall Grand",
        plateNumber: "DL 01 AB 1234",
        floor: "B2",
        zone: "Zone A",
        slotNumber: "A-14",
        dashboardUrl: "https://parknex.vercel.app/customer/access/token_test_123",
        assignmentTime: "10:30 AM",
      })
    );

    expect(html).toContain("Central Mall Grand");
    expect(html).toContain("DL 01 AB 1234");
    expect(html).toContain("B2");
    expect(html).toContain("Zone A");
    expect(html).toContain("A-14");
    expect(html).toContain("10:30 AM");
    expect(html).toContain("https://parknex.vercel.app/customer/access/token_test_123");
    expect(html).toContain("Your parking space has been assigned.");
    expect(html).toContain("Open Customer Dashboard");
    expect(html).toContain("This secure link is valid only for your current parking session.");
  });

  it("masks customer email properly for operator feedback", () => {
    expect(maskEmail("martyn@gmail.com")).toBe("m***n@gmail.com");
    expect(maskEmail("ab@domain.com")).toBe("a***@domain.com");
    expect(maskEmail("customer.service@parknex.io")).toBe("c***e@parknex.io");
    expect(maskEmail("")).toBe("");
    expect(maskEmail(undefined)).toBe("");
  });

  it("validates email formats accurately", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("user.name+tag@sub.domain.co.uk")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });

  it("handles invalid email input gracefully without throwing", async () => {
    const result = await sendParkingPassEmail({
      bookingId: "test_booking_123",
      to: "invalid-email-string",
      vehicleNumber: "MH 12 AB 1234",
      slotNumber: "A-01",
      floor: "B2",
      zone: "Zone A",
      mallName: "Central Mall Grand",
      customerAccessToken: "token_abc",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("Invalid customer email");
  });

  it("handles missing RESEND_API_KEY gracefully without throwing or crashing", async () => {
    const origKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    const result = await sendParkingPassEmail({
      bookingId: "test_booking_123",
      to: "customer@example.com",
      vehicleNumber: "MH 12 AB 1234",
      slotNumber: "A-01",
      floor: "B2",
      zone: "Zone A",
      mallName: "Central Mall Grand",
      customerAccessToken: "token_abc",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.error).toContain("RESEND_API_KEY is not configured");

    if (origKey) process.env.RESEND_API_KEY = origKey;
  });
});
