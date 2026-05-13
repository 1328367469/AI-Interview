import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // MySQL Connection Pool

  let pool: mysql.Pool | null = null;

  function getPool() {
    if (!pool) {
      const config = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: parseInt(process.env.MYSQL_PORT || "3306"),
      };

      if (!config.host || !config.user || !config.password || !config.database) {
        console.warn("MySQL configuration is missing. Database features will be unavailable.");
        return null;
      }

      pool = mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    return pool;
  }

  // Initialize Tables
  async function initDb() {
    const db = getPool();
    if (!db) return;

    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_id VARCHAR(255) PRIMARY KEY,
          habits TEXT,
          preferences TEXT,
          profession TEXT,
          skills TEXT,
          education TEXT,
          certifications TEXT,
          traits TEXT,
          interests TEXT,
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Migration: Add new columns if the table was created before they were added
      const newColumns = ['profession', 'skills', 'education', 'certifications', 'traits', 'interests'];
      for (const col of newColumns) {
        try {
          await db.execute(`ALTER TABLE user_profiles ADD COLUMN ${col} TEXT`);
        } catch (e: any) {
          if (e.code !== 'ER_DUP_FIELDNAME') {
            console.warn(`Note: Could not add column ${col} (may already exist or other error):`, e.message);
          }
        }
      }

      await db.execute(`
        CREATE TABLE IF NOT EXISTS chat_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(255),
          role ENUM('user', 'assistant'),
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Question Bank tables
      await db.execute(`
        CREATE TABLE IF NOT EXISTS qb_interviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          company VARCHAR(100),
          position VARCHAR(100),
          tags JSON,
          accesses VARCHAR(50),
          days_ago INT,
          content TEXT
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS qb_companies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          industry VARCHAR(100),
          description TEXT,
          tags JSON,
          hotness VARCHAR(50)
        )
      `);

      // Seed mock data for interviews if empty
      const [qb_interviews]: any = await db.execute("SELECT COUNT(*) as count FROM qb_interviews");
      if (qb_interviews[0].count === 0) {
        await db.execute(`
          INSERT INTO qb_interviews (title, company, position, tags, accesses, days_ago, content) VALUES
          ('字节跳动前端一/二/三面面经 (2025最新)', '字节跳动', '前端工程师', '["字节", "前端", "REACT", "HARD"]', '12.4k', 2, '本文记录了完整的三面技术考核：\\n一面主要考察JS基础（原型链、闭包、EventLoop）和一道手写防抖函数。\\n二面侧重React原理（Fiber架构、Hooks实现）以及前端性能优化实战，包括监控SDK的封装。\\n三面（主管面）主要交流了过往项目中最难的技术挑战、架构选型对比以及未来的职业规划。'),
          ('阿里淘天架构师一面：被微前端按在地上摩擦', '阿里巴巴', '架构师', '["阿里", "架构", "微前端"]', '8.2k', 5, '这篇面经详细记录了被面试官“按在地上摩擦”的经历。\\n主要被深挖了 qiankun 的底层沙箱隔离原理（Proxy Sandbox 与 Snapshot Sandbox 的区别与降级策略），在样式隔离方面如何解决动态加载的外联样式冲突，以及微前端模式下全局状态管理的最佳实践。\\n最后谈到了基座工程的性能瓶颈。'),
          ('腾讯实习生面试：深入理解V8引擎工作原理', '腾讯', '前端实习生', '["腾讯", "V8", "引擎", "底层"]', '15.1k', 8, '主要考察了V8引擎的内存管理机制、垃圾回收（Scavenge与Mark-Sweep/Mark-Compact算法的区别）、隐藏类（Hidden Classes）和内联缓存（Inline Caching）对执行效率的提升，以及Turbofan编译器的优化机制。面试官要求结合一段实际的JS代码讲解如何使得V8更高效地编译运行。')
        `);
      }

      // Seed mock data for companies if empty
      const [qb_companies]: any = await db.execute("SELECT COUNT(*) as count FROM qb_companies");
      if (qb_companies[0].count === 0) {
        await db.execute(`
          INSERT INTO qb_companies (name, industry, description, tags, hotness) VALUES
          ('字节跳动 (ByteDance)', '互联网 / AI', '全球领先的短视频和内容推荐平台，技术栈偏向 React / Golang，面试难度极高，极其看重算法与底层原理。', '["大厂", "高薪", "算法"]', '99.9k'),
          ('阿里巴巴 (Alibaba)', '电商 / 云计算', '国内最大的电商及云计算服务商，淘天集团侧重于微前端与极致的性能优化体验。', '["P7+", "架构", "电商"]', '95.2k'),
          ('腾讯 (Tencent)', '社交 / 游戏', 'WXG与PCG是两大核心阵地。注重基础架构的稳定性以及对网络协议、操作系统的深刻掌握。', '["鹅厂", "基础架构", "WLB"]', '92.1k')
        `);
      }

      await db.execute(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
          id INT AUTO_INCREMENT PRIMARY KEY,
          pattern VARCHAR(255),
          response TEXT,
          hits INT DEFAULT 0
        )
      `);

      // Seed initial data
      try {
        const [kbRows]: any = await db.execute("SELECT COUNT(*) as count FROM knowledge_base");
        if (kbRows[0].count === 0) {
          await db.execute("INSERT INTO knowledge_base (pattern, response) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)", [
            "面试技巧", "面试成功的核心在于：1. 充分的准备；2. 准确的自我表达（STAR原则）；3. 积极的工作态度。",
            "薪资谈话", "面谈薪资时，建议先了解行业平均水平，并结合自身能力、市场稀缺度以及岗位的预期价值，进行有理有据地谈判。",
            "自我介绍", "自我介绍应控制在3分钟内，建议结构：1. 我是谁（核心标签）；2. 我做过什么最牛的事（业绩亮点）；3. 我为什么适合并渴望这个岗位。",
            "离职原因", "回答离职原因时，需坚守“正向表述与客观归因”原则。避免主观抱怨前东家，而是将重点聚焦于自我诉求的升级（例如：寻求更大的业务盘子、渴望深入某种技术栈）或与贵公司的双向奔赴。",
            "职业规划", "职业规划应当分层陈述：短期（1-2年内快速融入并独立负责核心业务）、中期（3-5年内成为领域专家或带领团队）。核心在于展示你的成长曲线与公司发展路径的耦合度。"
          ]);
          console.log("Knowledge base seeded.");
        }
      } catch (e) {
        console.warn("Could not seed KB, skipping...");
      }

      await db.execute(`
        CREATE TABLE IF NOT EXISTS config (
          key_name VARCHAR(255) PRIMARY KEY,
          value TEXT
        )
      `);

      console.log("Database tables initialized.");
    } catch (err) {
      console.error("Database initialization failed:", err);
    }
  }

  await initDb();

  app.use(express.json());

  // API to update config (like DeepSeek Key)
  app.post("/api/config", async (req, res) => {
    const { key, value } = req.body;
    const db = getPool();
    if (!db) return res.status(500).json({ status: "error", message: "Database error" });

    try {
      await db.execute("INSERT INTO config (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?", [key, value, value]);
      if (key === "DEEPSEEK_API_KEY") {
        process.env.DEEPSEEK_API_KEY = value;
      }
      res.json({ status: "ok" });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  app.get("/api/config/:key", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(500).json({ status: "error", message: "Database error" });

    try {
      const [rows]: any = await db.execute("SELECT value FROM config WHERE key_name = ?", [req.params.key]);
      res.json({ value: rows[0]?.value || "" });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  app.get("/api/history/:userId", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(500).json({ status: "error", message: "Database error" });

    try {
      const [rows]: any = await db.execute("SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at ASC LIMIT 100", [req.params.userId]);
      res.json({ history: rows });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  // Question Bank APIs
  app.get("/api/qb/interviews", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(500).json({ status: "error", message: "Database error" });
    const search = req.query.q ? `%${req.query.q}%` : '%';
    
    try {
      const [rows]: any = await db.execute("SELECT * FROM qb_interviews WHERE title LIKE ? OR company LIKE ? OR tags LIKE ? ORDER BY days_ago ASC", [search, search, search]);
      res.json({ interviews: rows });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  app.get("/api/qb/companies", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(500).json({ status: "error", message: "Database error" });
    const search = req.query.q ? `%${req.query.q}%` : '%';
    const profile = req.query.profile ? `%${req.query.profile}%` : null;
    const skills = req.query.skills ? `%${req.query.skills}%` : null;
    
    try {
      let query = "SELECT * FROM qb_companies WHERE (name LIKE ? OR industry LIKE ? OR tags LIKE ?)";
      let params = [search, search, search];

      if (profile && skills) {
        query += " AND (industry LIKE ? OR tags LIKE ? OR industry LIKE ? OR tags LIKE ?)";
        params.push(profile, profile, skills, skills);
      } else if (profile) {
        query += " AND (industry LIKE ? OR tags LIKE ?)";
        params.push(profile, profile);
      } else if (skills) {
        query += " AND (industry LIKE ? OR tags LIKE ?)";
        params.push(skills, skills);
      }
      
      query += " ORDER BY id ASC";
      const [rows]: any = await db.execute(query, params);
      res.json({ companies: rows });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  app.get("/api/profile/:userId", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(500).json({ status: "error", message: "Database error" });

    try {
      const [rows]: any = await db.execute("SELECT * FROM user_profiles WHERE user_id = ?", [req.params.userId]);
      res.json({ profile: rows[0] || {} });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  app.post("/api/profile/:userId", async (req, res) => {
    const db = getPool();
    if (!db) return res.status(500).json({ status: "error", message: "Database error" });

    try {
      const { profile } = req.body;
      const updates = [];
      const values = [];
      const keys = ['profession', 'skills', 'education', 'certifications', 'traits', 'interests', 'habits', 'preferences'];
      
      for (const key of keys) {
        if (profile[key] !== undefined) {
          updates.push(`${key} = ?`);
          values.push(profile[key]);
        }
      }
      
      if (updates.length > 0) {
        values.push(req.params.userId);
        const [existing]: any = await db.execute("SELECT 1 FROM user_profiles WHERE user_id = ?", [req.params.userId]);
        if (existing.length > 0) {
          await db.execute(`UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = ?`, values);
        } else {
          const cols = updates.map(u => u.split(' =')[0]);
          const qMarks = cols.map(() => '?');
          await db.execute(`INSERT INTO user_profiles (user_id, ${cols.join(', ')}) VALUES (?, ${qMarks.join(', ')})`, [req.params.userId, ...values.slice(0, -1)]);
        }
      }
      res.json({ status: "ok" });
    } catch (err: any) {
      console.error("Profile update error:", err);
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  // API routes
  app.get("/api/db-test", async (req, res) => {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(500).json({ status: "error", message: "Database configuration missing" });
    }

    try {
      const [rows] = await dbPool.query("SELECT 1 as result");
      res.json({ status: "ok", message: "Database connection successful", data: rows });
    } catch (error: any) {
      console.error("Database error:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "missing text" });

      const apiUrl = 'https://api.siliconflow.cn/v1/audio/speech';
      const apiKey = process.env.SILICONFLOW_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "TTS API Error: API Key not configured." });
      }

      const response = await axios.post(apiUrl, {
        model: 'FunAudioLLM/CosyVoice2-0.5B',
        input: text,
        voice: 'FunAudioLLM/CosyVoice2-0.5B:alex',
        response_format: 'mp3'
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      });

      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(response.data);
    } catch (e: any) {
      console.error("TTS API Error:", e.response?.data?.toString() || e.message);
      res.status(500).json({ status: "error", message: "Failed to generate TTS" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const { message, userId = "default_user", profileOverride, isInterviewMode } = req.body;
    const db = getPool();

    if (!db) {
      return res.status(500).json({ status: "error", message: "Database error" });
    }

    try {
      // 1. Memory: Get User Profile & History
      const [profiles]: any = await db.execute("SELECT * FROM user_profiles WHERE user_id = ?", [userId]);
      const dbProfile = profiles[0] || {};
      const profile = { ...dbProfile, ...(profileOverride || {}) };

      const [history]: any = await db.execute(
        "SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 6",
        [userId]
      );
      const chatContext = history.reverse();

      // 2. Knowledge Base: Check for hits (skip in interview mode)
      if (!isInterviewMode) {
        const [hits]: any = await db.execute(
          "SELECT response FROM knowledge_base WHERE ? LIKE CONCAT('%', pattern, '%') LIMIT 1",
          [message]
        );

        if (hits.length > 0) {
          const responseText = hits[0].response;
          // Save to history
          await db.execute("INSERT INTO chat_history (user_id, role, content) VALUES (?, 'user', ?), (?, 'assistant', ?)", 
            [userId, message, userId, responseText]);

          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: responseText } }] })}\n\n`);
          res.write('data: [DONE]\n\n');
          return res.end();
        }
      }

      // 3. AI: Call DeepSeek
      const apiKey = process.env.SILICONFLOW_API_KEY || process.env.DEEPSEEK_API_KEY;
      const apiUrl = process.env.SILICONFLOW_API_KEY 
        ? (process.env.SILICONFLOW_API_URL || "https://api.siliconflow.cn/v1") 
        : (process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1");
      const modelName = process.env.SILICONFLOW_API_KEY ? "deepseek-ai/DeepSeek-V3" : "deepseek-chat";

      if (!apiKey) {
        return res.status(500).json({ status: "error", message: "DeepSeek/SiliconFlow API key not configured" });
      }

      let systemPrompt = "";
      if (isInterviewMode) {
        systemPrompt = `[NEXUS_AI 严厉面试官 核心智能协议]
你是硅谷顶级科技公司的资深技术面试官。现在正在对候选人进行技术与综合能力面试。
【输出要求】
1. 极度凝练：直接提问或追问，绝对不出现寒暄、废话、打招呼或总结回答的废话。主要说面试话术。
2. 绝对禁止限制：向候选人提问时，绝对不要提出诸如“请在x分钟内回答”、“限x字以内”等任何形式的时间或字数限制。
3. 压迫感与犀利：如果候选顾左右而言他、回答肤浅，请直白指出并深入【追问底层原理】或【项目细节】。
4. 结合画像提问：必须依据用户的简历信息和核心技能（如项目经验）进行提问。例：“看您的简历提到熟悉xxx，请描述你在该项目中具体负责了哪个核心模块？”
5. 追根究底：不要轻易放过用户，一定要挖掘出真实水平，直到用户无法回答为止再切换下一个知识点。
6. 终止面试：如果你通过对话判断出用户毫无面试意愿（如恶语相向、明确表示不想面了、或者一直沉默答非所问无法继续），你可以直接说“既然你没有准备好/没有面试意愿，本次面试到此结束。”并在回答最后附上代码标志：[INTERVIEW_ENDED]

【系统认知：用户记忆模块库】
- 职业目标：${profile.profession || "未知"}
- 核心技能：${profile.skills || "未知"}
- 教育经历：${profile.education || "未知"}
- 证书资质：${profile.certifications || "未知"}
- 性格特点：${profile.traits || "未知"}

近期对话上下文：
${chatContext.map((c: any) => `${c.role === 'user' ? 'User' : 'Interviewer'}: ${c.content}`).join("\n")}
`;
      } else {
        systemPrompt = `[NEXUS_AI 职业顾问 核心智能协议]
你是一个高级专家级智能职业规划与成长助手 NEXUS_AI。我们要求【极速且精品】的输出。

【输出排版标准 - 极速精品模式】
1. 极度凝练：总字数严格控制在300字以内，必须字字珠玑，直击痛点，拒绝任何车轱辘话和无效客套。
2. 结构化：使用大标题（#）、小标题（##）和无序列表（-）。
3. 一针见血：按“背景诊断 -> 核心解法 (实战技巧) -> 避坑指南”展示逻辑。

【系统认知：用户记忆模块库】
当前系统实时读取到的用户画像数据如下：
- 职业目标：${profile.profession || "未知"}
- 核心技能：${profile.skills || "未知"}
- 教育经历：${profile.education || "未知"}
- 证书资质：${profile.certifications || "未知"}
- 性格特点：${profile.traits || "未知"}
- 兴趣习惯：${profile.interests || profile.habits || "未知"}
- 其他偏好：${profile.preferences || "未知"}

近期对话上下文：
${chatContext.map((c: any) => `${c.role === 'user' ? 'User' : 'Nexus'}: ${c.content}`).join("\n")}

【行为准则】
1. 自适应匹配：基于[系统认知]重度定制化你的解答。
2. 缺失数据探查：若缺乏提供精准方案的核心数据，在回答页尾附带一个问题向用户索取。`;
      }

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const aiResponse = await axios.post(`${apiUrl}/chat/completions`, {
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        stream: true,
        max_tokens: 600
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        responseType: 'stream'
      });

      let fullResponse = "";
      let buffer = "";

      aiResponse.data.on('data', (chunk: Buffer) => {
         // Pass raw bytes to client
         res.write(chunk);
         
         const chunkStr = chunk.toString('utf-8');
         buffer += chunkStr;
         
         let newlineIndex;
         while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
               try {
                  const data = JSON.parse(line.slice(6));
                  const content = data.choices[0]?.delta?.content || "";
                  fullResponse += content;
               } catch (e) {}
            }
         }
      });

      aiResponse.data.on('end', async () => {
         res.end();

         // 4. Update Memory (History)
         try {
           await db.execute("INSERT INTO chat_history (user_id, role, content) VALUES (?, 'user', ?), (?, 'assistant', ?)", 
             [userId, message, userId, fullResponse]);
         } catch (e) {
             console.error("History saving failed", e);
         }

          // Extract Profile JSON Asynchronously (Optimization)
          try {
             const extractPrompt = `提取用户新画像信息。
现有信息：
职业：${profile.profession || ""}
技能：${profile.skills || ""}
教育：${profile.education || ""}
特征：${profile.traits || ""}

近期对话：
User: ${message}
AI: ${fullResponse}

若在这段对话中推理出了新的关于用户的明确职业、技能、教育、性格等信息，请输出以下JSON。如果没有提取到增量有效信息，只输出 {}。不要输出其它任何内容。
{
  "profession": "如果有更新的值",
  "skills": "如果有更新的值",
  "education": "如果有更新的值",
  "certifications": "如果有更新的值",
  "traits": "如果有更新的值",
  "interests": "如果有更新的值"
}`;
             const extResponse = await axios.post(`${apiUrl}/chat/completions`, {
                 model: modelName,
                 messages: [{ role: "user", content: extractPrompt }],
                 response_format: { type: "json_object" }
             }, {
                 headers: {
                     "Authorization": `Bearer ${apiKey}`,
                     "Content-Type": "application/json"
                 }
             });

             const newProfileData = JSON.parse(extResponse.data.choices[0].message.content);
             const updates = [];
             const values = [];
             for (const key of ['profession', 'skills', 'education', 'certifications', 'traits', 'interests']) {
               if (newProfileData[key] && newProfileData[key] !== "如果有更新的值" && !newProfileData[key].includes("如果有更新") && newProfileData[key] !== "如果有更新") {
                 updates.push(`${key} = ?`);
                 values.push(newProfileData[key]);
               }
             }
             if (updates.length > 0) {
               values.push(userId);
               const [existing]: any = await db.execute("SELECT 1 FROM user_profiles WHERE user_id = ?", [userId]);
               if (existing.length > 0) {
                 await db.execute(`UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = ?`, values);
               } else {
                 const cols = updates.map(u => u.split(' =')[0]);
                 const qMarks = cols.map(() => '?');
                 await db.execute(`INSERT INTO user_profiles (user_id, ${cols.join(', ')}) VALUES (?, ${qMarks.join(', ')})`, [userId, ...values.slice(0, -1)]);
               }
             }
          } catch (e) {
             console.error("Background profile extraction failed", e);
          }
      });

    } catch (error: any) {
      console.error("Chat error:", error.message, error.response?.statusText);
      res.status(500).json({ status: "error", message: "Chat service unavailable" });
    }
  });

  app.post("/api/career-plan", async (req, res) => {
    try {
      const { currentUserProfile } = req.body;
      const apiKey = process.env.SILICONFLOW_API_KEY || process.env.DEEPSEEK_API_KEY;
      const apiUrl = process.env.SILICONFLOW_API_KEY 
        ? (process.env.SILICONFLOW_API_URL || "https://api.siliconflow.cn/v1") 
        : (process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1");
      const modelName = process.env.SILICONFLOW_API_KEY ? "deepseek-ai/DeepSeek-V3" : "deepseek-chat";

      if (!apiKey) {
        return res.status(500).json({ error: "DeepSeek/SiliconFlow API key not configured. Check .env" });
      }

      const systemInstruction = `你是一位深谙全球各行各业（涵盖互联网、金融、教育、医疗、传统制造、服务业等）职业发展与人力资源管理的“顶级职业规划架构师”。
你的任务是：根据用户提供的【当前职业特征】（如职位、掌握的技能、学历背景、性格），推演出一条真实、可落地、极具参考价值的 3个阶段 的职业发展发展路径。

【硬性规则】：
1. 千人千面，拒绝正确但无用的废话：根据不同的职业属性提供极致专业的词汇。
   - 如果是厨师，应该提到“菜品研发”、“后厨成本管控”、“行政总厨”。
   - 如果是销售，应该提到“客情维护”、“大客户打单(KA)”、“区域销售总监”。
   - 如果是财务，应该提到“税务筹划”、“CMA/CPA考证”、“业财融合”。
2. 薪资范围要贴合市场现实：如果不确定精确值，请给出行业中位数的合理预估（例如用 "¥ 15w - 25w" 或 "时薪 $30-$50" 等符合该岗位的表述）。
3. 行动点(Items)必须可被量化或验证：不要写“提高管理能力”，要写“独立带领 5 人以上团队完成项目交付”；不要写“深入学习”，要写“掌握高并发架构设计及调优”。
4. 必须输出严格的 JSON 格式，如下所示：
{
  "careerNodes": [
    {
      "title": "节点名称(例: P7 技术专家)", "target": "阶段核心目标一句话", "timeframe": "时间预期", 
      "salary": "薪资范围", "colorTheme": "cyan或purple或emerald",
      "items": [{"text": "达成具体目标", "status": "done/current/pending"}]
    }
  ],
  "actionGuide": "一段50-100字的隐性优势或避坑总结"
}`;

      const prompt = `分析下列用户画像并生成规划，严格输出以上定义的 JSON 格式:
${JSON.stringify({ currentUserProfile }, null, 2)}`;

      const aiResponse = await axios.post(`${apiUrl}/chat/completions`, {
        model: modelName,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      const resultText = aiResponse.data.choices[0].message.content;
      const resultObj = JSON.parse(resultText);

      res.json(resultObj);
    } catch (e: any) {
      console.error("Career plan AI error:", e.response?.data || e.message);
      res.status(500).json({ error: e.message || "Failed to generate plan" });
    }
  });

  app.post("/api/generate-report", async (req, res) => {
    try {
      const { userId = "user_123", interviewResult } = req.body;
      const apiKey = process.env.SILICONFLOW_API_KEY || process.env.DEEPSEEK_API_KEY;
      const apiUrl = process.env.SILICONFLOW_API_KEY 
        ? (process.env.SILICONFLOW_API_URL || "https://api.siliconflow.cn/v1") 
        : (process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1");
      const modelName = process.env.SILICONFLOW_API_KEY ? "deepseek-ai/DeepSeek-V3" : "deepseek-chat";

      if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
      }

      const db = getPool();
      let chatRecords = "暂无实际对话数据。";
      if (db) {
        const [historyRows]: any = await db.query(
          "SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY created_at ASC LIMIT 100", 
          [userId]
        );
        if (historyRows && historyRows.length > 0) {
          chatRecords = historyRows.map((r: any) => `${r.role}: ${r.content}`).join("\n");
        }
      }

      const prompt = `你是一位毫不留情、极度严厉的顶级科技公司技术面试官兼心理学专家。一场面试刚刚结束，请你根据真实面试对话上下文和生物特征数据，生成一份结构化的JSON格式《面试诊断报告》。

【核心原则】
1. 极度犀利：绝对不要讨好候选人！直接撕开伪装，精准挑出沟通、技术深度、逻辑表达中的毛病。
2. 毒舌且专业：如果回答很差，指出“极其肤浅”“背诵痕迹明显”“避重就轻”。如果很好，才给予符合事实的专业认可。
3. 真实数据驱动：必须紧扣对话记录生成扣分点，不要凭空捏造。

【近期对话上下文】:
${chatRecords}

【生物特征数据采集】:
压力指数：${interviewResult?.stress || 50}%
自信度：${interviewResult?.confidence || 80}%
持续时间：${interviewResult?.duration || 0}秒

请输出JSON结构，严格按照以下字典字段：
{
  "sysScore": 85,
  "title": "高级专家级分析报告",
  "metrics": {
    "depth": 85,
    "breadth": 70,
    "logic": 90,
    "clarity": 88
  },
  "positives": ["优点1", "优点2"],
  "negatives": ["缺点1直击痛点", "缺点2毫不留情"],
  "suggestions": ["整改建议1", "整改建议2"],
  "behavioral": {
    "stability": "Stable / 稳定",
    "stabilityScore": 92,
    "integrity": "High / 极高",
    "integrityScore": 98,
    "details": [
       {"type": "positive", "label": "事实评价", "desc": "描述..."},
       {"type": "warning", "label": "犀利指出不足", "desc": "在核心问题上躲躲闪闪..."}
    ]
  }
}
要求：紧扣实际对话内容，不要夸大也不要讨好。数据严厉、专业。`;

      const aiResponse = await axios.post(`${apiUrl}/chat/completions`, {
        model: modelName,
        messages: [
           { role: "system", content: "You MUST output a valid JSON object only." },
           { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }, {
         headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }
      });

      const reportData = JSON.parse(aiResponse.data.choices[0].message.content || "{}");
      res.json(reportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Report generation failed" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (process.env.MYSQL_HOST) {
        console.log(`Attempting to connect to MySQL at ${process.env.MYSQL_HOST}`);
    }
  });
}

startServer();
