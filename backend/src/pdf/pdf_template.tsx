import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { fileURLToPath } from "node:url";
import { CreditHourCategory } from "~/database/schema";

Font.register({
  family: "Great Vibes",
  src: "http://fonts.gstatic.com/s/greatvibes/v4/6q1c0ofG6NKsEhAc2eh-3Z0EAVxt0G0biEntp43Qt6E.ttf",
});

const logoSrc = fileURLToPath(new URL("./vrwa-logo.png", import.meta.url));

const ACCENT_BLUE = "#6A92C4";
const LABEL_GRAY = "#555555";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    paddingTop: 72,
    paddingBottom: 56,
    paddingHorizontal: 48,
    alignItems: "center",
  },
  content: {
    width: 340,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    color: "#000000",
    textAlign: "center",
    marginBottom: 16,
  },
  rule: {
    width: "100%",
    borderBottomWidth: 2,
    borderBottomColor: ACCENT_BLUE,
    marginBottom: 28,
  },
  label: {
    fontSize: 11,
    color: LABEL_GRAY,
    textAlign: "center",
    marginBottom: 8,
  },
  recipient: {
    fontSize: 18,
    color: "#000000",
    textAlign: "center",
    marginBottom: 28,
  },
  course: {
    fontSize: 18,
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
  },
  tchLine: {
    fontSize: 13,
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  subcategoryLine: {
    fontSize: 11,
    color: "#000000",
    textAlign: "center",
    marginBottom: 28,
  },
  metaRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 28,
  },
  metaText: {
    fontSize: 11,
    color: LABEL_GRAY,
  },
  footer: {
    width: 460,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
  },
  logo: {
    width: 230,
    height: 55,
    objectFit: "contain",
  },
  signatureBlock: {
    width: 180,
    alignItems: "center",
  },
  signature: {
    fontFamily: "Great Vibes",
    fontSize: 24,
    color: "#000000",
    marginBottom: 2,
  },
  signatureRule: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginBottom: 6,
  },
  signerTitle: {
    fontSize: 9.5,
    color: "#000000",
    textAlign: "center",
  },
});

function isWaterCategory(category: CreditHourCategory): boolean {
  return (
    category === CreditHourCategory.Water ||
    category.startsWith(`${CreditHourCategory.Water}:`)
  );
}

function formatDomainSuffix(
  categories: CreditHourCategory[] | undefined,
): string {
  if (!categories?.length) {
    return "";
  }

  const hasWater = categories.some(isWaterCategory);
  const hasWastewater = categories.includes(CreditHourCategory.Wastewater);

  if (hasWater && hasWastewater) {
    return " — Water & Wastewater";
  }
  if (hasWater) {
    return " — Water";
  }
  if (hasWastewater) {
    return " — Wastewater";
  }
  return "";
}

function formatSubcategories(
  categories: CreditHourCategory[] | undefined,
): string | undefined {
  if (!categories?.length) {
    return undefined;
  }

  const labels: string[] = [];

  for (const category of categories) {
    switch (category) {
      case CreditHourCategory.WaterC1:
        labels.push("Water Treatment Category 1");
        break;
      case CreditHourCategory.WaterC2:
        labels.push("Water Treatment Category 2");
        break;
      case CreditHourCategory.WaterC3:
        labels.push("Water Treatment Category 3");
        break;
      case CreditHourCategory.WaterD1:
        labels.push("Distribution Category 1");
        break;
      case CreditHourCategory.WaterD2:
        labels.push("Distribution Category 2");
        break;
      case CreditHourCategory.WaterD3:
        labels.push("Distribution Category 3");
        break;
      default:
        break;
    }
  }

  return labels.length > 0 ? labels.join(", ") : undefined;
}

function formatTchLine(
  creditHours: string | number | undefined,
  categories: CreditHourCategory[] | undefined,
): string | undefined {
  if (creditHours == null || creditHours === "") {
    return undefined;
  }

  return `${creditHours} TCH${formatDomainSuffix(categories)}`;
}

export interface CertificateDocumentProps {
  name?: string;
  course?: string;
  creditHours?: string | number;
  creditHourCategories?: CreditHourCategory[];
  location?: string;
  date?: string;
  signerName?: string;
  signerTitle?: string;
}

const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  name = "Name here",
  course = "Course here",
  creditHours,
  creditHourCategories,
  location,
  date,
  signerName = "Allison Smith",
  signerTitle = "Training Administrator",
}) => {
  const tchLine = formatTchLine(creditHours, creditHourCategories);
  const subcategoryLine = formatSubcategories(creditHourCategories);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.content}>
          <Text style={styles.title}>Certificate of Completion</Text>
          <View style={styles.rule} />

          <Text style={styles.label}>Awarded to</Text>
          <Text style={styles.recipient}>{name}</Text>

          <Text style={styles.label}>For Training in</Text>
          <Text style={styles.course}>{course}</Text>

          {tchLine ? <Text style={styles.tchLine}>{tchLine}</Text> : null}
          {subcategoryLine ? (
            <Text style={styles.subcategoryLine}>{subcategoryLine}</Text>
          ) : (
            <View style={{ marginBottom: 28 }} />
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{location ?? ""}</Text>
            <Text style={styles.metaText}>{date ?? ""}</Text>
          </View>

          <View style={styles.rule} />
        </View>

        <View style={styles.footer}>
          <Image style={styles.logo} src={logoSrc} />
          <View style={styles.signatureBlock}>
            <Text style={styles.signature}>{signerName}</Text>
            <View style={styles.signatureRule} />
            <Text style={styles.signerTitle}>
              {signerName}, {signerTitle}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export { CertificateDocument };
