import React from 'react';

function Terms() {
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
        <h1 style={h1Style}>用户协议（中国大陆适用）</h1>
        <p style={pStyle}>生效日期：2025-09-22</p>
        <p style={pStyle}>
          欢迎使用本项目相关的产品与服务（下称“本服务”）。本《用户协议》（下称“本协议”）由您与服务提供方共同缔结，具有合同效力。请您在注册/使用本服务前，仔细阅读并充分理解本协议全部内容，特别是以加粗方式提示的条款。若您点击“同意”、完成注册或使用本服务，即视为您已阅读并同意本协议的全部内容。
        </p>

        <h2 style={h2Style}>一、主体信息与适用范围</h2>
        <p style={pStyle}>
          本协议适用于本项目“tofu-vtubia”相关的网页、后台管理端及其后续更新功能。若本服务中接入第三方服务（例如 B 站直播数据等），您还应遵守第三方的用户条款与规则。
        </p>

        <h2 style={h2Style}>二、账户注册与使用</h2>
        <ul style={ulStyle}>
          <li>您需依据页面提示完成注册，并以<strong>UID（须为您在哔哩哔哩平台绑定的 UID）</strong>作为唯一登录标识；UID 唯一且不可与他人共用。</li>
          <li>
            为验证账号归属，注册或找回/重置密码时，系统将要求您在<strong>指定直播间于 2 分钟内投喂名称包含“灯牌”的礼物</strong>，以完成所有权校验。
          </li>
          <li>您应当对账户项下的操作负责，妥善保管密码并在必要时及时修改。</li>
          <li>您承诺所提交信息真实、合法、有效，不得冒用或盗用他人身份、资料或权益。</li>
        </ul>

        <h2 style={h2Style}>三、用户行为规范</h2>
        <ul style={ulStyle}>
          <li>遵守中华人民共和国法律法规、政策及公序良俗；</li>
          <li>不发布、传输、存储违法、侵权、低俗或不当内容；</li>
          <li>不以任何方式干扰、破坏或试图未经授权访问本服务或相关系统；</li>
          <li>未经许可，不得对本服务进行反向工程、扫描、抓取、批量导出数据或用于商业化再分发。</li>
        </ul>

        <h2 style={h2Style}>四、服务与功能</h2>
        <p style={pStyle}>
          本服务包括但不限于帐号体系、登录/注册、管理后台、棉花糖/歌曲等功能，以及与 B 站直播礼物记录的聚合/统计显示能力。本服务可能因版本更新而调整，具体以实际提供为准。
        </p>

        <h2 style={h2Style}>五、第三方服务与数据来源</h2>
        <p style={pStyle}>
          本服务可能使用第三方提供的能力（例如数据库、对象存储、B 站相关数据接口或数据仓库）。第三方服务由第三方独立提供和负责，您在使用第三方服务时应额外遵守其条款与隐私政策。
        </p>

        <h2 style={h2Style}>六、知识产权</h2>
        <p style={pStyle}>
          本服务的软件、界面、功能和文档等相关内容的知识产权归属权利人所有。未经许可，您不得对本服务的任何内容进行复制、修改、传播、发行或用于商业用途。与您个人数据或合法内容相关的权利不因本协议而被转移。
        </p>

        <h2 style={h2Style}>七、免责声明与责任限制</h2>
        <ul style={ulStyle}>
          <li>本服务以“现状”提供，我们将尽商业上合理的努力保障服务稳定，但<strong>不对服务的绝对不中断、无错误或完全满足您的特定需求作出保证</strong>。</li>
          <li>因不可抗力、政策调整、第三方原因（含上游平台接口调整）等导致的服务中断、数据延迟或丢失，我们不承担相应责任，但将合理协助恢复。</li>
          <li>
            在适用法律允许的范围内，对因使用或无法使用本服务导致的任何间接、附带、惩罚性或特殊损害，本服务不承担责任；对可归责于我们的直接损失（如有），责任总额以您就相关服务支付的对价为限（多数情况下为免费）。
          </li>
        </ul>

        <h2 style={h2Style}>八、账户安全与处置</h2>
        <p style={pStyle}>如发现任何违法违规或违反本协议的行为，我们有权视情况采取包括但不限于警告、限制功能、冻结或注销账户等措施。</p>

        <h2 style={h2Style}>九、未成年人条款</h2>
        <p style={pStyle}>若您为未成年人，请在法定监护人指导下审阅并使用本服务，并获得其同意。</p>

        <h2 style={h2Style}>十、协议变更与通知</h2>
        <p style={pStyle}>
          我们可能根据法律法规变化或服务需要对本协议进行更新。重大变更将以显著方式提示（如页面公告、弹窗或站内信）。更新后继续使用即视为接受变更后的协议。
        </p>

        <h2 style={h2Style}>十一、争议解决</h2>
        <p style={pStyle}>
          本协议订立、效力、解释与争议解决适用中华人民共和国大陆地区法律。因本协议产生的争议，由本服务经营者所在地人民法院管辖。
        </p>

        <h2 style={h2Style}>十二、联系方式</h2>
        <p style={pStyle}>如对本协议有疑问或需要投诉、建议，您可通过项目文档中提供的联系方式与我们联络。</p>
      </div>
    </div>
  );
}

export default Terms;


