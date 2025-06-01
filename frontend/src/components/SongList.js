// SongList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Button, Modal, Form, message, Space, Card, List, Typography, Tag, Select } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, HeartOutlined, CustomerServiceOutlined, StarOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Text, Title } = Typography;
const { Option } = Select;

// 主题颜色和渐变定义
const themeColor = '#FF85A2';
const themeGradient = 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)';
const secondaryColor = '#FF69B4';

function SongList() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isMobile } = useDeviceDetect();

  // 标签相关状态
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

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
      // 添加per_page参数来获取所有歌曲
      const url = search 
        ? `/api/songs?search=${search}&per_page=1000` 
        : '/api/songs?per_page=1000';
      const res = await axios.get(url);
      // 从响应中提取songs数组
      const songsData = res.data.songs;
      // 确保数据是数组
      const songsArray = Array.isArray(songsData) ? songsData : [];
      setSongs(songsArray);
      
      // 提取所有唯一标签
      const tagsSet = new Set();
      songsArray.forEach(song => {
        if (song.tags) {
          song.tags.split(',').forEach(tag => tagsSet.add(tag.trim()));
        }
      });
      setAllTags(Array.from(tagsSet).sort());
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
      tags: record.tags,
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

  // 处理标签筛选
  const handleTagSelect = (selectedValues) => {
    setSelectedTags(selectedValues);
  };

  // 获取筛选后的歌曲列表
  const getFilteredSongs = () => {
    if (selectedTags.length === 0) {
      return songs;
    }
    return songs.filter(song => {
      if (!song.tags) return false;
      const songTags = song.tags.split(',').map(tag => tag.trim());
      return selectedTags.some(tag => songTags.includes(tag));
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
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: tags => renderSongTags(tags)
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

  // ======== 渲染单个歌曲的标签 ========
  const renderSongTags = (tags) => {
    if (!tags) return null;
    const tagArray = tags.split(',').map(tag => tag.trim());
    return (
      <Space size={[0, 4]} wrap>
        {tagArray.map(tag => (
          <Tag 
            key={tag} 
            style={{ 
              background: 'rgba(255, 182, 193, 0.15)',
              border: '1px solid rgba(255, 105, 180, 0.3)',
              color: secondaryColor,
              borderRadius: '12px',
              padding: '4px 12px',
              margin: '2px',
              fontSize: '12px',
              transition: 'all 0.3s ease'
            }}
          >
            {tag}
          </Tag>
        ))}
      </Space>
    );
  };

  // ======== 渲染表单组件 ========
  const renderSongForm = (form, onFinish, modalVisible, setModalVisible, title) => (
    <Modal
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          color: secondaryColor,
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          <CustomerServiceOutlined style={{ marginRight: '8px' }} />
          {title}
        </div>
      }
      open={modalVisible}
      onOk={onFinish}
      onCancel={() => setModalVisible(false)}
      width={600}
      style={{ top: 20 }}
      bodyStyle={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '24px'
      }}
      okButtonProps={{
        style: {
          background: themeGradient,
          border: 'none',
          boxShadow: '0 4px 12px rgba(255, 133, 162, 0.3)'
        }
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="歌曲名"
          rules={[{ required: true, message: '请输入歌曲名' }]}
        >
          <Input placeholder="请输入歌曲名" />
        </Form.Item>

        <Form.Item
          name="artist"
          label="艺术家"
          rules={[{ required: true, message: '请输入艺术家' }]}
        >
          <Input placeholder="请输入艺术家" />
        </Form.Item>

        <Form.Item name="album" label="专辑">
          <Input placeholder="请输入专辑名" />
        </Form.Item>

        <Form.Item name="genre" label="风格">
          <Input placeholder="请输入音乐风格" />
        </Form.Item>

        <Form.Item name="year" label="年份">
          <Input type="number" placeholder="请输入发行年份" />
        </Form.Item>

        <Form.Item name="meta_data" label="元数据">
          <Input.TextArea placeholder="例如：JSON格式的歌曲额外信息" rows={2} />
        </Form.Item>

        <Form.Item name="tags" label="标签">
          <Input placeholder="多个标签用逗号分隔，如：流行,摇滚,经典" />
        </Form.Item>
      </Form>
    </Modal>
  );

  // ======== 移动端 - 列表渲染 ========
  const renderMobileView = () => {
    const filteredSongs = getFilteredSongs();

    return (
      <div style={{ 
        width: '100%', 
        maxWidth: '100%', 
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(255, 133, 162, 0.15)',
          marginBottom: '16px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* 搜索栏和标签栏 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <Input
              placeholder="搜索歌曲..."
              prefix={<SearchOutlined style={{ color: themeColor }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={() => onSearch(searchTerm)}
              style={{ 
                borderRadius: '12px',
                border: '1px solid rgba(255, 105, 180, 0.3)',
                padding: '8px 12px'
              }}
            />
            
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="标签筛选"
              value={selectedTags}
              onChange={handleTagSelect}
              options={allTags.map(tag => ({ label: tag, value: tag }))}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              maxTagCount={2}
              maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}...`}
            />
          </div>
          
          {/* 添加按钮 */}
          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAddModal}
              style={{
                width: '100%',
                background: themeGradient,
                border: 'none',
                borderRadius: '12px',
                height: '40px',
                boxShadow: '0 4px 12px rgba(255, 133, 162, 0.2)',
                marginBottom: '16px'
              }}
            >
              添加歌曲
            </Button>
          )}
        </div>

        <List
          loading={loading}
          dataSource={filteredSongs}
          renderItem={item => (
            <Card
              key={item.id}
              size="small"
              style={{ 
                margin: '8px 0',
                borderRadius: '16px',
                border: '1px solid rgba(255, 192, 203, 0.3)',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px rgba(255, 133, 162, 0.1)',
                transition: 'all 0.3s ease',
                width: '100%',
                boxSizing: 'border-box'
              }}
              hoverable
              title={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CustomerServiceOutlined style={{ color: themeColor }} />
                  <Text strong style={{ flex: 1 }}>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: '13px' }}>{item.artist}</Text>
                </div>
              }
              actions={isAdmin ? [
                <EditOutlined key="edit" onClick={() => handleOpenEditModal(item)} style={{ color: themeColor }} />,
                <DeleteOutlined key="delete" onClick={() => handleDeleteSong(item.id)} style={{ color: secondaryColor }} />
              ] : []}
            >
              <div style={{ marginBottom: 8 }}>
                {item.album && (
                  <Text style={{ 
                    marginRight: 12,
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    💿 {item.album}
                  </Text>
                )}
                {item.year && (
                  <Text style={{ 
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    📅 {item.year}
                  </Text>
                )}
              </div>
              {item.tags && (
                <div style={{ marginTop: 8 }}>
                  {renderSongTags(item.tags)}
                </div>
              )}
            </Card>
          )}
        />
      </div>
    );
  };

  // ======== PC端 - 表格渲染 ========
  const renderDesktopView = () => {
    const filteredSongs = getFilteredSongs();

    return (
      <>
        <Card
          style={{ 
            marginBottom: '24px',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(255, 133, 162, 0.15)',
            border: '1px solid rgba(255, 192, 203, 0.3)',
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <Input
              placeholder="搜索歌曲..."
              prefix={<SearchOutlined style={{ color: themeColor }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={() => onSearch(searchTerm)}
              style={{ 
                width: '320px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 105, 180, 0.3)'
              }}
            />
            
            <Select
              mode="multiple"
              allowClear
              style={{ 
                width: '200px',
                borderRadius: '12px'
              }}
              placeholder="标签筛选"
              value={selectedTags}
              onChange={handleTagSelect}
              options={allTags.map(tag => ({ label: tag, value: tag }))}
              showSearch
              optionFilterProp="label"
            />

            {selectedTags.length > 0 && (
              <Button 
                type="link"
                onClick={() => setSelectedTags([])}
                style={{ color: themeColor }}
              >
                清除筛选
              </Button>
            )}

            <div style={{ flex: 1 }} />

            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenAddModal}
                style={{
                  background: themeGradient,
                  border: 'none',
                  borderRadius: '12px',
                  height: '40px',
                  boxShadow: '0 4px 12px rgba(255, 133, 162, 0.2)'
                }}
              >
                添加歌曲
              </Button>
            )}
          </div>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredSongs}
          rowKey="id"
          loading={loading}
          style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(255, 133, 162, 0.15)'
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 首歌曲`,
            style: {
              marginTop: '16px',
              textAlign: 'center'
            }
          }}
        />
      </>
    );
  };

  return (
    <div style={{ 
      padding: isMobile ? '16px 8px' : '24px',
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 105, 180, 0.1) 100%)'
    }}>
      {/* 装饰性背景元素 */}
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,192,203,0.1) 0%, rgba(255,192,203,0) 70%)',
        top: '10%',
        right: '-50px',
        zIndex: 0,
      }} />
      
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,105,180,0.1) 0%, rgba(255,105,180,0) 70%)',
        bottom: '10%',
        left: '-30px',
        zIndex: 0,
      }} />

      <Title 
        level={2} 
        style={{ 
          margin: '16px 0 24px',
          textAlign: 'center',
          background: themeGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <HeartOutlined />
        音乐小馆
        <HeartOutlined />
      </Title>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {isMobile ? renderMobileView() : renderDesktopView()}
      </div>

      {renderSongForm(addForm, handleAddSong, addModalVisible, setAddModalVisible, '添加歌曲')}
      {renderSongForm(editForm, handleEditSong, editModalVisible, setEditModalVisible, '编辑歌曲')}
    </div>
  );
}

export default SongList;
