import { useState, useEffect } from 'react';
import {
  Table,
  Popconfirm,
  Button,
  Space,
  Form,
  Input,
  message,
  Modal,
} from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { CSVLink } from 'react-csv';
import { Layout } from 'antd';
import axios from 'axios';
import Spinner from '../components/Spinner/Spinner';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;

function Employee() {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRowKey, setEditRowKey] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(true);
    axios
      .get('https://autovaq.herokuapp.com/api/employee/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then(res => {
        setDataSource(res.data.sort((a, b) => a.id - b.id));
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = value => {
    const token = localStorage.getItem('token');
    axios
      .delete(`https://autovaq.herokuapp.com/api/employee/${value.id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then(res => {
        let newContact = [...dataSource].filter(item => item.id !== value.id);
        setDataSource(newContact);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleView = record => {
    Modal.info({
      title: 'View Row Data',
      content: (
        <div>
          {Object.keys(record).map(key =>
            record[key] ? (
              <p key={key}>
                {key}: {record[key]}
              </p>
            ) : (
              <p key={key}>{key}: None</p>
            )
          )}
        </div>
      ),
      onOk() {},
    });
  };

  const isEditing = record => {
    return record.id === editRowKey;
  };

  const cancel = () => {
    setEditRowKey('');
  };

  const save = async id => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex(item => id === item.id);
      if (index > -1) {
        const item = newData[index];
        const token = localStorage.getItem('token');
        axios
          .put(
            `https://autovaq.herokuapp.com/api/employee/${item.id}/`,
            {
              ...row,
            },
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          )
          .then(res => {
            newData.splice(index, 1, { ...item, ...row });
            setDataSource(newData);
            setEditRowKey('');
            message.success('Changes saved successfully');
          })
          .catch(err => {
            message.error(err);
          });
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  const edit = record => {
    form.setFieldsValue({
      ...record,
    });
    setEditRowKey(record.id);
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      editTable: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editTable: true,
    },
    {
      title: 'Surname',
      dataIndex: 'surname',
      key: 'surname',
      editTable: true,
    },
    {
      title: 'Lastname',
      dataIndex: 'lastname',
      key: 'lastname',
      editTable: true,
    },
    {
      title: 'Workplace',
      dataIndex: 'workplace',
      key: 'workplace',
      editTable: true,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        const editable = isEditing(record);

        return dataSource.length >= 1 ? (
          <Space key={record.id}>
            <Button
              type="primary"
              disabled={editable}
              onClick={() => handleView(record)}
            >
              <EyeOutlined className="d-flex align-content-center" />
            </Button>
            <Popconfirm
              title="Are you sure want to delete?"
              onConfirm={() => handleDelete(record)}
            >
              <Button danger type="primary" disabled={editable}>
                <DeleteOutlined className="d-flex align-content-center" />
              </Button>
            </Popconfirm>
            {editable ? (
              <span>
                <Space size="middle">
                  <Button onClick={e => save(record.id)} type="primary">
                    Save
                  </Button>
                  <Popconfirm title="Are you to cancel?" onConfirm={cancel}>
                    <Button>Cancel</Button>
                  </Popconfirm>
                </Space>
              </span>
            ) : (
              <Button
                onClick={() => edit(record)}
                type="primary"
                style={{ background: '#5ccf51' }}
              >
                <EditOutlined className="d-flex align-content-center" />
              </Button>
            )}
          </Space>
        ) : null;
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editTable) {
      //not editble
      return col;
    }

    return {
      ...col,
      onCell: record => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        <Content className="site-layout-background">
          <div>
            <Space
              className="d-flex justify-content-between"
              style={{ marginBottom: 20 }}
            >
              <h1 style={{ marginLeft: 20, marginTop: 30 }}>Employee</h1>
              <Space>
                <Button
                  style={{
                    marginTop: 15,
                    backgroundColor: '#00B0FF',
                    color: '#fff',
                    width: 150,
                    height: 40,
                    borderRadius: 5,
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  }}
                  onClick={() => navigate('/add_emp')}
                >
                  Add New
                </Button>
                <Button
                  style={{
                    marginTop: 15,
                    marginLeft: 10,
                    marginRight: 30,
                    backgroundColor: '#00B0FF',
                    color: '#fff',
                    width: 150,
                    height: 40,
                    borderRadius: 5,
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <CSVLink data={dataSource}>Export</CSVLink>
                </Button>
              </Space>
            </Space>

            <Space
              className="d-flex justify-content-center"
              style={{ marginTop: 20, marginBottom: 20, marginLeft: 10 }}
            ></Space>
            <Form form={form} component={false}>
              {loading ? (
                <Spinner />
              ) : (
                <Table
                  loading={loading}
                  dataSource={dataSource}
                  columns={mergedColumns}
                  bordered
                  components={{
                    body: {
                      cell: EditableCell,
                    },
                  }}
                />
              )}
            </Form>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Employee;
