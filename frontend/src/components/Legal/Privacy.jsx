import React from 'react';

function Privacy() {
  const containerStyle = {
    maxWidth: 920,
    margin: '0 auto',
    background: '#fff',
    padding: 24,
    borderRadius: 8,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  };

  const h1Style = { fontSize: 22, fontWeight: 700, marginBottom: 16 };
  const h2Style = { fontSize: 16, fontWeight: 700, marginTop: 20 };
  const pStyle = { lineHeight: 1.8, marginTop: 8 };
  const ulStyle = { paddingLeft: 20, lineHeight: 1.8, marginTop: 8 };

  return (
    <div style={{ padding: 24 }}>
      <div style={containerStyle}>
        <h1 style={h1Style}>隐私政策（中国大陆适用）</h1>
        <p style={pStyle}>生效日期：2025-09-22</p>
        <p style={pStyle}>
          本隐私政策旨在帮助您了解我们如何收集、使用、共享与保护您的个人信息，以及您如何管理自己的信息。请您仔细阅读并在充分理解后使用本服务。
        </p>

        <h2 style={h2Style}>一、我们收集的信息</h2>
        <ul style={ulStyle}>
          <li>账户信息：<strong>UID（绑定的哔哩哔哩 UID）</strong>、展示昵称、密码（经散列存储）。</li>
          <li>交互数据：与您账号相关的直播礼物记录的引用信息（来源于上游数据库/第三方数据源），仅用于账号归属验证与统计展示。</li>
          <li>日志信息：为保障服务安全与稳定运行，我们可能记录必要的设备、网络与操作日志信息。</li>
        </ul>

        <h2 style={h2Style}>二、我们如何使用信息</h2>
        <ul style={ulStyle}>
          <li>提供注册、登录、找回/重置密码、管理员功能等基本服务；</li>
          <li>进行账号归属验证（例如 2 分钟内投喂含“灯牌”礼物的校验）；</li>
          <li>改进与优化产品体验、安全防护与故障排查；</li>
          <li>符合法律法规或监管要求的其他合理用途。</li>
        </ul>

        <h2 style={h2Style}>三、信息的共享与披露</h2>
        <ul style={ulStyle}>
          <li>原则上不向无关第三方分享您的个人信息。</li>
          <li>如因提供本服务之必要而与第三方服务商（如数据库/云服务）协作时，将遵循最小必要原则并要求其承担相应保密义务。</li>
          <li>法律法规、司法或监管要求下的提供或披露。</li>
        </ul>

        <h2 style={h2Style}>四、数据存储与安全</h2>
        <ul style={ulStyle}>
          <li>我们采取合理的安全技术与管理措施，防止数据被未经授权访问、披露、使用、修改或毁损。</li>
          <li>密码以哈希形式存储，请您妥善保管账户密码并启用强密码。</li>
        </ul>

        <h2 style={h2Style}>五、您的权利</h2>
        <ul style={ulStyle}>
          <li>访问与更正：您可以在账户中查看与更正个人资料。</li>
          <li>删除与注销：在符合法律法规的前提下，您可以申请删除账户或注销账号。</li>
          <li>撤回同意：当您撤回对某些处理活动的同意后，我们将不再进行相应处理，但不影响撤回前基于您同意已开展处理的合法性。</li>
        </ul>

        <h2 style={h2Style}>六、未成年人保护</h2>
        <p style={pStyle}>若您为未成年人，请在监护人指导下阅读并接受本政策，并获得其同意后使用本服务。</p>

        <h2 style={h2Style}>七、政策更新</h2>
        <p style={pStyle}>我们可能适时更新本政策。重大变更将以显著方式通知。更新后继续使用即视为接受更新后的政策。</p>

        <h2 style={h2Style}>八、联系我们</h2>
        <p style={pStyle}>您可通过项目文档中提供的联系方式与我们取得联系，以行使权利或进行投诉与建议。</p>
      </div>
    </div>
  );
}

export default Privacy;


