# 通用职业路径拓扑生成器 (Career Graph Generator) - AI Skill

## 1. 业务背景与目标
为打造一个适用于全行业（不仅限于程序员，还包括销售、设计、医疗、教育、传统制造业等）的职业路径规划工具，我们需要摒弃写死的本地假数据，转而使用 LLM (如 Gemini) 结合用户的真实输入（画像），动态推演其真实的职业发展路径。

**核心要求：**
- **真实性**：输出符合行业现状的薪资范围、时间节点和里程碑。
- **针对性**：拒绝“学好基础”、“提高沟通能力”等假大空的废话，要求给出具体行业内的专业术语和行动点（如产品经理的“完成从0到1的商业化闭环”，医生的“完成规培并发表SCI”）。
- **通用性**：通过灵活的 Prompt 设计，适配所有可能的职业及学历背景。

---

## 2. 系统核心流程
1. **收集用户特征 (Identity Matrix)**：获取用户的当前职业 (Profession)、能力栈 (Skills)、学历 (Education)、性格特质 (Traits) 等。
2. **构建 Prompt 并调用 AI API**：将用户特征注入结构化 Prompt，请求 Gemini 接口。
3. **强制结构化 JSON 输出**：利用 Gemini 的 `responseSchema` 强制模型返回严格结构的 JSON，确保前端能稳定渲染节点（Node）。
4. **前端渲染与本地缓存**：前端解析 JSON，生成节点树；并将结果存储在缓存中（按用户信息做 Hash），避免重复请求消耗成本。

---

## 3. 给 AI 调用的核心 Skill (Prompt & JSON Schema)

### 3.1 System Prompt (系统指令)

你需要将以下内容作为大语言模型（LLM）的 \`systemInstruction\`：

\`\`\`text
你是一位深谙全球各行各业（涵盖互联网、金融、教育、医疗、传统制造、服务业等）职业发展与人力资源管理的“顶级职业规划架构师”。
你的任务是：根据用户提供的【当前职业特征】（如职位、掌握的技能、学历背景、性格），推演出一条真实、可落地、极具参考价值的 3个阶段 的职业发展发展路径。

【硬性规则】：
1. **千人千面，拒绝正确但无用的废话**：根据不同的职业属性提供极致专业的词汇。
   - 如果是厨师，应该提到“菜品研发”、“后厨成本管控”、“行政总厨”。
   - 如果是销售，应该提到“客情维护”、“大客户打单(KA)”、“区域销售总监”。
   - 如果是财务，应该提到“税务筹划”、“CMA/CPA考证”、“业财融合”。
2. **薪资范围要贴合市场现实**：如果不确定精确值，请给出行业中位数的合理预估（例如用 "¥ 15w - 25w" 或 "时薪 $30-$50" 等符合该岗位的表述）。
3. **行动点(Items)必须可被量化或验证**：不要写“提高管理能力”，要写“独立带领 5 人以上团队完成项目交付”；不要写“深入学习”，要写“掌握高并发架构设计及调优”。
4. **必须输出严格的 JSON 格式**：严格遵守定义的 Schema。
\`\`\`

### 3.2 User Prompt (用户输入)
每次生成时，发送以下格式的数据：

\`\`\`json
{
  "currentUserProfile": {
    "profession": "用户当前填写的职业名称",
    "skills": "填写的技能或专长",
    "education": "学历背景",
    "traits": "性格特质"
  }
}
\`\`\`

### 3.3 强制 JSON Schema 定义 (供代码调用)

在调用 Gemini API 时，传入这个 Schema 限制格式（使用 `responseSchema` 或 `function parameters`）：

\`\`\`json
{
  "type": "object",
  "properties": {
    "careerNodes": {
      "type": "array",
      "description": "通常包含3个节点：当前层级强化、中期突破点（1-3年）、长线远景（3-5年及以上）",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "节点名称，如 'P7 技术专家' 或 '区域销售总监' 或 '资深主治医师'"
          },
          "target": {
            "type": "string",
            "description": "该阶段的核心目标一句话总结"
          },
          "timeframe": {
            "type": "string",
            "description": "时间预期，如 '当前能力圈', '1-3年路径', '3-5年远景'"
          },
          "salary": {
            "type": "string",
            "description": "符合现实预期的市场薪资参考范围，如 '15k - 25k/月' 或 '年包 50w-80w'"
          },
          "colorTheme": {
            "type": "string",
            "enum": ["cyan", "purple", "emerald"],
            "description": "主题色：第一阶段用 cyan，第二阶段用 purple，第三阶段用 emerald"
          },
          "items": {
            "type": "array",
            "description": "该阶段必须要达成的 2-3 个具体且专业的关键里程碑或行动指南",
            "items": {
              "type": "object",
              "properties": {
                "text": { "type": "string", "description": "具体的行动或里程碑要求" },
                "status": { 
                  "type": "string", 
                  "enum": ["done", "current", "pending"],
                  "description": "如果是当前阶段已经达成的是done，正需要做的是current，未来做的是pending"
                }
              },
              "required": ["text", "status"]
            }
          }
        },
        "required": ["title", "target", "timeframe", "salary", "colorTheme", "items"]
      }
    },
    "actionGuide": {
      "type": "string",
      "description": "一段50-100字的总结性建议：根据用户的性格特质和学历背景，分析其职业路径中的隐性优势或需要避坑的地方。"
    }
  },
  "required": ["careerNodes", "actionGuide"]
}
\`\`\`

---

## 4. 后续开发沟通点
1. **API 支持**：我们将引入 `@google/genai`，需要在 `.env` 配置 `GEMINI_API_KEY`，并在 Express 后端写一个 `/api/career-plan` 的 API 接口。
2. **UI 改造**：前端已经搭建好了基础样式（Timeline, Nodes, Action Guide），我们将前端的数据源从现在的 mock array 切换为向服务器请求的动态 JSON。
3. **缓存机制**：为了节省 token 成本与请求时间（AI生成可能需要几秒钟），我们在前端将针对 `profession + skills` 这几个维度做 `localStorage` 缓存。当且仅当发生变化，或者用户主动点击“重新推演”时，再真正调用接口。

请问这份底层逻辑设计与数据模型方案你认可吗？如果确认，我可以开始实现后端的 AI 接口和前端的数据对接。
