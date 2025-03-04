// SongList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Button, Modal, Form, message, Space, Card, List, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Text, Title } = Typography;

function SongList() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isMobile } = useDeviceDetect();

  // 是否管理员
  const [isAdmin, setIsAdmin] = useState(false);

  // 新增歌曲对话框
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();

  // 编辑歌曲对话框
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [currentEditId, setCurrentEditId] = useState(null);

  // ========= 初始化：获取列表 & 检查是否管理员 =========
  useEffect(() => {
    fetchSongs();
    checkAuth();
  }, []);

  // 获取歌曲列表
  const fetchSongs = async (search = '') => {
    setLoading(true);
    try {
      const res = await axios.get(
        search ? `/api/songs?search=${search}` : '/api/songs'
      );
      // 从响应中提取songs数组
      const songsData = res.data.songs;
      // 确保数据是数组
      setSongs(Array.isArray(songsData) ? songsData : []);
    } catch (error) {
      console.error('Error fetching songs:', error);
      message.error('获取歌曲列表失败');
      setSongs([]); // 出错时设为空数组
    } finally {
      setLoading(false);
    }
  };

  // 检查当前登录状态，获取是否 admin
  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/check_auth', { withCredentials: true });
      setIsAdmin(res.data.is_admin);
    } catch (err) {
      console.error('Error checking auth:', err);
      setIsAdmin(false);
    }
  };

  // ======== 搜索 ========
  const onSearch = (value) => {
    setSearchTerm(value);
    fetchSongs(value);
  };

  // ======== 新增歌曲 ========
  const handleOpenAddModal = () => {
    if (!isAdmin) {
      message.warning('请先登录管理员账号');
      return;
    }
    addForm.resetFields();
    setAddModalVisible(true);
  };

  const handleAddSong = async () => {
    try {
      const values = await addForm.validateFields();
      if (values.year) {
        values.year = parseInt(values.year, 10);
      }
      await axios.post('/api/songs', values, { withCredentials: true });
      message.success('添加歌曲成功');
      setAddModalVisible(false);
      fetchSongs(searchTerm);
    } catch (err) {
      console.error('Error adding song:', err);
      if (err.response?.status === 403) {
        message.error('没有管理员权限，无法添加');
      } else {
        message.error('添加失败');
      }
    }
  };

  // ======== 编辑 ========
  const handleOpenEditModal = (record) => {
    if (!isAdmin) {
      message.warning('请先登录管理员账号');
      return;
    }
    setCurrentEditId(record.id);
    editForm.setFieldsValue({
      title: record.title,
      artist: record.artist,
      album: record.album,
      genre: record.genre,
      year: record.year,
      meta_data: record.meta_data,
      link: record.link,
      description: record.description
    });
    setEditModalVisible(true);
  };

  const handleEditSong = async () => {
    try {
      const values = await editForm.validateFields();
      if (values.year) {
        values.year = parseInt(values.year, 10);
      }
      await axios.put(`/api/songs/${currentEditId}`, values, {
        withCredentials: true
      });
      message.success('更新成功');
      setEditModalVisible(false);
      fetchSongs(searchTerm);
    } catch (err) {
      console.error('Error updating song:', err);
      if (err.response?.status === 403) {
        message.error('没有管理员权限，无法编辑');
      } else {
        message.error('更新失败');
      }
    }
  };

  // ======== 删除 ========
  const handleDeleteSong = async (id) => {
    if (!isAdmin) {
      message.warning('请先登录管理员账号');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这首歌曲吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await axios.delete(`/api/songs/${id}`, { withCredentials: true });
          message.success('删除成功');
          fetchSongs(searchTerm);
        } catch (err) {
          console.error('Error deleting song:', err);
          if (err.response?.status === 403) {
            message.error('没有管理员权限，无法删除');
          } else {
            message.error('删除失败');
          }
        }
      },
    });
  };

  // ========================== 表格配置 ==========================
  const columns = [
    {
      title: '歌曲名',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <a href={record.link} target="_blank" rel="noopener noreferrer">{text}</a>
    },
    {
      title: '艺术家',
      dataIndex: 'artist',
      key: 'artist'
    },
    {
      title: '专辑',
      dataIndex: 'album',
      key: 'album',
      responsive: ['lg']
    },
    {
      title: '风格',
      dataIndex: 'genre',
      key: 'genre',
      responsive: ['lg']
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 80
    },
    {
      title: 'Meta',
      dataIndex: 'meta_data',
      key: 'meta_data',
      responsive: ['xl']
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      responsive: ['lg']
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        isAdmin ? (
          <Space>
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleOpenEditModal(record)}
            />
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger 
              onClick={() => handleDeleteSong(record.id)}
            />
          </Space>
        ) : null
      ),
    },
  ];

  // ======== 渲染表单组件 ========
  const renderSongForm = (form, onFinish, modalVisible, setModalVisible, title) => (
    <Modal
      title={title}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      onOk={onFinish}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="歌曲名" rules={[{ required: true, message: '请输入歌曲名' }]}>
          <Input placeholder="输入歌曲名" />
        </Form.Item>
        <Form.Item name="artist" label="艺术家" rules={[{ required: true, message: '请输入艺术家' }]}>
          <Input placeholder="输入艺术家" />
        </Form.Item>
        <Form.Item name="album" label="专辑">
          <Input placeholder="输入专辑" />
        </Form.Item>
        <Form.Item name="genre" label="风格">
          <Input placeholder="输入风格" />
        </Form.Item>
        <Form.Item name="year" label="年份">
          <Input type="number" placeholder="输入年份（如：2021）" />
        </Form.Item>
        <Form.Item name="meta_data" label="Meta">
          <Input placeholder="输入Meta数据" />
        </Form.Item>
        <Form.Item name="link" label="链接">
          <Input placeholder="输入音乐链接" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="输入歌曲描述" autoSize={{ minRows: 3, maxRows: 6 }} />
        </Form.Item>
      </Form>
    </Modal>
  );

  // ======== 移动端 - 歌曲列表渲染 ========
  const renderMobileView = () => {
    return (
      <div style={{ padding: '0 8px' }}>
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input.Search 
            placeholder="搜索歌曲" 
            allowClear 
            onSearch={onSearch} 
            style={{ width: '100%' }} 
          />
          
          {isAdmin && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleOpenAddModal}
            >
              添加歌曲
            </Button>
          )}
        </div>

        <List
          loading={loading}
          dataSource={songs}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={isAdmin ? [
                <Button 
                  icon={<EditOutlined />} 
                  size="small" 
                  onClick={() => handleOpenEditModal(item)}
                />,
                <Button 
                  icon={<DeleteOutlined />} 
                  size="small" 
                  danger 
                  onClick={() => handleDeleteSong(item.id)}
                />
              ] : []}
            >
              <List.Item.Meta
                title={<a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>}
                description={
                  <div>
                    <div><Text strong>艺术家:</Text> {item.artist}</div>
                    {item.album && <div><Text strong>专辑:</Text> {item.album}</div>}
                    {item.genre && <div><Text strong>风格:</Text> {item.genre}</div>}
                    {item.year && <div><Text strong>年份:</Text> {item.year}</div>}
                    {item.meta_data && <div><Text strong>Meta:</Text> {item.meta_data}</div>}
                    {item.description && <div><Text strong>描述:</Text> {item.description}</div>}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  // ======== PC端 - 表格渲染 ========
  const renderDesktopView = () => {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search 
            placeholder="搜索歌曲或歌手..." 
            allowClear 
            onSearch={onSearch} 
            style={{ width: 300 }} 
          />
          
          {isAdmin && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleOpenAddModal}
            >
              添加歌曲
            </Button>
          )}
        </div>

        <Table 
          columns={columns} 
          dataSource={songs} 
          rowKey="id" 
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </div>
    );
  };

  return (
    <div>
      <Title level={2} style={{ margin: '16px 0', textAlign: 'center' }}>
        音乐小馆
      </Title>

      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* 新增歌曲对话框 */}
      {renderSongForm(addForm, handleAddSong, addModalVisible, setAddModalVisible, '添加歌曲')}
      
      {/* 编辑歌曲对话框 */}
      {renderSongForm(editForm, handleEditSong, editModalVisible, setEditModalVisible, '编辑歌曲')}
    </div>
  );
}

export default SongList;
