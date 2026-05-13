import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  const db = await mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
  });
  
  await db.execute('TRUNCATE TABLE qb_interviews');
  await db.execute('TRUNCATE TABLE qb_companies');
  
  await db.execute(`
    INSERT INTO qb_interviews (title, company, position, tags, accesses, days_ago, content) VALUES
    ('字节跳动智能体研发一/二面面经 (2025最新)', '字节跳动', 'ai智能体研发', '["字节", "AI", "Agent", "全栈工程师"]', '12.4k', 2, '# 字节跳动AI智能体研发面经 (2025最新)\n\n## 一面 (基础探底)\n- **考察重点**：AI基础，Prompt工程，LLM Agent框架。\n- **手写题**：手写一个基于LangChain的任务拆解工具。\n- **问答**：Langchain和LlamaIndex的区别？什么是ReAct框架？\n\n## 二面 (项目深度)\n- **考察重点**：大模型落地场景，RAG全血链路，全栈开发。\n- **实战**：如何解决幻觉问题？向量数据库选型(Milvus/Qdrant)？\n- **架构**：全栈角度，如果让你实现一个实时打字回复的AI聊天UI，你的Server-Sent Events怎么设计？\n\n## 总结\n要有将AI与实际工程化落地的能力，对全栈要求高。'),
    ('阿里通义千问团队：AI全栈架构师一面', '阿里巴巴', '全栈工程师', '["阿里", "全栈", "AI智能体"]', '8.2k', 5, '# 阿里通义团队AI全栈一面\n\n## 背景\n面试官看重整体落地能力，包括前端构建交互UI和后端对接LLM推理。\n\n## 核心问题\n1. **大视野**：谈谈你对未来 AI Agent 发展趋势的理解？\n2. **RAG 挑战**：当检索出来的文档非常庞大，超过了模型Context窗口，你如何做 rerank 或截断缩放？\n3. **系统稳定性**：在流式输出(Streaming)时，如果网络中断如何做断点续传或重试恢复？\n\n## 总结\n不仅要懂怎么调用API，更要懂得如何围绕API搭建高可用服务。'),
    ('腾讯混元大模型落地实习生：Agent与插件开发', '腾讯', 'ai智能体实习生', '["腾讯", "Agent", "插件"]', '15.1k', 8, '# 腾讯混元AI落地实习一面\n\n## 考察内容\n主要是智能体插件和工作流设计。\n- **API设计**：给出一个查询天气的需求，如何编写标准OpenAPI Schema让模型能够稳定调取？\n- **Function Calling**：了解主流模型Function calling机制的区别吗？\n- **系统设计**：如何设计多Agent协同工作流解决复杂自动化运维问题？'),
    ('美团大模型平台研发面经', '美团', 'AI后端工程师', '["美团", "AI后端", "全栈"]', '9.3k', 12, '# 美团大模型平台研发\n\n## 面试回顾\n- **场景题**：假设我们需要做一个外卖推荐Copilot，如何将用户的自然语言需求转为我们内部的推荐策略打分？\n- **性能优化**：并行推理的KV Cache机制了解过吗？\n- **中间件**：Redis在RAG系统中有哪些发挥空间(如Semantic Cache)？\n- **消息队列**：对于慢速生成任务，异步队列怎么设计？'),
    ('百度文心一言前端开发面经（长文本挑战）', '百度', '全栈工程师', '["百度", "前端", "大模型", "性能优化"]', '21.3k', 3, '# 百度文心一言前端面经\n\n## 背景与考点\n百度这里极其看重对于超大文本、超长上下文展示的性能优化。面试官深入探讨了如何在浏览器中高效渲染上万字的 markdown。\n\n## 一面核心问题\n1. **长列表虚拟滚动**：如果你需要展示一个 10万 token 的对话历史，浏览器 DOM 肯定会卡顿，如何设计一个支持可变高度的虚拟列表 (Virtual List)？在React中具体怎么实现？\n\n2. **Markdown 渐进式渲染**：服务器通过 SSE (Server-Sent Events) 不断推送 Token，如果每次都把全部文本交给 marked 或 react-markdown 解析，会有严重的性能瓶颈（O(N^2) 复杂度），怎么解决？（答：使用防抖、或者增量AST解析策略，或者只解析最后一小段，前面的内容缓存为静态DOM）\n\n3. **Web Worker**：如何使用 Web Worker 将 Markdown 到 HTML 的解析过程移出主线程，避免阻塞 UI 渲染？\n\n## 二面系统设计题\n- **多模态编辑器**：如果要在网页实现一个类似 Notion 的 AI 写作助手。你能随意在一段文字中间 /AI 唤起面板，要求生成内容后能够直接以流式的形式嵌入到光标所在的位置。请设计底层的数据结构。\n- **回答思路**：参考 ProseMirror 或 Slate.js 的 Block-based AST 结构，定义特定的 block type 比如 \`ai_generating_block\`。\n\n## 总结\n考察了极其扎实的前端基础以及与 AI 结合时的特殊性能挑战，很硬核。'),
    ('京东购物助手AI智能体研发面经', '京东', 'ai智能体研发', '["京东", "购物AI", "Agent", "记忆机制"]', '17.6k', 1, '# 京东购物智能体研发(架构深度)\n\n## 背景介绍\n京东在尝试将商品搜索引擎转化为对话式导购智能体。这要求系统既懂用户（记忆），又懂商品（知识图谱和RAG），并且能执行工具调用（下单/查库存）。\n\n## 面评与核心挑战剖析\n\n### 1. 长期记忆机制的设计\n面试官给了一个场景：用户一个月前说他喜欢穿舒适的运动鞋，今天让推荐一双鞋。系统该怎么把两者联系起来？\n- **探讨**：基于 Mem0 架构或者传统的长期用户画像数据库（Profile DB），结合大模型的 Entity Extraction（实体抽取）。把用户的偏好提取成 \`Key-Value\` 持久化，在生成推荐 Prompt 时动态注入。\n\n### 2. 工具调用的准确性(Tool Use)\n- 模型在面对几十个API（查物流、查价格、加入购物车、申请退款）时，经常调用错API参数。如何提高 Function Calling 的准确率？\n- **解答**：引入中间层校验，或者使用分层路由。先由一个小模型/分类器判断用户指令属于哪个 Domain（如订单域、商品域），然后再只暴露对应 Domain 的 3-5 个工具给主要的大模型，极大降低模型的决策空间。\n\n### 3. 多轮交互的打断问题\n如果生成回答的过程中，用户又发了新消息，如何优雅地中断生成并处理新需求？\n- 流式响应断开链接，服务端要能够捕捉到客户端的 \`AbortController\` 的中断信号，及时停止对底层模型推理服务的调用，节约算力成本。\n\n## 后续总结\n整体偏向业务架构落地，考察如何把一个“玩具 Agent”变成高频并发现网环境中稳定运行的“工业级 Agent”。')
  `);
  
  await db.execute(`
    INSERT INTO qb_companies (name, industry, description, tags, hotness) VALUES
    ('字节跳动 (ByteDance)', '互联网 / AI', '全球领先的短视频和内容推荐平台，大量投入在AI大语言模型和Agent智能体开发平台。', '["大厂", "AI应用", "ai智能体"]', '99.9k'),
    ('阿里巴巴 (Alibaba)', '电商 / AI', '通义千问系列模型加持，看重AI全栈及智能交互落地经验。', '["P7+", "全栈工程师", "通义"]', '95.2k'),
    ('腾讯 (Tencent)', '社交 / AI智能体', '混元大模型落地项目多，注重协同场景和插件开发体系。', '["鹅厂", "ai智能体", "WLB"]', '92.1k')
  `);

  console.log("Seeding complete");
  process.exit(0);
}
seed();
