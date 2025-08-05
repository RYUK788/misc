// Helper to build SQL insert query string for legacy API
function sqlValue(val: string, isPercent = false) {
  if (!val || val.trim() === "") return "NULL";
  if (isPercent) {
    // Remove % and spaces, then return as number string
    return `'${val.replace(/[%\s]/g, "")}'`;
  }
  return `'${val}'`;
}
function buildInsertQuery(values: OriginTestResultsValues) {
  return `INSERT INTO Origin_Testing (
    \`Date\`, \`User\`, \`Load_Number\`, \`Origin\`, \`grams_per_quart\`, \`lbs_per_cubic_foot\`,
    \`8Mesh\`, \`14Mesh\`, \`16Mesh\`, \`20Mesh\`, \`30Mesh\`, \`40Mesh\`, \`50Mesh\`, \`Pan\`,
    \`total_grams\`, \`total_percent\`, \`force_to_break_grams\`, \`force_to_break_lbs\`
  ) VALUES (
    '${values.date.format("YYYY-MM-DD")}',
    '${values.user}',
    '${values.loadNumber}',
    '${values.originCode}',
    ${sqlValue(values.gramsPerQuart)},
    ${sqlValue(values.lbsPerCubicFoot)},
    ${sqlValue(values.grams8Mesh)},
    ${sqlValue(values.grams14Mesh)},
    ${sqlValue(values.grams16Mesh)},
    ${sqlValue(values.grams20Mesh)},
    ${sqlValue(values.grams30Mesh)},
    ${sqlValue(values.grams40Mesh)},
    ${sqlValue(values.grams50Mesh)},
    ${sqlValue(values.gramsBottomPan)},
    ${sqlValue(values.totalGrams)},
    ${sqlValue(values.totalPercent, true)},
    ${sqlValue(values.forceToBreakGrams)},
    ${sqlValue(values.forceToBreakLbs)}
  );`;
}
import React, { useState, useEffect } from "react";
import {
  Col,
  Row,
  Button as AntButton,
  DatePicker,
  notification,
  Form,
  Input,
  Select,
  ConfigProvider,
} from "antd";
import moment from "moment";
import type { Moment } from "moment";
import { CalendarOutlined } from "@ant-design/icons";
import originCodes from "../originCodes";

// --- Mocked Utility Functions ---
const withToasts =
  <P extends object>(Component: React.ComponentType<P>) =>
  (props: P) =>
    <Component {...props} />; // Mock HOC
// Removed fetchData. Use real API call in onSubmitForm.
// -------------------------------------------------------------------

// Custom component for the grey section headers
const SectionHeader = ({ title }: { title: string }) => (
  <div
    style={{
      backgroundColor: "#6c757d",
      color: "white",
      padding: "8px 16px",
      textAlign: "center",
      fontWeight: 500,
      margin: "24px 0 16px 0",
      borderRadius: "4px",
    }}
  >
    {title.toUpperCase()}
  </div>
);

interface OriginTestResultsProps {
  closeForm?: () => void;
}

interface OriginTestResultsValues {
  date: Moment;
  user: string;
  originCode: string;
  loadNumber: string;
  gramsPerQuart: string;
  lbsPerCubicFoot: string;
  grams8Mesh: string;
  grams14Mesh: string;
  grams16Mesh: string;
  grams20Mesh: string;
  grams30Mesh: string;
  grams40Mesh: string;
  grams50Mesh: string;
  gramsBottomPan: string;
  totalGrams: string;
  percent8Mesh: string;
  percent14Mesh: string;
  percent16Mesh: string;
  percent20Mesh: string;
  percent30Mesh: string;
  percent40Mesh: string;
  percent50Mesh: string;
  percentPan: string;
  totalPercent: string;
  forceToBreakGrams: string;
  forceToBreakLbs: string;
}

const defaultFormValues: Partial<OriginTestResultsValues> = {
  date: moment(),
  user: "",
  originCode: "", // for placeholder
  loadNumber: "",
  gramsPerQuart: "",
  lbsPerCubicFoot: "0.0000",
  forceToBreakGrams: "",
  forceToBreakLbs: "0.0000", // Sieve inputs
  grams8Mesh: "",
  grams14Mesh: "",
  grams16Mesh: "",
  grams20Mesh: "",
  grams30Mesh: "",
  grams40Mesh: "",
  grams50Mesh: "",
  gramsBottomPan: "", // Sieve calculated
  totalGrams: "0.0",
  percent8Mesh: "0.00 %",
  percent14Mesh: "0.00 %",
  percent16Mesh: "0.00 %",
  percent20Mesh: "0.00 %",
  percent30Mesh: "0.00 %",
  percent40Mesh: "0.00 %",
  percent50Mesh: "0.00 %",
  percentPan: "0.00 %",
  totalPercent: "0.00 %",
};

const sieveGramFields = [
  "grams8Mesh",
  "grams14Mesh",
  "grams16Mesh",
  "grams20Mesh",
  "grams30Mesh",
  "grams40Mesh",
  "grams50Mesh",
  "gramsBottomPan",
];

function LabResults(props: OriginTestResultsProps) {
  const [form] = Form.useForm<OriginTestResultsValues>();
  const [users, setUsers] = useState<{ user: string }[]>([]);

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("API Response:", data); 
      // Map the response to match the expected { user: string } structure
      const formattedUsers = data.map((item: { username: string }) => ({
      user: item.username,
      }));
setUsers(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      notification.error({
        message: "Failed to load users",
        description: "Could not fetch user data from the server. Check console for details.",
      });
    }
  };

  fetchUsers();
}, []);

  const openNotification = (placement: any) => {
    notification.success({
      message: `Origin Data saved successfully`,
      placement,
    });
  };

  const handleValuesChange = (
    changedValues: Partial<OriginTestResultsValues>,
    allValues: OriginTestResultsValues
  ) => {
    const changedField = Object.keys(changedValues)[0];

    if (changedField === "gramsPerQuart") {
      const grams = parseFloat(changedValues.gramsPerQuart ?? "") || 0;
      const lbs = grams * 0.065967;
      form.setFieldsValue({ lbsPerCubicFoot: lbs.toFixed(4) });
    }

    if (changedField === "forceToBreakGrams") {
      const grams = parseFloat(changedValues.forceToBreakGrams ?? "") || 0;
      const lbs = grams * 0.002205;
      form.setFieldsValue({ forceToBreakLbs: lbs.toFixed(4) });
    }

    if (sieveGramFields.includes(changedField)) {
      const allValuesAny = allValues as Record<string, any>;
      const gramValues = sieveGramFields.map(
        (field) => parseFloat(allValuesAny[field]) || 0
      );
      const totalGrams = gramValues.reduce((sum, val) => sum + val, 0);

      const calculatePercent = (grams: number) =>
        totalGrams > 0 ? (grams / totalGrams) * 100 : 0;
      const percentages = gramValues.map(calculatePercent);
      const totalPercent = percentages.reduce((sum, val) => sum + val, 0);

      form.setFieldsValue({
        totalGrams: totalGrams.toFixed(1),
        percent8Mesh: `${percentages[0].toFixed(2)} %`,
        percent14Mesh: `${percentages[1].toFixed(2)} %`,
        percent16Mesh: `${percentages[2].toFixed(2)} %`,
        percent20Mesh: `${percentages[3].toFixed(2)} %`,
        percent30Mesh: `${percentages[4].toFixed(2)} %`,
        percent40Mesh: `${percentages[5].toFixed(2)} %`,
        percent50Mesh: `${percentages[6].toFixed(2)} %`,
        percentPan: `${percentages[7].toFixed(2)} %`,
        totalPercent: `${totalPercent.toFixed(2)} %`,
      });
    }
  };

  const newForm = () => {
    form.resetFields();
    form.setFieldsValue({
      ...defaultFormValues,
      date: moment(),
    });
  };

  const onSubmitForm = async () => {
    try {
      const values = await form.validateFields();
      const insertQuery = buildInsertQuery(values);
      const response = await fetch("/api/lab-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: insertQuery, params: [] }),
      });
      const result = await response.json();
      console.log("API result:", result);
      if (result.success) {
        openNotification("bottomRight");
        newForm();
      } else {
        notification.error({ message: result.error || "Failed to save data" });
      }
    } catch (error) {
      console.log("Validation Failed or Network Error:", error);
      notification.error({ message: "Network or Validation Error", description: (error && (error as any).message) || String(error) });
    }
  };

  const handleClose = () => {
    if (props.closeForm) {
      props.closeForm();
    } else {
      console.log("Form closed");
    }
  };

  return (
    <ConfigProvider>
      <div
        style={{
          padding: "24px",
          backgroundColor: "white",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "none",
          }}
        >
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            initialValues={defaultFormValues}
            onValuesChange={handleValuesChange}
          >
            <h1 style={{ textAlign: "center", marginBottom: "24px" }}>
              LAB Form
            </h1>

            {/* --- General Information --- */}
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Date" name="date">
                  <DatePicker
                    style={{ width: "100%" }}
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="User" name="user">
                  <Select placeholder="Select User">
                    {users.map((u) => (
                      <Select.Option key={u.user} value={u.user}>
                        {u.user}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Origin Code" name="originCode">
                  <Select placeholder="Select Code">
                    {[...originCodes].map((code) => (
                      <Select.Option key={code} value={code.split(" ")[0]}>
                        {code}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Load Number" name="loadNumber">
                  <Input
                    placeholder="20 digits letters & numbers"
                    maxLength={20}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* --- Bulk Density --- */}
            <SectionHeader title="BULK DENSITY" />
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Grams per Quart" name="gramsPerQuart">
                  <Input type="number" placeholder="XXX" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Lbs per Cubic Foot" name="lbsPerCubicFoot">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* --- Hardness --- */}
            <SectionHeader title="HARDNESS" />
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Force to Break (Grams)"
                  name="forceToBreakGrams"
                >
                  <Input type="number" placeholder="X,XXX" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Force to Break (Lbs)" name="forceToBreakLbs">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* --- Sieve Analysis --- */}
            <SectionHeader title="SIEVE ANALYSIS" />
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Grams in 8 Mesh Pan" name="grams8Mesh">
                  <Input type="number" placeholder="XXX.X" />
                </Form.Item>
                <Form.Item label="Grams in 14 Mesh Pan" name="grams14Mesh">
                  <Input type="number" placeholder="XXX.X" />
                </Form.Item>
                <Form.Item label="Grams in 16 Mesh Pan" name="grams16Mesh">
                  <Input type="number" placeholder="XXX.X" />
                </Form.Item>
                <Form.Item label="Grams in 20 Mesh Pan" name="grams20Mesh">
                  <Input type="number" placeholder="XXX.X" />
                </Form.Item>
                <Form.Item label="Grams in 30 Mesh Pan" name="grams30Mesh">
                  <Input type="number" placeholder="XXX.X" />
                </Form.Item>
                <Form.Item label="Grams in 40 Mesh Pan" name="grams40Mesh">
                  <Input type="number" placeholder="XXX.X" />
                </Form.Item>
                <Form.Item label="Grams in 50 Mesh Pan" name="grams50Mesh">
                  <Input type="number" placeholder="XXX.X" />
                </Form.Item>
                <Form.Item label="Grams in Bottom Pan" name="gramsBottomPan">
                  <Input type="number" placeholder="XXX.X" />
                </Form.Item>
                <Form.Item label="Total Grams" name="totalGrams">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="8 Mesh %" name="percent8Mesh">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
                <Form.Item label="14 Mesh %" name="percent14Mesh">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
                <Form.Item label="16 Mesh %" name="percent16Mesh">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
                <Form.Item label="20 Mesh %" name="percent20Mesh">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
                <Form.Item label="30 Mesh %" name="percent30Mesh">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
                <Form.Item label="40 Mesh %" name="percent40Mesh">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
                <Form.Item label="50 Mesh %" name="percent50Mesh">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
                <Form.Item label="Pan %" name="percentPan">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
                <Form.Item label="Total % Check" name="totalPercent">
                  <Input
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", color: "#666" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* --- Action Buttons --- */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}
            >
              <AntButton
                type="default"
                size="large"
                onClick={newForm}
                style={{ backgroundColor: "#454E7C", color: "white" }}
              >
                New
              </AntButton>
              <div>
                <AntButton
                  type="default"
                  size="large"
                  style={{ marginRight: 8, backgroundColor: "#454E7C", color: "white" }}
                  onClick={handleClose}
                >
                  Close
                </AntButton>
                <AntButton
                  type="primary"
                  size="large"
                  onClick={onSubmitForm}
                  style={{ backgroundColor: "#454E7C", borderColor: "#454E7C" }}
                >
                  Save
                </AntButton>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default withToasts(LabResults);