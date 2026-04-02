import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface BaseLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export const BaseLayout = ({ previewText, children }: BaseLayoutProps) => {
  return (
    <Html lang="ru">
      <Head>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          `}
        </style>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>🛍️</Text>
            <Text style={brandName}>MerchCRM</Text>
          </Section>
          
          <Section style={content}>
            {children}
          </Section>

          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              MerchCRM · Это автоматическое письмо, пожалуйста, не отвечайте на него.
            </Text>
            <Text style={footerSubtext}>
              © {new Date().getFullYear()} Merch-CRM Team. Все права защищены.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "48px 16px",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e4e4e7",
  padding: "40px",
  maxWidth: "480px",
  margin: "0 auto",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const header = {
  textAlign: "center" as const,
  paddingBottom: "24px",
  borderBottom: "1px solid #f0f0f0",
};

const logo = {
  fontSize: "28px",
  margin: "0",
};

const brandName = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#18181b",
  margin: "8px 0 0",
};

const content = {
  padding: "32px 0",
};

const hr = {
  borderTop: "1px solid #f0f0f0",
  margin: "24px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#d4d4d8",
  margin: "0",
};

const footerSubtext = {
  fontSize: "10px",
  color: "#a1a1aa",
  margin: "4px 0 0",
};
