import React, { useEffect, useMemo, useState } from 'react';
import { Card, Descriptions, Avatar, Tag, Space, Typography, Spin, Empty, message, Statistic, Row, Col } from 'antd';
import { UserOutlined, IdcardOutlined, CrownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [guards, setGuards] = useState([]);
  const [pnl, setPnl] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // 获取当前用户信息
        const meRes = await fetch('/api/me', { credentials: 'include' });
        const me = await meRes.json();
        if (!me.authenticated) {
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(me);

        // 获取舰长信息
        const guardsRes = await fetch('/api/guards', { credentials: 'include' });
        if (!guardsRes.ok) throw new Error('获取舰长数据失败');
        const guardsJson = await guardsRes.json();
        setGuards(guardsJson.guards || []);

        // 获取盈亏数据
        const pnlRes = await fetch('/api/pnl/self', { credentials: 'include' });
        if (pnlRes.ok) {
          const pnlJson = await pnlRes.json();
          setPnl(pnlJson);
        }
      } catch (e) {
        message.error(e.message || '加载个人信息失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const matchedGuard = useMemo(() => {
    if (!user || !user.bilibili_uid || !guards || guards.length === 0) return null;
    const uidStr = String(user.bilibili_uid).trim();
    return guards.find(g => String(g.uid) === uidStr) || null;
  }, [user, guards]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <Spin />
      </div>
    );
  }

  if (!user) {
    return (
      <Empty description={<span>未登录，请先登录后查看个人中心</span>} />
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card
        title={
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Title level={4} style={{ margin: 0 }}>个人中心</Title>
          </Space>
        }
        bordered
      >
        <Descriptions column={1} size="middle">
          <Descriptions.Item label={<Space><UserOutlined /> <span>用户名</span></Space>}>
            <Text strong>{user.username}</Text>
            {user.is_admin ? <Tag color="green" style={{ marginLeft: 8 }}>管理员</Tag> : null}
          </Descriptions.Item>
          <Descriptions.Item label={<Space><IdcardOutlined /> <span>站内UID</span></Space>}>
            {user.id}
          </Descriptions.Item>
          <Descriptions.Item label={<Space><CrownOutlined /> <span>B站UID</span></Space>}>
            {user.bilibili_uid ? user.bilibili_uid : <Text type="secondary">未绑定</Text>}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <Space>
            <CrownOutlined />
            <Title level={5} style={{ margin: 0 }}>舰长匹配</Title>
          </Space>
        }
        bordered
      >
        {matchedGuard ? (
          <Space align="start">
            <Avatar src={matchedGuard.face ? `/api/proxy/image?url=${encodeURIComponent(matchedGuard.face)}` : undefined} icon={<UserOutlined />} size={48} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{matchedGuard.username || '未知用户'}</div>
              <div style={{ marginTop: 4 }}>
                <Tag color="#FF1493">舰长等级 {matchedGuard.guard_level ?? '-'}</Tag>
                {matchedGuard.medal_name ? (
                  <Tag color="#FFC0CB">{matchedGuard.medal_name} Lv.{matchedGuard.medal_level}</Tag>
                ) : null}
              </div>
              <div style={{ marginTop: 6, color: 'rgba(0,0,0,0.45)' }}>UID: {matchedGuard.uid}</div>
            </div>
          </Space>
        ) : (
          <Space align="start">
            <Avatar src={user.bilibili_uid ? `/api/bilibili/avatar?uid=${user.bilibili_uid}` : undefined} icon={<UserOutlined />} size={48} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{user.username}</div>
              <div style={{ marginTop: 4 }}>
                <Tag color="#999">未匹配到舰长</Tag>
              </div>
              <div style={{ marginTop: 6, color: 'rgba(0,0,0,0.45)' }}>
                {user.bilibili_uid ? `B站UID: ${user.bilibili_uid}` : '未绑定 B 站 UID'}
              </div>
            </div>
          </Space>
        )}
      </Card>

      <Card
        title={
          <Space>
            <Title level={5} style={{ margin: 0 }}>盈亏榜（盲盒）</Title>
          </Space>
        }
        bordered
      >
        {!pnl ? (
          <Empty description="暂无盈亏数据" />
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Statistic title="今日盈亏" value={pnl.today?.pnl ?? 0} precision={2} valueStyle={{ color: (pnl.today?.pnl ?? 0) >= 0 ? '#3f8600' : '#cf1322' }} suffix="币" />
              <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {pnl.today?.cost ?? 0} | 价值 {pnl.today?.value ?? 0}</div>
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="本周盈亏" value={pnl.week?.pnl ?? 0} precision={2} valueStyle={{ color: (pnl.week?.pnl ?? 0) >= 0 ? '#3f8600' : '#cf1322' }} suffix="币" />
              <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {pnl.week?.cost ?? 0} | 价值 {pnl.week?.value ?? 0}</div>
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="本月盈亏" value={pnl.month?.pnl ?? 0} precision={2} valueStyle={{ color: (pnl.month?.pnl ?? 0) >= 0 ? '#3f8600' : '#cf1322' }} suffix="币" />
              <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {pnl.month?.cost ?? 0} | 价值 {pnl.month?.value ?? 0}</div>
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="总盈亏" value={pnl.total?.pnl ?? 0} precision={2} valueStyle={{ color: (pnl.total?.pnl ?? 0) >= 0 ? '#3f8600' : '#cf1322' }} suffix="币" />
              <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {pnl.total?.cost ?? 0} | 价值 {pnl.total?.value ?? 0}</div>
            </Col>
          </Row>
        )}
      </Card>
    </Space>
  );
}

export default Profile;


