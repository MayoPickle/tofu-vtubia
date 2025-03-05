// SongList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Button, Modal, Form, message, Space, Card, List, Typography, Tag, Select } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDeviceDetect } from '../utils/deviceDetector';

const { Text, Title } = Typography;
const { Option } = Select;

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
      const res = await axios.get(
        search ? `/api/songs?search=${search}` : '/api/songs'
      );
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
          <Tag key={tag} color="pink" style={{ margin: '2px' }}>{tag}</Tag>
        ))}
      </Space>
    );
  };

  // ======== 渲染表单组件 ========
  const renderSongForm = (form, onFinish, modalVisible, setModalVisible, title) => (
    <Modal
      title={title}
      open={modalVisible}
      onOk={onFinish}
      onCancel={() => setModalVisible(false)}
      width={600}
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
      <>
        <div style={{ padding: '8px' }}>
          {/* 搜索栏和标签栏 */}
          <div style={{ 
            display: 'flex', 
            marginBottom: '12px', 
            width: '100%' 
          }}>
            {/* 搜索栏容器 */}
            <div style={{ 
              width: '65%', 
              paddingRight: '4px',
              boxSizing: 'border-box'
            }}>
              <Input
                placeholder="搜索歌曲..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={() => onSearch(searchTerm)}
                style={{ width: '100%' }}
              />
            </div>
            
            {/* 标签筛选容器 */}
            <div style={{ 
              width: '35%', 
              display: 'flex', 
              alignItems: 'center',
              boxSizing: 'border-box',
              paddingLeft: '4px'
            }}>
              <div style={{ 
                width: selectedTags.length > 0 ? 'calc(100% - 36px)' : '100%',
                boxSizing: 'border-box'
              }}>
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
                  maxTagCount={1}
                  maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}...`}
                />
              </div>
              {selectedTags.length > 0 && (
                <Button 
                  size="small" 
                  type="link" 
                  onClick={() => setSelectedTags([])}
                  style={{ padding: '0 2px', width: '36px' }}
                >
                  清除
                </Button>
              )}
            </div>
          </div>
          
          {/* 添加按钮 */}
          {isAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAddModal}
              style={{ marginBottom: 16, width: '100%' }}
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
              style={{ margin: '8px 16px' }}
              title={
                <div>
                  <Text strong>{item.title}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>{item.artist}</Text>
                </div>
              }
              actions={isAdmin ? [
                <EditOutlined key="edit" onClick={() => handleOpenEditModal(item)} />,
                <DeleteOutlined key="delete" onClick={() => handleDeleteSong(item.id)} />
              ] : []}
            >
              <div style={{ marginBottom: 8 }}>
                {item.album && <Text style={{ marginRight: 8 }}>专辑: {item.album}</Text>}
                {item.year && <Text>年份: {item.year}</Text>}
              </div>
              {item.tags && (
                <div style={{ marginTop: 8 }}>
                  {renderSongTags(item.tags)}
                </div>
              )}
            </Card>
          )}
        />
        
        {renderSongForm(addForm, handleAddSong, addModalVisible, setAddModalVisible, '添加歌曲')}
        {renderSongForm(editForm, handleEditSong, editModalVisible, setEditModalVisible, '编辑歌曲')}
      </>
    );
  };

  // ======== PC端 - 表格渲染 ========
  const renderDesktopView = () => {
    // 根据是否是管理员来调整列宽
    const titleWidth = isAdmin ? '20%' : '25%';
    const artistWidth = isAdmin ? '15%' : '20%';
    const albumWidth = isAdmin ? '20%' : '20%';
    const yearWidth = isAdmin ? '10%' : '10%';
    const tagsWidth = isAdmin ? '25%' : '25%';
    
    const columns = [
      {
        title: '歌曲名',
        dataIndex: 'title',
        key: 'title',
        width: titleWidth,
        sorter: (a, b) => a.title.localeCompare(b.title),
      },
      {
        title: '艺术家',
        dataIndex: 'artist',
        key: 'artist',
        width: artistWidth,
        sorter: (a, b) => a.artist.localeCompare(b.artist),
      },
      {
        title: '专辑',
        dataIndex: 'album',
        key: 'album',
        width: albumWidth,
      },
      {
        title: '年份',
        dataIndex: 'year',
        key: 'year',
        width: yearWidth,
        sorter: (a, b) => (a.year || 0) - (b.year || 0),
      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        width: tagsWidth,
        render: tags => renderSongTags(tags)
      },
      // 只有管理员才显示操作列
      ...(isAdmin ? [{
        title: '操作',
        key: 'action',
        width: '10%',
        render: (_, record) => (
          <Space size="middle">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEditModal(record)}
            >
              编辑
            </Button>
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteSong(record.id)}
            >
              删除
            </Button>
          </Space>
        ),
      }] : [])
    ];

    const filteredSongs = getFilteredSongs();

    return (
      <>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flex: 1, gap: '12px', alignItems: 'center' }}>
            <Input
              placeholder="搜索歌曲..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={() => onSearch(searchTerm)}
              style={{ width: '320px' }}
            />
            <Select
              mode="multiple"
              allowClear
              style={{ width: '150px' }}
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
            {selectedTags.length > 0 && (
              <Button 
                size="small" 
                type="link" 
                onClick={() => setSelectedTags([])}
              >
                清除筛选
              </Button>
            )}
          </div>
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
          dataSource={filteredSongs}
          rowKey="id"
          loading={loading}
        />
        
        {renderSongForm(addForm, handleAddSong, addModalVisible, setAddModalVisible, '添加歌曲')}
        {renderSongForm(editForm, handleEditSong, editModalVisible, setEditModalVisible, '编辑歌曲')}
      </>
    );
  };

  return (
    <div>
      <Title level={2} style={{ margin: '16px 0', textAlign: 'center' }}>
        音乐小馆
      </Title>

      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
}

export default SongList;
