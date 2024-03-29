import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Form, Input, Button, notification, Select, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import './addNew.css';

const { useForm } = Form;

function AddCompEq() {
  const [form] = useForm();
  const [dataSource, setDataSource] = useState([]);
  const [owner, setOwner] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  //Fetching owner from employee API
  useEffect(() => {
    async function fetchOwners() {
      try {
        const res = await axios.get(
          'https://autovaq.herokuapp.com/api/employee/',
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        setOwner(res.data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchOwners();
  }, [token]);

  //onFinish function that validates fields, makes a POST request to a API
  const onFinish = useCallback(
    async values => {
      const requiredFields = ['device_name', 'notes'];
      try {
        for (const field of requiredFields) {
          const value = values[field];
          if (typeof value !== 'string' || value.trim().length === 0) {
            notification.error({
              message: 'Fields cannot be empty or contain only spaces',
              description: `Enter proper details in "${field}" field`,
            });
            return;
          }
        }

        const data = {
          ...values,
        };

        const token = localStorage.getItem('token');
        const res = await axios.post(
          'https://autovaq.herokuapp.com/api/computer/',
          data,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        setDataSource([...dataSource, res.data]);
        form.resetFields();
        notification.success({
          message: 'Success',
          description: 'Computer equipment added successfully.',
        });
        navigate('/computer_equip');
      } catch (err) {
        console.log(err);
        notification.error({
          message: 'Error',
          description: 'Failed to add computer equipment.',
        });
      }
    },
    [form, dataSource, navigate]
  );

  return (
    <Layout style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="bodyAddNew">
        <h1>Computer equipment</h1>
        <Form className="FormAddNew" form={form} onFinish={onFinish}>
          <Form.Item
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            className="formLabel"
            name="owner"
            label="Employee"
          >
            <Select placeholder="Select your name" className="inputField">
              {owner.map(owner => (
                <Select.Option key={owner.id} value={owner.id}>
                  {owner.name} {owner.surname} {owner.lastname}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            className="formLabel"
            name="device_name"
            label="Name of the equipment"
          >
            <Input
              placeholder="Enter the name of the equipment"
              className="inputField"
            />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            className="formLabel"
            s
            name="notes"
            label="Note"
          >
            <Input.TextArea
              placeholder="Enter a note"
              style={{ height: 100 }}
              className="inputFieldNote"
            />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            className="formLabel"
            name="condition"
            initialValue="Свободное"
          >
            <Input type="hidden" />
          </Form.Item>

          <Form.Item className="d-flex justify-content-center">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
}

export default AddCompEq;
