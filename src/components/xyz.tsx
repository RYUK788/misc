/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable no-console */

import React from 'react';
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
} from 'antd';
import moment from 'moment';
import type { Moment } from 'moment';
import { CalendarOutlined } from '@ant-design/icons';
import originCodes from '../originCodes';

// --- Mocked Utility Functions (to match your provided structure) ---
const withToasts = <P extends object>(Component: React.ComponentType<P>) => (props: P) => <Component {...props} />; // Mock HOC
const fetchData = (query: string) => {
  console.log('Executing Mock Fetch:', query);
  return Promise.resolve({ success: true });
};
// -------------------------------------------------------------------

interface OriginTestResultsProps {
  // Define any props your component might need, e.g., for closing the form
  closeForm?: () => void;
}

interface OriginTestResultsValues {
/**
 * This form is linked in src/features/Pellet/index.tsx and is shown when activeFormButton === 6.
 * To show this form, set activeFormButton to 6 in the parent Pellet component.
 */
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
  loadNumber: '',
  gramsPerQuart: '',
  lbsPerCubicFoot: '0.0000',
  forceToBreakGrams: '',
  forceToBreakLbs: '0.0000',
  // Sieve inputs
  grams8Mesh: '',
  grams14Mesh: '',
  grams16Mesh: '',
  grams20Mesh: '',
  grams30Mesh: '',
  grams40Mesh: '',
  grams50Mesh: '',
  gramsBottomPan: '',
  // Sieve calculated
  totalGrams: '0.0',
  percent8Mesh: '0.00 %',
  percent14Mesh: '0.00 %',
  percent16Mesh: '0.00 %',
  percent20Mesh: '0.00 %',
  percent30Mesh: '0.00 %',
  percent40Mesh: '0.00 %',
  percent50Mesh: '0.00 %',
  percentPan: '0.00 %',
  totalPercent: '0.00 %',
};

const sieveGramFields = [
  'grams8Mesh', 'grams14Mesh', 'grams16Mesh', 'grams20Mesh',
  'grams30Mesh', 'grams40Mesh', 'grams50Mesh', 'gramsBottomPan',
];

function OriginTestResults(props: OriginTestResultsProps) {
  const [form] = Form.useForm<OriginTestResultsValues>();

  const openNotification = (placement: any) => {
    notification.success({
      message: `Origin Data saved successfully`,
      placement,
    });
  };

  const handleValuesChange = (changedValues: Partial<OriginTestResultsValues>, allValues: OriginTestResultsValues) => {
    const changedField = Object.keys(changedValues)[0];

    // 1. Bulk Density Calculation
    if (changedField === 'gramsPerQuart') {
      const grams = parseFloat(changedValues.gramsPerQuart ?? '') || 0;
      const lbs = grams * 0.065967;
      form.setFieldsValue({ lbsPerCubicFoot: lbs.toFixed(4) });
    }

    // 2. Hardness Calculation
    if (changedField === 'forceToBreakGrams') {
      const grams = parseFloat(changedValues.forceToBreakGrams ?? '') || 0;
      const lbs = grams * 0.002205;
      form.setFieldsValue({ forceToBreakLbs: lbs.toFixed(4) });
    }
    
    // 3. Sieve Analysis Calculation
    if (sieveGramFields.includes(changedField)) {
      // Add index signature to allow string indexing
      const allValuesAny = allValues as Record<string, any>;
      const gramValues = sieveGramFields.map((field) => parseFloat(allValuesAny[field]) || 0);
      const totalGrams = gramValues.reduce((sum, val) => sum + val, 0);

      const calculatePercent = (grams: number) => (totalGrams > 0 ? (grams / totalGrams) * 100 : 0);
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
    // Resetting doesn't trigger onValuesChange, so manually set calculated fields back
    form.setFieldsValue({
      lbsPerCubicFoot: '0.0000',
      forceToBreakLbs: '0.0000',
      totalGrams: '0.0',
      totalPercent: '0.00 %',
      percent8Mesh: '0.00 %',
      percent14Mesh: '0.00 %',
      percent16Mesh: '0.00 %',
      percent20Mesh: '0.00 %',
      percent30Mesh: '0.00 %',
      percent40Mesh: '0.00 %',
      percent50Mesh: '0.00 %',
      percentPan: '0.00 %',
    });
  };

  const onSubmitForm = async () => {
    try {
      const values = await form.validateFields();
      const insertQuery = `INSERT INTO Origin_Testing (
      [Date], [User], [Load Number], [Origin], [Grams per quart], [Lbs per Cubic Foot],
      [8Mesh], [14Mesh], [16Mesh], [20Mesh], [30Mesh], [40Mesh], [50Mesh], [Pan],
      [totalGrams], [totalPercent], [forceToBreakGrams], [forceToBreakLbs]
      ) VALUES (
        '${values.date.format('YYYY-MM-DD')}',
        '${values.user}',
        '${values.loadNumber}',
        '${values.originCode}',
        '${values.gramsPerQuart}',
        '${values.lbsPerCubicFoot}',
        '${values.grams8Mesh}',
        '${values.grams14Mesh}',
        '${values.grams16Mesh}',
        '${values.grams20Mesh}',
        '${values.grams30Mesh}',
        '${values.grams40Mesh}',
        '${values.grams50Mesh}',
        '${values.gramsBottomPan}',
        '${values.totalGrams}',
        '${values.totalPercent}',
        '${values.forceToBreakGrams}',
        '${values.forceToBreakLbs}'
      );`;
      await fetchData(insertQuery);
      openNotification('bottomRight');
      newForm();
    } catch (error) {
      console.log('Validation Failed:', error);
    }
  };

  const handleClose = () => {
    if (props.closeForm) {
      props.closeForm();
    } else {
      console.log('Form closed');
    }
  };

  return (
    <ConfigProvider>
      <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Form form={form} layout="vertical" initialValues={defaultFormValues} onValuesChange={handleValuesChange}>
            <h1 style={{ textAlign: 'center', color: '#000305ff' }}>Origin Test Results Form</h1>
            
            {/* --- General Information --- */}
            <Row gutter={16}>
              <Col span={6}><Form.Item label="Date" name="date"><DatePicker style={{ width: '100%' }} suffixIcon={<CalendarOutlined />} /></Form.Item></Col>
              <Col span={6}><Form.Item label="User" name="user"><Input placeholder="Enter user" maxLength={100} /></Form.Item></Col>
              <Col span={6}>

    <Form.Item label="Origin Code" name="originCode">
    <Select placeholder="Select Code">
      {[...originCodes].map(code => (
        <Select.Option key={code} value={code.split(' ')[0]}>
          {code}
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
</Col>
              <Col span={6}><Form.Item label="Load Number" name="loadNumber"><Input placeholder="20 digits letters & numbers" maxLength={20} /></Form.Item></Col>
            </Row>

            {/* --- Bulk Density & Hardness --- */}
            <Row gutter={16}>
              <Col span={12}>
                <fieldset style={{ border: '2px solid #d9d9d9', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
                  <legend style={{ padding: '0 8px', fontWeight: 'bold', color: '#000000ff' }}>BULK DENSITY</legend>
                  <Row gutter={16}>
                    <Col span={12}><Form.Item label="Grams per Quart" name="gramsPerQuart"><Input type="number" placeholder="XXX" /></Form.Item></Col>
                    <Col span={12}><Form.Item label="Lbs per Cubic Foot" name="lbsPerCubicFoot"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item></Col>
                  </Row>
                </fieldset>
              </Col>
              <Col span={12}>
                <fieldset style={{ border: '2px solid #d9d9d9', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
                  <legend style={{ padding: '0 8px', fontWeight: 'bold', color: '#070707ff' }}>HARDNESS</legend>
                  <Row gutter={16}>
                    <Col span={12}><Form.Item label="Force to Break (Grams)" name="forceToBreakGrams"><Input type="number" placeholder="X,XXX" /></Form.Item></Col>
                    <Col span={12}><Form.Item label="Force to Break (Lbs)" name="forceToBreakLbs"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item></Col>
                  </Row>
                </fieldset>
              </Col>
            </Row>

            {/* --- Sieve Analysis --- */}
            <fieldset style={{ border: '2px solid #d9d9d9', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
              <legend style={{ padding: '0 8px', fontWeight: 'bold', color: '#0d0d0eff' }}>SIEVE ANALYSIS</legend>
              <Row gutter={16}>
                <Col span={12}>
                  {sieveGramFields.map((field) => {
                    const match = field.match(/\d+|Pan/g);
                    const meshLabel = match && match[0] ? match[0] : field;
                    return (
                      <Form.Item key={field} label={`Grams in ${meshLabel} Mesh Pan`} name={field}>
                        <Input type="number" placeholder="XXX.X" />
                      </Form.Item>
                    );
                  })}
                  <Form.Item label="Total Grams" name="totalGrams"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="8 Mesh %" name="percent8Mesh"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                  <Form.Item label="14 Mesh %" name="percent14Mesh"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                  <Form.Item label="16 Mesh %" name="percent16Mesh"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                  <Form.Item label="20 Mesh %" name="percent20Mesh"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                  <Form.Item label="30 Mesh %" name="percent30Mesh"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                  <Form.Item label="40 Mesh %" name="percent40Mesh"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                  <Form.Item label="50 Mesh %" name="percent50Mesh"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                  <Form.Item label="Pan %" name="percentPan"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                  <Form.Item label="Total % Check" name="totalPercent"><Input readOnly style={{ backgroundColor: '#f5f5f5', color: '#666' }} /></Form.Item>
                </Col>
              </Row>
            </fieldset>

            {/* --- Action Buttons --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <AntButton type="default" size="large" onClick={newForm}>New</AntButton>
              <div>
                <AntButton type="default" size="large" style={{ marginRight: 8 }} onClick={handleClose}>Close</AntButton>
                <AntButton type="primary" size="large" onClick={onSubmitForm}>Save</AntButton>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default withToasts(OriginTestResults);