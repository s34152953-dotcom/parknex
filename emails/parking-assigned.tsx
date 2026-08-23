import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Row,
  Column,
} from "@react-email/components";

export interface ParkingAssignedEmailProps {
  mallName: string;
  plateNumber: string;
  floor: string;
  zone: string;
  slotNumber: string;
  dashboardUrl: string;
  assignmentTime?: string;
}

export default function ParkingAssignedEmail({
  mallName = "Central Mall Grand",
  plateNumber = "MH 12 AB 1234",
  floor = "B2",
  zone = "Zone A",
  slotNumber = "A-14",
  dashboardUrl = "https://parknex.vercel.app/customer/dashboard",
  assignmentTime,
}: ParkingAssignedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your parking space {slotNumber} at {mallName} is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Brand */}
          <Section style={headerSection}>
            <Text style={brandText}>PARKNEX</Text>
            <Text style={brandSubtext}>INTELLIGENT PARKING SYSTEMS</Text>
          </Section>

          <Hr style={divider} />

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={badge}>ENTRY CONFIRMED</Text>
            <Heading style={heading}>Your parking space has been assigned.</Heading>
            <Text style={subheading}>
              Your vehicle entry has been verified at {mallName}. Your space is ready and reserved for your current session.
            </Text>

            {/* Details Table */}
            <Section style={detailsCard}>
              <Row style={detailRow}>
                <Column style={detailLabelCol}>
                  <Text style={detailLabel}>Mall</Text>
                </Column>
                <Column style={detailValueCol}>
                  <Text style={detailValue}>{mallName}</Text>
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabelCol}>
                  <Text style={detailLabel}>Vehicle</Text>
                </Column>
                <Column style={detailValueCol}>
                  <Text style={detailValuePlate}>{plateNumber}</Text>
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabelCol}>
                  <Text style={detailLabel}>Floor</Text>
                </Column>
                <Column style={detailValueCol}>
                  <Text style={detailValue}>{floor}</Text>
                </Column>
              </Row>

              <Row style={detailRow}>
                <Column style={detailLabelCol}>
                  <Text style={detailLabel}>Zone</Text>
                </Column>
                <Column style={detailValueCol}>
                  <Text style={detailValue}>{zone}</Text>
                </Column>
              </Row>

              <Row style={assignmentTime ? detailRow : detailRowLast}>
                <Column style={detailLabelCol}>
                  <Text style={detailLabel}>Space</Text>
                </Column>
                <Column style={detailValueCol}>
                  <Text style={detailValueHighlight}>{slotNumber}</Text>
                </Column>
              </Row>

              {assignmentTime && (
                <Row style={detailRowLast}>
                  <Column style={detailLabelCol}>
                    <Text style={detailLabel}>Time</Text>
                  </Column>
                  <Column style={detailValueCol}>
                    <Text style={detailValue}>{assignmentTime}</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Action CTA */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={dashboardUrl}>
                Open Customer Dashboard
              </Button>
            </Section>

            <Text style={infoText}>
              Use the dashboard to view your assigned location, Find My Car navigation and digital exit pass.
            </Text>

            <Text style={securityNotice}>
              This secure link is valid only for your current parking session.
            </Text>

            <Hr style={dividerLight} />

            {/* Fallback Link for button-blocked clients */}
            <Text style={fallbackNotice}>
              If the button above does not work, copy and paste this URL into your browser:
            </Text>
            <Text style={fallbackUrl}>
              <a href={dashboardUrl} style={fallbackLink}>
                {dashboardUrl}
              </a>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              ParkNex Automated Parking Infrastructure · Central Mall Grand
            </Text>
            <Text style={footerSubtext}>
              This is an automated notification triggered upon physical gate entry.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Theme Styles (Red, White, Beige) ──
const main = {
  backgroundColor: "#FAF7F2",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0 auto",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #DED3C7",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "560px",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(70, 48, 35, 0.06)",
};

const headerSection = {
  padding: "24px 32px 16px 32px",
  backgroundColor: "#FFFFFF",
  textAlign: "center" as const,
};

const brandText = {
  color: "#C93B2F",
  fontSize: "22px",
  fontWeight: "900",
  letterSpacing: "2px",
  margin: "0",
};

const brandSubtext = {
  color: "#70675F",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  margin: "4px 0 0 0",
};

const divider = {
  borderColor: "#DED3C7",
  margin: "0",
};

const dividerLight = {
  borderColor: "#EFE8DF",
  margin: "24px 0 16px 0",
};

const contentSection = {
  padding: "32px",
};

const badge = {
  display: "inline-block",
  backgroundColor: "rgba(47, 125, 90, 0.1)",
  border: "1px solid rgba(47, 125, 90, 0.3)",
  borderRadius: "6px",
  color: "#2F7D5A",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "1px",
  padding: "4px 10px",
  margin: "0 0 12px 0",
};

const heading = {
  color: "#241F1B",
  fontSize: "22px",
  fontWeight: "800",
  lineHeight: "1.3",
  margin: "0 0 8px 0",
};

const subheading = {
  color: "#70675F",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 24px 0",
};

const detailsCard = {
  backgroundColor: "#FAF7F2",
  border: "1px solid #DED3C7",
  borderRadius: "12px",
  padding: "16px 20px",
  margin: "0 0 24px 0",
};

const detailRow = {
  borderBottom: "1px solid #EFE8DF",
  padding: "8px 0",
};

const detailRowLast = {
  padding: "8px 0 0 0",
};

const detailLabelCol = {
  width: "35%",
};

const detailValueCol = {
  width: "65%",
};

const detailLabel = {
  color: "#70675F",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0",
};

const detailValue = {
  color: "#241F1B",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0",
};

const detailValuePlate = {
  color: "#241F1B",
  fontFamily: "monospace",
  fontSize: "15px",
  fontWeight: "800",
  margin: "0",
};

const detailValueHighlight = {
  color: "#C93B2F",
  fontSize: "15px",
  fontWeight: "800",
  margin: "0",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const ctaButton = {
  backgroundColor: "#C93B2F",
  borderRadius: "12px",
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "700",
  padding: "14px 28px",
  textDecoration: "none",
  textAlign: "center" as const,
  boxShadow: "0 4px 16px rgba(201, 59, 47, 0.25)",
};

const infoText = {
  color: "#241F1B",
  fontSize: "13.5px",
  lineHeight: "1.5",
  margin: "0 0 10px 0",
  textAlign: "center" as const,
};

const securityNotice = {
  color: "#70675F",
  fontSize: "12px",
  lineHeight: "1.4",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const fallbackNotice = {
  color: "#70675F",
  fontSize: "11px",
  margin: "0 0 4px 0",
};

const fallbackUrl = {
  fontSize: "11px",
  fontFamily: "monospace",
  wordBreak: "break-all" as const,
  margin: "0",
};

const fallbackLink = {
  color: "#C93B2F",
  textDecoration: "underline",
};

const footerSection = {
  backgroundColor: "#FAF7F2",
  borderTop: "1px solid #DED3C7",
  padding: "20px 32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#70675F",
  fontSize: "11.5px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const footerSubtext = {
  color: "#938980",
  fontSize: "10.5px",
  margin: "0",
};
