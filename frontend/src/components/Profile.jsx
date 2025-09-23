import React, { useEffect, useMemo, useState } from 'react';
import { Card, Avatar, Tag, Space, Typography, Spin, Empty, message, Statistic, Row, Col, List } from 'antd';
import { UserOutlined, IdcardOutlined, CrownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [guards, setGuards] = useState([]);
  const [pnl, setPnl] = useState(null);
  const [topGifts, setTopGifts] = useState([]);
  const [topProfitBlind, setTopProfitBlind] = useState([]);
  const [specialSummary, setSpecialSummary] = useState({ items: [], totals: { units: 0, cost: 0, value: 0 } });
  const [heroAvatarUrl, setHeroAvatarUrl] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // 安全解析JSON，避免HTML错误页导致解析异常
        const safeJson = async (res) => {
          const ct = res.headers.get('content-type') || '';
          if (res.status === 204 || res.status === 304) return null;
          if (!res.ok) throw new Error(`请求失败(${res.status})`);
          if (!ct.includes('application/json')) throw new Error('返回非JSON');
          return res.json();
        };

        // 获取当前用户信息
        const meRes = await fetch('/api/me', { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
        const me = await safeJson(meRes);
        if (!me.authenticated) {
          setUser(null);
          setLoading(false);
          return;
        }

        // 获取投喂价值 Top5
        try {
          const tgRes = await fetch('/api/pnl/self/top_gifts', { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
          const tgJson = await safeJson(tgRes);
          setTopGifts(tgJson?.items || []);
        } catch { setTopGifts([]); }
        setUser(me);

        // 获取盲盒差价 Top5（单次差价最大）
        try {
          const tpRes = await fetch('/api/pnl/self/top_profit_blind', { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
          const tpJson = await safeJson(tpRes);
          setTopProfitBlind(tpJson?.items || []);
        } catch { setTopProfitBlind([]); }

        // 获取特别礼物盲盒汇总（亏钱礼物）
        try {
          const spRes = await fetch('/api/pnl/self/special_blind_summary', { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
          const spJson = await safeJson(spRes);
          setSpecialSummary({
            items: spJson?.items || [],
            totals: spJson?.totals || { units: 0, cost: 0, value: 0 }
          });
        } catch { setSpecialSummary({ items: [], totals: { units: 0, cost: 0, value: 0 } }); }

        // 获取舰长信息
        try {
          const guardsRes = await fetch('/api/guards', { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
          const guardsJson = await safeJson(guardsRes);
          setGuards(guardsJson?.guards || []);
        } catch { setGuards([]); }

        // 获取盈亏数据
        try {
          const pnlRes = await fetch('/api/pnl/self', { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
          const pnlJson = await safeJson(pnlRes);
          setPnl(pnlJson || null);
        } catch { setPnl(null); }
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

  const fmt = (v) => ((v ?? 0) / 100).toFixed(2);
  const guardInfo = useMemo(() => {
    if (!matchedGuard) return null;
    const lv = Number(matchedGuard.guard_level);
    if (lv === 3) return { text: '舰长', color: '#FF1493' };
    if (lv === 2) return { text: '提督', color: '#FF69B4' };
    if (lv === 1) return { text: '总督', color: '#FFC0CB' };
    return { text: '守护者', color: '#D9D9D9' };
  }, [matchedGuard]);

  // 头像来源：统一使用舰长头像（如有），否则使用默认图标
  useEffect(() => {
    if (matchedGuard?.face) {
      setHeroAvatarUrl(`/api/proxy/image?url=${encodeURIComponent(matchedGuard.face)}`);
    } else {
      setHeroAvatarUrl(null);
    }
  }, [matchedGuard?.face]);

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
  <div style={{ width: '100%' }}>
      <Row gutter={[16, 16]} style={{ alignItems: 'stretch' }}>
        {/* 左列：个人信息卡 */}
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(255,228,236,0.88) 0%, rgba(255,209,224,0.34) 100%), url(/head1.png)',
              backgroundRepeat: 'no-repeat, no-repeat',
              backgroundPosition: 'left top, right 12px center',
              backgroundSize: 'auto, 140px',
              border: '1px solid rgba(255, 133, 162, 0.25)',
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(255, 133, 162, 0.25)',
              height: '100%'
            }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 12 }}>
              <Space align="start" size={16}>
                <Avatar
                  size={64}
                  src={heroAvatarUrl || undefined}
                  icon={<UserOutlined />}
                  style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.1)' }}
                  onError={() => { setHeroAvatarUrl(null); return false; }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Title level={4} style={{ margin: 0 }}>{user.username}</Title>
                    {user.is_admin ? <Tag color="green">管理员</Tag> : null}
                    {matchedGuard ? (
                      <Tag color={guardInfo?.color}>{guardInfo?.text}</Tag>
                    ) : (
                      <Tag>普通用户</Tag>
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Space direction="vertical" size={6}>
                      <Space>
                        <IdcardOutlined style={{ opacity: 0.7 }} />
                        <Text type="secondary">站内UID</Text>
                        <Text strong>{user.id}</Text>
                      </Space>
                      <Space>
                        <CrownOutlined style={{ opacity: 0.7 }} />
                        <Text type="secondary">B站UID</Text>
                        <Text strong>{user.bilibili_uid || '未绑定'}</Text>
                      </Space>
                    </Space>
                  </div>
                </div>
              </Space>
            </div>

            {/* 舰长匹配补充信息（去掉重复头像） */}
            <div style={{ marginTop: 16 }}>
              {matchedGuard ? (
                <Text>勋章：{matchedGuard.medal_name || '无'}{matchedGuard.medal_level ? ` Lv.${matchedGuard.medal_level}` : ''}</Text>
              ) : (
                <Text type="secondary">未匹配到舰长信息</Text>
              )}
            </div>
          </Card>
        </Col>

        {/* 右列：指标卡 */}
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, border: '1px solid rgba(255, 133, 162, 0.15)', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', height: '100%' }}
            bodyStyle={{ padding: 16 }}
            title={<span style={{ fontWeight: 600 }}>盈亏概览（盲盒，单位：电池）</span>}
          >
            {!pnl ? (
              <Empty description="暂无盈亏数据" />
            ) : (
              <Row gutter={[12, 12]}>
                <Col xs={12} lg={6}>
                  <div style={{ background: '#F6FFED', border: '1px solid #B7EB8F', borderRadius: 12, padding: 12 }}>
                    <Statistic title="今日盈亏" value={Number(fmt(pnl.today?.pnl))} precision={2} valueStyle={{ color: (pnl.today?.pnl ?? 0) >= 0 ? '#3f8600' : '#cf1322' }} suffix="" />
                    <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {fmt(pnl.today?.cost)} | 价值 {fmt(pnl.today?.value)}</div>
                  </div>
                </Col>
                <Col xs={12} lg={6}>
                  <div style={{ background: '#F6FFED', border: '1px solid #B7EB8F', borderRadius: 12, padding: 12 }}>
                    <Statistic title="本周盈亏" value={Number(fmt(pnl.week?.pnl))} precision={2} valueStyle={{ color: (pnl.week?.pnl ?? 0) >= 0 ? '#3f8600' : '#cf1322' }} suffix="" />
                    <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {fmt(pnl.week?.cost)} | 价值 {fmt(pnl.week?.value)}</div>
                  </div>
                </Col>
                <Col xs={12} lg={6}>
                  <div style={{ background: '#FFF7E6', border: '1px solid #FFD591', borderRadius: 12, padding: 12 }}>
                    <Statistic title="本月盈亏" value={Number(fmt(pnl.month?.pnl))} precision={2} valueStyle={{ color: (pnl.month?.pnl ?? 0) >= 0 ? '#3f8600' : '#cf1322' }} suffix="" />
                    <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {fmt(pnl.month?.cost)} | 价值 {fmt(pnl.month?.value)}</div>
                  </div>
                </Col>
                <Col xs={12} lg={6}>
                  <div style={{ background: '#E6F7FF', border: '1px solid #91D5FF', borderRadius: 12, padding: 12 }}>
                    <Statistic title="总盈亏" value={Number(fmt(pnl.total?.pnl))} precision={2} valueStyle={{ color: (pnl.total?.pnl ?? 0) >= 0 ? '#3f8600' : '#cf1322' }} suffix="" />
                    <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {fmt(pnl.total?.cost)} | 价值 {fmt(pnl.total?.value)}</div>
                  </div>
                </Col>
              </Row>
            )}
          </Card>
        </Col>
      </Row>

      {/* 排行区块 */}
      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, border: '1px solid rgba(255, 133, 162, 0.15)', height: '100%' }}
            title={<span style={{ fontWeight: 600 }}>投喂价值 Top5（单次）</span>}
          >
            {(!topGifts || topGifts.length === 0) ? (
              <Empty description="暂无数据" />
            ) : (
              <List
                dataSource={topGifts}
                renderItem={(item, idx) => {
                  const gif = item.assets?.gif;
                  const webp = item.assets?.webp;
                  const img = item.assets?.img_basic;
                  const src = gif || webp || img;
                  const proxied = src ? `/api/proxy/image?url=${encodeURIComponent(src)}` : undefined;
                  const timeText = item.last_timestamp ? new Date(item.last_timestamp).toLocaleString() : '';
                  return (
                    <List.Item style={{ borderRadius: 10, padding: 10 }}>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <Space>
                          <Avatar shape="square" size={40} src={proxied} icon={<UserOutlined />} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{idx + 1}. {item.gift_name}</span>
                            {timeText && <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{timeText}</span>}
                          </div>
                        </Space>
                        <span style={{ fontWeight: 600 }}>{fmt(item.max_value)} 电池</span>
                      </div>
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, border: '1px solid rgba(255, 133, 162, 0.15)', height: '100%' }}
            title={<span style={{ fontWeight: 600 }}>盲盒单次差价 Top5</span>}
          >
            {(!topProfitBlind || topProfitBlind.length === 0) ? (
              <Empty description="暂无数据" />
            ) : (
              <List
                dataSource={topProfitBlind}
                renderItem={(item, idx) => {
                  const gif = item.assets?.gif;
                  const webp = item.assets?.webp;
                  const img = item.assets?.img_basic;
                  const src = gif || webp || img;
                  const proxied = src ? `/api/proxy/image?url=${encodeURIComponent(src)}` : undefined;
                  const timeText = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';
                  return (
                    <List.Item style={{ borderRadius: 10, padding: 10 }}>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <Space>
                          <Avatar shape="square" size={40} src={proxied} icon={<UserOutlined />} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{idx + 1}. {(item.original_gift_name || '盲盒')} → {item.revealed_gift_name}</span>
                            {timeText && <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{timeText}</span>}
                          </div>
                        </Space>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, color: '#3f8600' }}>+ {fmt(item.profit)} 电池</div>
                          <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {fmt(item.original_cost)} → 价值 {fmt(item.revealed_value)}</div>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        {/* 特别礼物汇总（盲盒里开出亏钱的礼物） */}
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{ borderRadius: 16, border: '1px solid rgba(255, 133, 162, 0.15)', height: '100%' }}
            title={<span style={{ fontWeight: 600 }}>特别礼物（亏损项）汇总</span>}
          >
            {(!specialSummary || !specialSummary.items || specialSummary.items.length === 0) ? (
              <Empty description="暂无数据" />
            ) : (
              <>
                <List
                  dataSource={specialSummary.items}
                  renderItem={(item, idx) => {
                    const gif = item.assets?.gif;
                    const webp = item.assets?.webp;
                    const img = item.assets?.img_basic;
                    const src = gif || webp || img;
                    const proxied = src ? `/api/proxy/image?url=${encodeURIComponent(src)}` : undefined;
                    return (
                      <List.Item style={{ borderRadius: 10, padding: 10 }}>
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <Space>
                            <Avatar shape="square" size={40} src={proxied} icon={<UserOutlined />} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{idx + 1}. {item.gift_name}</span>
                              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>数量 {item.total_units}</span>
                            </div>
                          </Space>
                          {(() => {
                            const diff = (item.total_value ?? 0) - (item.total_cost ?? 0);
                            const isPositive = diff >= 0;
                            return (
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600, color: isPositive ? '#3f8600' : '#cf1322' }}>
                                  {isPositive ? '+ ' : '- '}{Math.abs(Number((diff ?? 0) / 100).toFixed(2))} 电池
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.7 }}>成本 {fmt(item.total_cost)} → 价值 {fmt(item.total_value)}</div>
                              </div>
                            );
                          })()}
                        </div>
                      </List.Item>
                    );
                  }}
                />
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>合计</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12 }}>数量 {specialSummary.totals?.units ?? 0}</div>
                      <div style={{ fontSize: 12 }}>总成本 <span style={{ color: '#cf1322', fontWeight: 600 }}>{fmt(specialSummary.totals?.cost)}</span> 电池</div>
                      <div style={{ fontSize: 12 }}>总价值 <span style={{ color: '#3f8600', fontWeight: 600 }}>{fmt(specialSummary.totals?.value)}</span> 电池</div>
                      {(() => {
                        const tCost = specialSummary.totals?.cost ?? 0;
                        const tValue = specialSummary.totals?.value ?? 0;
                        const tDiff = tValue - tCost;
                        const isPos = tDiff >= 0;
                        return (
                          <div style={{ fontSize: 12 }}>总差价 <span style={{ fontWeight: 600, color: isPos ? '#3f8600' : '#cf1322' }}>{isPos ? '+ ' : '- '}{Math.abs(Number((tDiff ?? 0) / 100).toFixed(2))}</span> 电池</div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Profile;


