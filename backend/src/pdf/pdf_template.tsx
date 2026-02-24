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

//register title font
Font.register({
  family: "Great Vibes",
  src: "http://fonts.gstatic.com/s/greatvibes/v4/6q1c0ofG6NKsEhAc2eh-3Z0EAVxt0G0biEntp43Qt6E.ttf",
});

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#F1E9D2",
    orientation: "landscape",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    margin: 20,
    fontFamily: "Great Vibes",
  },
  text: {
    fontSize: 12,
    margin: 10,
    fontFamily: "Times-Roman",
  },
  borders: {
    borderColor: "green",
    borderWidth: 5,
    borderStyle: "solid",
    margin: 10,
  },
  imageContainer: {
    position: "absolute",
    right: 15,
    bottom: 15,
  },
  image: {
    width: 100,
    height: 100,
  },
});

// Create props for user specfific information
interface CertificateDocumentProps {
  name?: string;
  date?: string;
  course?: string; // not sure if certificates are course specific ?
}

const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  name = "Name here",
  date = "Date here",
  course = "Course here",
}) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.borders}>
        <Text style={styles.title}>Certificate of Completion</Text>
        <Text style={styles.text}>
          This Certificate of Completion is Awarded To
        </Text>
        <Text style={{ ...styles.text, fontSize: 20, textAlign: "center" }}>
          {name}
        </Text>
        <Text style={styles.text}>
          has successfully completed {course} training.
        </Text>
        <Text style={styles.text}>Date: {date}</Text>
        <View style={styles.imageContainer}>
          <Image style={styles.image} src="completion_seal.png" />
        </View>
      </View>
    </Page>
  </Document>
);

export { CertificateDocument };
