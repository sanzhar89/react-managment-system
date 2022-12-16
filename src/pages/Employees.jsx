import { useState } from 'react';
import { Table, Popconfirm, Button, Space, Form, Input } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { CSVLink } from 'react-csv';

const Employees = () => {
	const [gridData, setGridData] = useState([
		{
			id: 1,
			empWorkId: 1,
			empSurname: 'Курмангали',
			empName: 'Санжар',
			empLastname: 'С',
		},
		{
			id: 2,
			empWorkId: 2,
			empSurname: 'Асанулы',
			empName: 'Алихан',
			empLastname: 'А',
		},
		{
			id: 3,
			empWorkId: 3,
			empSurname: 'Маликов',
			empName: 'Алан',
			empLastname: 'А',
		},
	]);
	const [editRowKey, setEditRowKey] = useState('');
	const [form] = Form.useForm();

	const handleDelete = (value) => {
		let newContact = [...gridData].filter((item) => item.id !== value.id);
		setGridData(newContact);
	};

	const isEditing = (record) => {
		return record.id === editRowKey;
	};

	const cancel = () => {
		setEditRowKey('');
	};
	const save = async (id) => {
		try {
			const row = await form.validateFields();
			const newData = [...gridData];
			const index = newData.findIndex((item) => id === item.id);
			if (index > -1) {
				const item = newData[index];
				newData.splice(index, 1, { ...item, ...row });
				setGridData(newData);
				setEditRowKey('');
			}
		} catch (error) {
			console.log('Error', error);
		}
	};

	const edit = (record) => {
		form.setFieldsValue({
			empSurname: '',
			empName: '',
			empLastname: '',
			...record,
		});
		setEditRowKey(record.id);
	};

	const columns = [
		{
			title: 'Id',
			dataIndex: 'id',
			align: 'center',
		},
		{
			title: 'ID рабочего места',
			dataIndex: 'empWorkId',
			align: 'center',
		},
		{
			title: 'Фамилия',
			dataIndex: 'empSurname',
			align: 'center',
			editTable: true,
		},
		{
			title: 'Имя',
			dataIndex: 'empName',
			align: 'center',
			editTable: true,
		},
		{
			title: 'Отчество',
			dataIndex: 'empLastname',
			align: 'center',
			editTable: true,
		},
		{
			title: 'Action',
			dataIndex: 'action',
			align: 'center',
			render: (_, record) => {
				const editable = isEditing(record);

				return gridData.length >= 1 ? (
					<Space>
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
									<Button onClick={(e) => save(record.id)} type="primary">
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

	const mergedColumns = columns.map((col) => {
		if (!col.editTable) {
			//not editble
			return col;
		}

		return {
			...col,
			onCell: (record) => ({
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
		<div>
			<Space
				className="d-flex justify-content-between"
				style={{ marginBottom: 20 }}
			>
				<h1 style={{ marginLeft: 20, marginTop: 30 }}>Сотрудники</h1>
				<Button
					style={{
						marginTop: 15,
						marginRight: 30,
						backgroundColor: '#c2115e',
						color: '#fff',
						width: 150,
						height: 40,
					}}
				>
					<CSVLink data={gridData}>Export</CSVLink>
				</Button>
			</Space>

			<Space
				className="d-flex justify-content-center"
				style={{ marginTop: 20, marginBottom: 20, marginLeft: 10 }}
			></Space>
			<Form form={form} component={false}>
				<Table
					dataSource={gridData}
					columns={mergedColumns}
					bordered
					components={{
						body: {
							cell: EditableCell,
						},
					}}
				/>
			</Form>
		</div>
	);
};

export default Employees;
